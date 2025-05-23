// src/pages/facilitator.tsx
export default function FacilitatorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-soullab-twilight to-soullab-aether text-white font-soullab px-4">
      <h1 className="text-5xl mb-6 font-bold animate-breathe drop-shadow-md">
        🌸 Welcome, Facilitator
      </h1>
      <p className="text-lg text-center max-w-xl">
        You’ve entered the Spiral Space — a liminal portal of presence, guidance, and transformation.
      </p>
      <button className="mt-10 px-6 py-3 bg-soullab-gold text-soullab-twilight rounded-full shadow-lg hover:scale-105 transition transform">
        Begin Ceremony
      </button>
    </div>
  );
}