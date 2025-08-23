export async function emitWhispersShown(ids: string[]) {
  try {
    await fetch("/api/telemetry/whispers/shown", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids }),
    });
  } catch {}
}

export async function emitWhisperUsed(id: string) {
  try {
    await fetch("/api/telemetry/whispers/used", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
  } catch {}
}