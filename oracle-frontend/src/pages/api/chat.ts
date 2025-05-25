import type { NextApiRequest, NextApiResponse } from 'next';

type MessageRequest = { message: string };
type MessageResponse = { reply: string };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<MessageResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const { message } = req.body as MessageRequest;

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ reply: 'Please send a non-empty message.' });
  }

  // For now, just echo back:
  return res.status(200).json({ reply: `🪞 You said: ${message}` });
}
