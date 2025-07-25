# Title
Define Elemental Agent Voice Personalities for AIN

# Summary
Create a configuration system for dynamic voice traits for each elemental agent in the AIN system. This enables tone, pitch, and emotional mood customization per agent using Sesame CSM.

# Instructions
1. Create a JSON file `voiceProfiles.json` in the `config/` folder.
2. Define voice attributes for Oracle, Fire, Water, Earth, Air, and Aether agents.
   - Include: `element`, `voiceStyle`, `tempo`, `pitch`, `emotionalQuality`, `speakerId`, and `promptMarkers`.
3. Load this file inside `voiceRouter.js` and apply the style to the TTS prompt before passing it to Sesame.
4. Allow voiceRouter to dynamically adjust prompt content using these styles.
5. Add a test case to confirm Fire agent uses "energized" and Aether uses "serene" tone.