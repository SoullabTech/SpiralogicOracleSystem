import { useEffect, useState } from "react";

const defaultProfile = {
  fire: 0,
  water: 0,
  earth: 0,
  air: 0,
  aether: 0,
  crystal_focus: "",
  voice_profile: "emily",
  guide_voice: "aunt_annie",
  guide_name: "Oracle Guide",
};

const playVoiceSample = (voiceId: string, text: string) => {
  fetch("/api/voice/play", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voice: voiceId, text }),
  })
    .then((res) => res.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    });
};

export default function ProfileEditor({ userId }: { userId: string }) {
  const [profile, setProfile] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile/${userId}`);
        const data = await res.json();
        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }

    fetchProfile();
  }, [userId]);

  const updateField = (field: string, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    setStatus("Saving...");
    const res = await fetch(`/api/profile/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setStatus(res.ok ? "✅ Saved!" : "❌ Failed to save");
  };

  if (loading) return <div className="text-sm text-gray-500">Loading profile...</div>;

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold text-gray-800">🌿 Edit Your Oracle Profile</h2>

      {["fire", "water", "earth", "air", "aether"].map((el) => (
        <div key={el} className="flex items-center justify-between">
          <label className="capitalize">{el}</label>
          <input
            type="number"
            min={0}
            max={100}
            value={profile[el]}
            onChange={(e) => updateField(el, Number(e.target.value))}
            className="w-20 border px-2 py-1 rounded"
          />
        </div>
      ))}

      <div>
        <label className="block font-medium">🔮 Crystal Focus</label>
        <input
          type="text"
          value={profile.crystal_focus}
          onChange={(e) => updateField("crystal_focus", e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block font-medium">🗣️ Oracle Voice (voice_profile)</label>
        <select
          value={profile.voice_profile}
          onChange={(e) => updateField("voice_profile", e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="emily">Emily (default)</option>
          <option value="rachel">Rachel</option>
          <option value="bella">Bella</option>
          <option value="nova">Nova</option>
        </select>
        <button
          className="text-sm text-indigo-600 mt-1 underline"
          onClick={() => playVoiceSample(profile.voice_profile, "This is your Oracle speaking.")}
        >
          ▶️ Preview Voice
        </button>
      </div>

      <div>
        <label className="block font-medium">🧙 Guide Voice (guide_voice)</label>
        <select
          value={profile.guide_voice}
          onChange={(e) => updateField("guide_voice", e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="aunt_annie">Aunt Annie (warm, wise)</option>
          <option value="sophia">Sophia (ethereal)</option>
          <option value="grace">Grace (deep calm)</option>
        </select>
        <button
          className="text-sm text-indigo-600 mt-1 underline"
          onClick={() => playVoiceSample(profile.guide_voice, `Hello, I am ${profile.guide_name}, your guide.`)}
        >
          ▶️ Preview Guide Voice
        </button>
      </div>

      <div>
        <label className="block font-medium">🌀 Guide Name</label>
        <input
          type="text"
          value={profile.guide_name}
          onChange={(e) => updateField("guide_name", e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <button
        onClick={saveProfile}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Save Profile
      </button>

      {status && <p className="text-sm mt-2 text-gray-600">{status}</p>}
    </div>
  );
}
