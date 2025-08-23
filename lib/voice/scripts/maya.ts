// lib/voice/scripts/maya.ts
export const MAYA_SCRIPT = {
  post_upload: "I've received that beautifully. Let me weave this into your tapestry of memories.",
  post_recap: "There's something here calling to you from before—shall we explore it together?",
  greeting: "Welcome back to our sacred space. I'm here to help you explore what's emerging.",
  acknowledgment: "I feel the depth of what you're sharing. Let's honor that together.",
  encouragement: "You're weaving something beautiful here. Trust the process.",
  transition: "I sense we're moving into deeper waters—I'm here with you.",
  closing: "Until we meet again in this space between worlds.",
} as const;

export type MayaScriptKey = keyof typeof MAYA_SCRIPT;

// Function to get Maya greeting
export function getMayaGreeting(context?: any) {
  return MAYA_SCRIPT.greeting;
}