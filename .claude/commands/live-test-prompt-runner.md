# Title
Create a Live Prompt Test Runner for Oracle Agent

# Summary
Enable live testing of Sesame CSM integration with real AIN outputs. Allows Oracle Agent to speak based on actual Spiralogic reflections.

# Instructions
1. Create `testPrompts.js` with sample Oracle queries like:
   - "What am I learning in this phase?"
   - "Speak to me of my shadow integration."
2. Route each prompt through `speak()` using `agentRole = "oracle"`.
3. Generate and save `.wav` output for each.
4. Add logging for voice style, emotion tag, and waveform duration.