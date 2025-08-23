import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // simple math

type Input = {
  users: number;
  sessionsPerDay: number;
  minutesPerSession: number;
  gpuCostPerHour: number;              // e.g. 3.0
  coldStartSeconds?: number;           // e.g. 45
  warmSecondsPerMinuteAudio?: number;  // e.g. 0.2
  daysPerMonth?: number;               // default 30
};

export async function POST(req: NextRequest) {
  const {
    users,
    sessionsPerDay,
    minutesPerSession,
    gpuCostPerHour,
    coldStartSeconds = 45,
    warmSecondsPerMinuteAudio = 0.2,
    daysPerMonth = 30,
  } = (await req.json()) as Input;

  const totalTtsMinutes =
    users * sessionsPerDay * minutesPerSession * daysPerMonth;

  const warmSeconds = totalTtsMinutes * warmSecondsPerMinuteAudio;
  const coldSeconds = users * sessionsPerDay * coldStartSeconds * daysPerMonth;

  const gpuHours = (warmSeconds + coldSeconds) / 3600;
  const totalMonthly = gpuHours * gpuCostPerHour;
  const perUserMonthly = users > 0 ? totalMonthly / users : 0;

  return NextResponse.json({
    perUserMonthly: Number(perUserMonthly.toFixed(2)),
    totalMonthly: Number(totalMonthly.toFixed(2)),
    details: {
      gpuHours: Number(gpuHours.toFixed(2)),
      warmSeconds: Math.round(warmSeconds),
      coldSeconds: Math.round(coldSeconds),
      assumptions: { coldStartSeconds, warmSecondsPerMinuteAudio, daysPerMonth },
    },
  });
}