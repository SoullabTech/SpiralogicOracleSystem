# Title

Integrate Sesame CSM-1B for AIN Voice Output

# Summary

Install and integrate Sesame's conversational speech model (CSM-1B) into the AIN voice pipeline. Route dynamic outputs from Oracle Agents and elemental agents to CSM-1B. Static narrations (e.g., teachings, ceremonies) should continue using ElevenLabs.

# Instructions

1. Install required dependencies: `transformers`, `torchaudio`, and `csm-1b`.
2. Create a new module called `voiceRouter.js`.
3. If `agentRole === "oracle"` or `elemental`, route voice through Sesame (text → waveform).
4. If `agentRole === "narrator"`, use ElevenLabs API (existing implementation).
5. Add environmental toggle `USE_SESAME = true/false`.
6. Write basic test cases using Jest to simulate routing logic.
