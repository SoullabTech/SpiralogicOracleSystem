// 📁 pages/spiral-checkin.tsx

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function SpiralCheckinPage() {
  const [state, setState] = useState({
    mood: "",
    intention: "",
    innerWeather: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("spiral_checkins").insert([
      {
        mood: state.mood,
        intention: state.intention,
        inner_weather: state.innerWeather,
        user_id: user?.id ?? null,
      },
    ]);

    setLoading(false);

    if (error) {
      setErrorMsg("Error submitting check-in. Please try again.");
      console.error("Check-in error:", error.message);
    } else {
      setSubmitted(true);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setState({ ...state, [e.target.name]: e.target.value });
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">🌀 Spiral Check-In</h1>

      {submitted ? (
        <p className="text-green-600 text-center">
          ✨ Check-in complete. Thank you!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Mood</label>
            <input
              name="mood"
              type="text"
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Intention</label>
            <input
              name="intention"
              type="text"
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Inner Weather</label>
            <textarea
              name="innerWeather"
              rows={3}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          {errorMsg && (
            <p className="text-red-600 text-sm text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? "opacity-60" : ""
            } bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700`}
          >
            {loading ? "Submitting..." : "Submit Check-In"}
          </button>
        </form>
      )}
    </div>
  );
}
