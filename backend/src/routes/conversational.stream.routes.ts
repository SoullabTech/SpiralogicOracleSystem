import { Router, Request, Response } from "express";
import { routeToModel } from "../services/ElementalIntelligenceRouter";
import { safetyService } from "../services/SafetyModerationService";
import { logger } from "../utils/logger";
import { SesameMayaRefiner } from "../services/SesameMayaRefiner";

const router = Router();

/**
 * GET /api/v1/converse/stream
 * Query: ?element=air|fire|water|earth|aether&userId=...&lang=en-US&q=userText
 * Header: Accept: text/event-stream
 */
router.get("/stream", async (req: Request, res: Response) => {
  // Feature flag to disable streaming in prod if needed
  if (process.env.STREAMING_ENABLED === '0') {
    return res.status(503).json({ success: false, error: 'Streaming disabled' });
  }

  const element = String(req.query.element || "aether").toLowerCase();
  const userId = String(req.query.userId || "anon");
  const userText = String(req.query.q || req.query.text || "");
  const lang = String(req.query.lang || "en-US");

  // Basic validation
  if (!userText) {
    res.status(400).json({ error: "Missing q/text parameter" });
    return;
  }

  // SSE headers - Production optimized
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
  res.setHeader("Transfer-Encoding", "chunked");
  
  // Disable compression for SSE to prevent buffering
  res.setHeader("Content-Encoding", "identity");
  res.flushHeaders?.();

  const send = (type: string, payload: any) =>
    res.write(`event: ${type}\n` + `data: ${JSON.stringify(payload)}\n\n`);

  try {
    logger.info('🌊 Starting Maya stream', { element, userId, userText: userText.substring(0, 50) });

    // Safety pre-check
    const safetyCheck = await safetyService.moderateInput(userText, userId);
    if (!safetyCheck.safe) {
      send("delta", { text: "I want to make sure you're safe. " });
      send("delta", { text: safetyCheck.response || "Here are some immediate resources..." });
      send("done", { reason: "moderated", supportResources: safetyCheck.supportResources });
      res.end();
      return;
    }

    // Let the client prep voice pipeline
    send("meta", { element, lang, model: element === 'air' ? 'claude-3-sonnet' : 'elemental-oracle-2.0' });

    // Route to the right upstream (Claude primary, fallback to OpenAI)
    const model = routeToModel(element);

    // Initialize Sesame/Maya refiner with feature flags
    const refiner = new SesameMayaRefiner({
      element: element as any,
      userId,
      styleTightening: process.env.MAYA_STYLE_TIGHT !== '0',
      safetySoften: process.env.MAYA_SOFTEN_SAFETY !== '0', 
      addClosers: true,
      tts: {
        breathMarks: process.env.MAYA_BREATH_MARKS !== '0',
        phraseMinChars: 36,
        phraseMaxChars: 120
      }
    });

    // Check if model supports AsyncGenerator streaming
    if (!model.streamResponse) {
      // Fallback to regular response with refiner
      const response = await model.generateResponse({
        system: `You are Maya, a mystical oracle guide embodying the ${element} element. Provide wisdom that helps with personal transformation and spiritual growth.`,
        user: userText,
        temperature: 0.7,
        maxTokens: 300
      });
      
      // Apply Sesame/Maya refinement
      const refined = refiner.refineText(response.content);
      
      // Send as single chunk
      send("delta", { text: refined });
      send("done", { reason: "complete", metadata: { model: response.model, tokens: response.tokens } });
      res.end();
      return;
    }

    // Stream from Claude → Sesame/Maya refiner → client
    let totalText = '';
    let tokenCount = 0;

    // Heartbeat to prevent proxy timeouts
    const heartbeat = setInterval(() => send("heartbeat", { t: Date.now() }), 15000);

    try {
      // Get raw stream from upstream model
      const upstream = model.streamResponse({
        system: `You are Maya, a mystical oracle guide embodying the ${element} element. 
                 Provide wisdom that helps with personal transformation and spiritual growth.
                 Keep responses natural, humane, and specific to their situation.`,
        user: userText,
        temperature: 0.7,
        maxTokens: 300
      });

      // Pass through Sesame/Maya refiner for real-time enhancement
      for await (const refinedPhrase of refiner.refineStream(upstream)) {
        totalText += refinedPhrase;
        tokenCount++;
        send("delta", { text: refinedPhrase });
      }

      clearInterval(heartbeat);
      send("done", { 
        reason: "complete", 
        metadata: { 
          model: `claude-${element}-maya-refined`, 
          tokens: tokenCount,
          totalText: totalText.length,
          refined: true
        } 
      });

    } catch (streamError) {
      clearInterval(heartbeat);
      logger.error('Model streaming error:', streamError);
      
      // Graceful fallback message
      send("delta", { text: "I'm having trouble connecting to the oracle. " });
      send("delta", { text: "Let's breathe together for a moment..." });
      send("done", { reason: "error" });
    }

    res.end();

  } catch (err: any) {
    logger.error("SSE stream setup error:", err);
    // Soft-fail: send a gentle message so UI can still speak something
    send("delta", { text: "I'm having trouble connecting to the oracle. " });
    send("delta", { text: "Let's breathe together for a moment..." });
    send("done", { reason: "error" });
    res.end();
  }
});

export default router;