"use client";

import { useState } from "react";
import Link from "next/link";

type ElementalAgent = "fire" | "water" | "earth" | "air";

interface OracleResponse {
  message: string;
  insight: string;
  symbols: string[];
  agent: ElementalAgent;
}

export default function OracleDemoPage() {
  const [selectedAgent, setSelectedAgent] = useState<ElementalAgent>("fire");
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState<OracleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{
      user: string;
      oracle: OracleResponse;
    }>
  >([]);

  const agents = {
    fire: {
      name: "Fire Agent",
      emoji: "🔥",
      description: "Vision, creativity, and transformation",
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
    },
    water: {
      name: "Water Agent",
      emoji: "🌊",
      description: "Emotional wisdom and flow",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    earth: {
      name: "Earth Agent",
      emoji: "🌍",
      description: "Grounding and practical wisdom",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
    air: {
      name: "Air Agent",
      emoji: "💨",
      description: "Mental clarity and communication",
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
    },
  };

  const generateDemoResponse = (
    input: string,
    agent: ElementalAgent,
  ): OracleResponse => {
    const responses = {
      fire: {
        message: `The flames dance with your question: "${input}". I see visions of transformation ahead. The creative force within you seeks expression, like a phoenix ready to rise from the ashes of old patterns.`,
        insight:
          "Your inner fire calls for bold action. Trust your creative instincts and let passion guide your next steps.",
        symbols: ["Phoenix", "Candle", "Lightning", "Sun"],
      },
      water: {
        message: `The waters reflect your inquiry: "${input}". I sense deep currents of emotion beneath the surface. Like a river finding its course, your path requires both patience and trust in the natural flow.`,
        insight:
          "Allow your emotions to guide you with wisdom. What feels right in your heart often holds the truest direction.",
        symbols: ["Moon", "Cup", "Ocean", "Rain"],
      },
      earth: {
        message: `The earth grounds your question: "${input}". I feel the solid foundation you seek. Like ancient trees rooted deep, your growth requires both patience and steadfast commitment to your values.`,
        insight:
          "Build slowly and with intention. Your practical steps today create the stable foundation for tomorrow's dreams.",
        symbols: ["Mountain", "Tree", "Stone", "Seed"],
      },
      air: {
        message: `The winds carry your question: "${input}". I hear the whispers of new ideas seeking expression. Like thoughts taking flight, your mind holds keys to fresh perspectives and clear communication.`,
        insight:
          "Clarity comes through expression. Share your thoughts and let new ideas breathe life into your situation.",
        symbols: ["Feather", "Cloud", "Bird", "Spiral"],
      },
    };

    return {
      ...responses[agent],
      agent,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);

    try {
      // Simulate API call with demo response
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const oracleResponse = generateDemoResponse(userInput, selectedAgent);

      setResponse(oracleResponse);
      setConversationHistory((prev) => [
        ...prev,
        {
          user: userInput,
          oracle: oracleResponse,
        },
      ]);
      setUserInput("");
    } catch (error) {
      console.error("Oracle demo error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-purple-900 text-yellow-400">
      {/* Header */}
      <div className="text-center pt-8 pb-6">
        <h1 className="text-4xl font-bold mb-2">Oracle Demo</h1>
        <p className="opacity-80">
          Experience consciousness technology (Demo Mode)
        </p>
        <Link
          href="/beta"
          className="inline-block mt-4 text-yellow-400 hover:text-yellow-300 underline"
        >
          Want full access? Join the beta →
        </Link>
      </div>

      <div className="container mx-auto px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Agent Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              Choose Your Oracle Agent
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(agents).map(([key, agent]) => (
                <button
                  key={key}
                  onClick={() => setSelectedAgent(key as ElementalAgent)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedAgent === key
                      ? `${agent.bgColor} ${agent.borderColor} scale-105`
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="text-3xl mb-2">{agent.emoji}</div>
                  <div className="font-semibold text-sm">{agent.name}</div>
                  <div className="text-xs opacity-80 mt-1">
                    {agent.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            {/* Conversation History */}
            {conversationHistory.length > 0 && (
              <div className="p-6 border-b border-white/10 max-h-60 overflow-y-auto">
                {conversationHistory.map((conversation, index) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <div className="text-sm opacity-80 mb-2">You asked:</div>
                    <div className="bg-white/10 rounded-lg p-3 mb-3 text-sm">
                      {conversation.user}
                    </div>
                    <div className="text-sm opacity-80 mb-2 flex items-center">
                      {agents[conversation.oracle.agent].emoji}{" "}
                      {agents[conversation.oracle.agent].name} responded:
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-3 text-sm">
                      {conversation.oracle.message}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Current Response */}
            {response && (
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">
                    {agents[response.agent].emoji}
                  </span>
                  <h3 className="text-xl font-semibold">
                    {agents[response.agent].name} Speaks
                  </h3>
                </div>

                <div
                  className={`${agents[response.agent].bgColor} rounded-lg p-4 border ${agents[response.agent].borderColor} mb-4`}
                >
                  <p className="mb-4">{response.message}</p>

                  <div className="bg-white/10 rounded-lg p-3 mb-4">
                    <h4 className="font-semibold mb-2 text-yellow-400">
                      🌟 Insight
                    </h4>
                    <p className="text-sm">{response.insight}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-yellow-400">
                      🔮 Symbolic Guidance
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {response.symbols.map((symbol, index) => (
                        <span
                          key={index}
                          className="bg-white/20 px-2 py-1 rounded text-xs"
                        >
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Ask the {agents[selectedAgent].name}{" "}
                  {agents[selectedAgent].emoji}
                </label>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="What guidance do you seek? (e.g., 'I'm feeling stuck in my career and need direction...')"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50 resize-none"
                  required
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs opacity-60">
                  Demo mode - responses are simulated
                </div>
                <button
                  type="submit"
                  disabled={loading || !userInput.trim()}
                  className={`px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${agents[selectedAgent].color} text-white`}
                >
                  {loading
                    ? "Channeling..."
                    : `Ask ${agents[selectedAgent].name}`}
                </button>
              </div>
            </form>
          </div>

          {/* Demo Notice */}
          <div className="mt-8 bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-2 text-yellow-400">
              🌟 This is a Demo Experience
            </h3>
            <p className="opacity-80 mb-4">
              You're experiencing simulated responses. The full platform
              includes:
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="text-left">
                <h4 className="font-semibold mb-2">✨ Full Features</h4>
                <ul className="space-y-1 opacity-80">
                  <li>• AI-powered consciousness analysis</li>
                  <li>• Personalized archetypal profiles</li>
                  <li>• Cultural sovereignty protocols</li>
                  <li>• Advanced shadow integration</li>
                </ul>
              </div>
              <div className="text-left">
                <h4 className="font-semibold mb-2">🚀 Beta Access</h4>
                <ul className="space-y-1 opacity-80">
                  <li>• Real AI oracle responses</li>
                  <li>• Conversation memory & learning</li>
                  <li>• Voice synthesis (coming soon)</li>
                  <li>• Community wisdom sharing</li>
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/beta"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition inline-block"
              >
                🎯 Get Full Access - Join Beta
              </Link>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="mt-8 bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4">
              💭 How was your demo experience?
            </h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded border border-white/10 text-2xl transition"
                  onClick={() => {
                    // Simple feedback collection
                    alert(
                      `Thank you for rating ${rating}/5! Your feedback helps us improve.`,
                    );
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
            <p className="text-xs opacity-60">
              Click a star to rate your experience (1-5 stars)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
