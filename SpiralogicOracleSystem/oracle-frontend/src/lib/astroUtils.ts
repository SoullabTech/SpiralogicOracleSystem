// /src/lib/astroUtils.ts

import { getPlanetPositions } from 'astronode';

export async function getRealChart({
  year,
  month,
  day,
  hour,
  minute,
  latitude,
  longitude,
}) {
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));

  const result = await getPlanetPositions({
    date,
    latitude,
    longitude,
    includeHouses: true,
    houseSystem: 'P',
  });

  return result;
}
