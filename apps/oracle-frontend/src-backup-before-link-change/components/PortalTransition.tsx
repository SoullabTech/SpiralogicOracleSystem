import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PortalTransition() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/portal/journey");
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-soullab-aether via-soullab-mist to-soullab-twilight">
      {/* Glowing Spiral Effect */}
      <div
        aria-hidden="true"
        className="animate-pulse-slow bg-white/20 rounded-full w-64 h-64 flex items-center justify-center shadow-2xl"
      >
        <div className="bg-soullab-gold/80 rounded-full w-40 h-40 animate-breathe" />
      </div>

      {/* Portal Message */}
      <div className="absolute bottom-12 text-center text-white text-xl font-semibold animate-fade-in-slow">
        🌟 The Portal Opens... 🌟
      </div>
    </div>
  );
}
