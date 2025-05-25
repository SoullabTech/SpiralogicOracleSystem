import { getRealChart } from '@/lib/astroUtils';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { birth } = req.body;

  const chart = await getRealChart({
    year: birth.year,
    month: birth.month,
    day: birth.day,
    hour: birth.hour,
    minute: birth.minute,
    latitude: birth.latitude,
    longitude: birth.longitude,
  });

  res.status(200).json(chart);
}
