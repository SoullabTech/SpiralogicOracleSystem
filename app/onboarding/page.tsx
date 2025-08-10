"use client";

import { useState } from "react";
import Link from "next/link";

interface ConsciousnessProfile {
  name: string;
  spiritualPath: string[];
  primaryChallenges: string[];
  guidanceTypes: string[];
  preferredAgents: string[];
  experienceLevel: string;
  intentions: string;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<ConsciousnessProfile>({
    name: "",
    spiritualPath: [],
    primaryChallenges: [],
    guidanceTypes: [],
    preferredAgents: [],
    experienceLevel: "",
    intentions: "",
  });
  const [completed, setCompleted] = useState(false);

  const totalSteps = 6;

  const spiritualPaths = [
    "Buddhism",
    "Christianity",
    "Islam",
    "Judaism",
    "Hinduism",
    "Taoism",
    "Indigenous Traditions",
    "New Age",
    "Mysticism",
    "Secular Spirituality",
    "Shamanism",
    "Paganism",
    "Exploring/Uncertain",
  ];

  const challenges = [
    "Finding life purpose",
    "Emotional healing",
    "Creative blocks",
    "Relationship issues",
    "Career transitions",
    "Anxiety & stress",
    "Depression & sadness",
    "Spiritual awakening",
    "Shadow work",
    "Self-worth & confidence",
    "Decision making",
    "Communication",
  ];

  const guidanceTypes = [
    "Practical advice",
    "Spiritual wisdom",
    "Emotional support",
    "Creative inspiration",
    "Relationship guidance",
    "Career direction",
    "Healing practices",
    "Meditation techniques",
    "Shadow integration",
    "Life purpose clarity",
    "Energy management",
    "Manifestation",
  ];

  const agents = [
    {
      key: "fire",
      name: "Fire Agent",
      emoji: "🔥",
      description: "Vision, creativity, transformation",
    },
    {
      key: "water",
      name: "Water Agent",
      emoji: "🌊",
      description: "Emotional wisdom, flow",
    },
    {
      key: "earth",
      name: "Earth Agent",
      emoji: "🌍",
      description: "Grounding, practical guidance",
    },
    {
      key: "air",
      name: "Air Agent",
      emoji: "💨",
      description: "Mental clarity, communication",
    },
  ];

  const experienceLevels = [
    {
      key: "beginner",
      label: "New to consciousness work",
      description: "Just starting my spiritual journey",
    },
    {
      key: "intermediate",
      label: "Some experience",
      description: "Have practiced meditation, therapy, or spiritual work",
    },
    {
      key: "advanced",
      label: "Experienced practitioner",
      description: "Regular spiritual practice and inner work",
    },
    {
      key: "expert",
      label: "Teacher/Guide",
      description: "I guide others in consciousness development",
    },
  ];

  const updateArrayField = (
    field: keyof ConsciousnessProfile,
    value: string,
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter((item) => item !== value)
        : [...(prev[field] as string[]), value],
    }));
  };

  const updateField = (field: keyof ConsciousnessProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    // Save profile to localStorage for demo purposes
    localStorage.setItem("consciousness-profile", JSON.stringify(profile));
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-purple-900 text-yellow-400 flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <div className="mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center mx-auto shadow-lg">
              <span className="text-4xl text-gray-900">✨</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome, {profile.name}!</h1>
          <p className="text-lg opacity-80 mb-8">
            Your consciousness profile has been created. The oracle agents are
            now calibrated to your unique journey.
          </p>
          <div className="space-y-4">
            <Link
              href="/dashboard/oracle-beta"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition inline-block text-lg"
            >
              🔮 Begin Oracle Experience
            </Link>
            <div className="text-sm opacity-60">
              <p>Your personalized guidance awaits.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-purple-900 text-yellow-400">
      <div className="container mx-auto px-8 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span>Consciousness Profile Setup</span>
              <span>
                {step} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-8 border border-white/10">
            {/* Step 1: Name */}
            {step === 1 && (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Welcome to Soullab Oracle
                </h2>
                <p className="opacity-80 mb-6">
                  Let's create your consciousness profile for personalized
                  guidance
                </p>
                <div className="text-left">
                  <label className="block text-sm font-medium mb-2">
                    What would you like the oracle to call you?
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter your preferred name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Spiritual Path */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Your Spiritual Path</h2>
                <p className="opacity-80 mb-6">
                  Select traditions or paths that resonate with you (choose any
                  that apply)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {spiritualPaths.map((path) => (
                    <button
                      key={path}
                      onClick={() => updateArrayField("spiritualPath", path)}
                      className={`p-3 rounded-lg border text-left transition ${
                        profile.spiritualPath.includes(path)
                          ? "bg-yellow-400/20 border-yellow-400/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm">{path}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Primary Challenges */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Areas for Guidance</h2>
                <p className="opacity-80 mb-6">
                  What areas of life would you most like guidance on?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {challenges.map((challenge) => (
                    <button
                      key={challenge}
                      onClick={() =>
                        updateArrayField("primaryChallenges", challenge)
                      }
                      className={`p-3 rounded-lg border text-left transition ${
                        profile.primaryChallenges.includes(challenge)
                          ? "bg-yellow-400/20 border-yellow-400/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm">{challenge}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Guidance Types */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Types of Guidance</h2>
                <p className="opacity-80 mb-6">
                  What kinds of guidance do you find most helpful?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {guidanceTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => updateArrayField("guidanceTypes", type)}
                      className={`p-3 rounded-lg border text-left transition ${
                        profile.guidanceTypes.includes(type)
                          ? "bg-yellow-400/20 border-yellow-400/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm">{type}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Preferred Agents */}
            {step === 5 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Elemental Preferences
                </h2>
                <p className="opacity-80 mb-6">
                  Which elemental energies feel most aligned with your current
                  needs?
                </p>
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <button
                      key={agent.key}
                      onClick={() =>
                        updateArrayField("preferredAgents", agent.key)
                      }
                      className={`w-full p-4 rounded-lg border text-left transition ${
                        profile.preferredAgents.includes(agent.key)
                          ? "bg-yellow-400/20 border-yellow-400/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{agent.emoji}</span>
                        <div>
                          <div className="font-semibold">{agent.name}</div>
                          <div className="text-sm opacity-80">
                            {agent.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Experience Level & Intentions */}
            {step === 6 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Experience & Intentions
                </h2>

                <div className="mb-6">
                  <p className="opacity-80 mb-4">
                    Your experience level with consciousness work:
                  </p>
                  <div className="space-y-3">
                    {experienceLevels.map((level) => (
                      <button
                        key={level.key}
                        onClick={() =>
                          updateField("experienceLevel", level.key)
                        }
                        className={`w-full p-3 rounded-lg border text-left transition ${
                          profile.experienceLevel === level.key
                            ? "bg-yellow-400/20 border-yellow-400/50"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className="font-semibold text-sm">
                          {level.label}
                        </div>
                        <div className="text-xs opacity-80">
                          {level.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    What do you hope to gain from this oracle experience?
                  </label>
                  <textarea
                    value={profile.intentions}
                    onChange={(e) => updateField("intentions", e.target.value)}
                    placeholder="Share your intentions, goals, or what you're seeking guidance about..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <button
                onClick={nextStep}
                disabled={
                  (step === 1 && !profile.name.trim()) ||
                  (step === 2 && profile.spiritualPath.length === 0) ||
                  (step === 6 && !profile.experienceLevel)
                }
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === totalSteps ? "Complete Setup" : "Next →"}
              </button>
            </div>
          </div>

          {/* Skip Option */}
          <div className="text-center mt-6">
            <Link
              href="/dashboard/oracle-beta"
              className="text-yellow-400/60 hover:text-yellow-400 underline text-sm"
            >
              Skip setup and explore →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
