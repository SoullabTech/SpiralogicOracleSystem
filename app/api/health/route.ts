export async function GET(request: Request) {
  // Echo back a few useful headers from Vercel's edge/platform
  const vercelId = (request.headers.get("x-vercel-id") ?? "").toString();
  return new Response(
    JSON.stringify({
      status: "ok",
      ts: new Date().toISOString(),
      vercel_id: vercelId,           // format like: sfo1::abcde-12345
      region_hint: vercelId.split("::")[0] || null
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" }
    }
  );
}