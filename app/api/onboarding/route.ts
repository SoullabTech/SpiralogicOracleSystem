import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Minimal validation without extra deps.
function isPersona(x: unknown): x is "mentor" | "shaman" | "analyst" {
  return x === "mentor" || x === "shaman" || x === "analyst";
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const persona = body?.persona;
    const intention: string = (body?.intention ?? "").toString().slice(0, 500);

    if (!isPersona(persona)) {
      return NextResponse.json({ ok: false, error: "Invalid persona" }, { status: 400 });
    }

    // TODO: Replace with real auth guard.
    // For MVP, set a fake auth cookie if not present.
    const jar = cookies();
    if (!jar.get("auth")) jar.set("auth", "1", { path: "/", httpOnly: false });

    // Persist to cookies for now (swap to DB later).
    jar.set("persona", persona, { path: "/", httpOnly: false });
    if (intention) jar.set("intention", intention, { path: "/", httpOnly: false });
    jar.set("onboarded", "1", { path: "/", httpOnly: false });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Unexpected error" }, { status: 500 });
  }
}