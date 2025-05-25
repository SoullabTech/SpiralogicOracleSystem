// server.js
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple “tool” function for use in function-calling
function getTimeTool({ timezone }) {
  try {
    return new Date().toLocaleString('en-US', { timeZone: timezone });
  } catch (err) {
    console.error(`Invalid timezone passed: ${timezone}`);
    return 'Invalid timezone.';
  }
}

app.get('/api/chat/stream', async (req, res) => {
  const userPrompt = req.query.prompt;

  if (!userPrompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  // — SSE setup —
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // in case you're behind a proxy

  // — Heartbeat to keep connection alive —
  const ping = setInterval(() => res.write(': ping\n\n'), 20000);

  try {
    const stream = await openai.chat.completions.create(
      {
        model: 'gpt-4o', // or fallback to gpt-4 or gpt-3.5-turbo
        stream: true,
        messages: [
          { role: 'system', content: 'You have a tool: getTime({timezone})' },
          { role: 'user', content: userPrompt },
        ],
        functions: [
          {
            name: 'getTime',
            description: 'Returns the current time in a given timezone',
            parameters: {
              type: 'object',
              properties: {
                timezone: {
                  type: 'string',
                  description: 'IANA timezone name, e.g. "Europe/London"',
                },
              },
              required: ['timezone'],
            },
          },
        ],
      },
      { responseType: 'stream' }
    );

    let fnCallArgs = '';

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta;

      if (!delta) continue;

      // Handle function call accumulation
      if (delta.function_call) {
        fnCallArgs += delta.function_call.arguments ?? '';
        continue;
      }

      // Handle completed function call and return result
      if (fnCallArgs && delta.content === undefined) {
        try {
          const args = JSON.parse(fnCallArgs);
          const output = getTimeTool(args);
          res.write(
            `data: ${JSON.stringify({ role: 'tool', name: 'getTime', text: output })}\n\n`
          );
        } catch (err) {
          console.error('Function call parsing error:', err);
          res.write(`data: ${JSON.stringify({ role: 'tool', error: 'Invalid arguments' })}\n\n`);
        }
        fnCallArgs = '';
        continue;
      }

      // Stream assistant's normal message
      if (delta.content) {
        res.write(
          `data: ${JSON.stringify({ role: 'assistant', text: delta.content })}\n\n`
        );
      }
    }

    res.write('event: done\ndata: {}\n\n');
  } catch (err) {
    console.error('Stream error:', err);
    res.write('event: error\ndata: {}\n\n');
  } finally {
    clearInterval(ping);
    res.end();
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🔮 Oracle API running on http://localhost:${PORT}`);
});
