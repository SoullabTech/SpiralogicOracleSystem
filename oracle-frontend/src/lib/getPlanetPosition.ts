import loadSwisseph from './loadSwisseph';

export async function getSunPosition(date: Date) {
  const se = await loadSwisseph();

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60;

  const jd = se.swe_julday(year, month, day, hour, se.SE_GREG_CAL);

  const resultPtr = se._malloc(6 * 8); // alloc for 6 doubles
  const serrPtr = se._malloc(256);     // alloc for error string

  se.swe_calc_ut(jd, se.SE_SUN, 0, resultPtr, serrPtr);

  const result = new Float64Array(se.HEAPF64.buffer, resultPtr, 6);
  const lon = result[0]; // Sun longitude

  se._free(resultPtr);
  se._free(serrPtr);

  return {
    julianDay: jd,
    sunLongitude: lon,
  };
}
