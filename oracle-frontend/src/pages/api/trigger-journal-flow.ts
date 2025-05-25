// oracle-frontend/pages/api/trigger-journal-flow.ts

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { entry_text, user_id } = req.body;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL!;
    const response = await fetch(`${backendUrl}/api/adjuster/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_text, user_id }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Frontend API error:', err);
    res.status(500).json({ error: 'Frontend API error.' });
  }
}
