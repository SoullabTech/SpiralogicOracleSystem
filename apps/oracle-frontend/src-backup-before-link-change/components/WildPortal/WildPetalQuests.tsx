const wildQuests = [
  '🌸 Whisper your dream to the wind today.',
  '🔥 Act boldly on a single spontaneous impulse.',
  '🌊 Spend 10 minutes flowing without structure.',
  '🌬️ Send a secret blessing to a stranger.',
  '🌎 Touch the earth barefoot and breathe gratitude.',
  "🌀 Speak your heart's true longing aloud once today.",
];

export default function WildPetalQuests() {
  const quest = wildQuests[Math.floor(Math.random() * wildQuests.length)];

  return (
    <div className="flex flex-col items-center p-8 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-3xl shadow-xl">
      <h1 className="text-2xl font-bold mb-4">🌸 Wild Petal Quest</h1>
      <p className="text-lg text-center text-indigo-700">{quest}</p>
    </div>
  );
}
