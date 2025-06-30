# Title
Build a Universal Speak Function for AIN Voice Output

# Summary
Create a single `speak()` function that routes voice output based on agent role, applies voice personality styles, and generates audio using either Sesame or ElevenLabs.

# Instructions
1. Inside `voiceRouter.js`, create `speak(text, agentRole)` function.
2. Load `voiceProfiles.json` and retrieve style data for the given agent.
3. Modify input text using speakerId and promptMarkers (e.g., `[pause]`, `[breathe]`).
4. If `USE_SESAME` is enabled and role is "oracle" or elemental, call Sesame script with styled text.
5. If role is "narrator", route to ElevenLabs API with base voice.
6. Add fallback and error logging.
7. Add unit test cases to confirm routing and audio file output per role.