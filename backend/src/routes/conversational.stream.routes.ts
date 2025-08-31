import { Router, Request, Response } from "express";
import { routeToModel } from "../services/ElementalIntelligenceRouter";
import { safetyService } from "../services/SafetyModerationService";
import { logger } from "../utils/logger";

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

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
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

    // Route to the right upstream (Claude for air, Oracle/OpenAI for others)
    const model = routeToModel(element);

    // Check if model supports streaming
    if (!model.generateStreamingResponse) {
      // Fallback to regular response
      const response = await model.generateResponse({
        system: `You are Maya, a mystical oracle guide embodying the ${element} element. Provide wisdom that helps with personal transformation and spiritual growth.`,
        user: userText,
        temperature: 0.7,
        maxTokens: 300
      });
      
      // Send as single chunk
      send("delta", { text: response.content });
      send("done", { reason: "complete", metadata: { model: response.model, tokens: response.tokens } });
      res.end();
      return;
    }

    // Stream from the model with token-by-token delivery
    let totalText = '';
    let tokenCount = 0;

    // Heartbeat to prevent proxy timeouts
    const heartbeat = setInterval(() => send("heartbeat", { t: Date.now() }), 15000);

    try {
      const streamResponse = await model.generateStreamingResponse({
        system: `You are Maya, a mystical oracle guide embodying the ${element} element. 
                 Provide wisdom that helps with personal transformation and spiritual growth.
                 Keep responses natural, humane, and specific to their situation.`,
        user: userText,
        temperature: 0.7,
        maxTokens: 300
      }, (token: string) => {
        // Send each token as it arrives
        totalText += token;
        tokenCount++;
        send("delta", { text: token });
      });

      clearInterval(heartbeat);
      send("done", { 
        reason: "complete", 
        metadata: { 
          model: streamResponse.model, 
          tokens: streamResponse.tokens,
          processingTime: streamResponse.processingTime,
          totalText: totalText.length
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