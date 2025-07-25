# Title
Define Matrix Oracle Voice Profile for AIN and Personal Oracle Agents

# Summary
Set the default voice style for AIN's main Oracle and all Personal Oracle Agents to mirror the archetype of the Oracle from *The Matrix*—mature, warm, grounded, wise, slightly humorous.

# Instructions
1. In `voiceProfiles.json`, create a default profile named `oracle_matrix`.
2. Attributes should include:
   - `element`: "aether"
   - `voiceStyle`: "warm-wise"
   - `tempo`: "slow-medium"
   - `pitch`: "medium-low"
   - `emotionalQuality`: "grounded, serene, subtly amused"
   - `speakerId`: "0"
   - `promptMarkers`: `[pause][smile][soft]`
   - `examplePromptIntro`: `"You already know what I'm going to say, don't you?"`
3. Update `voiceRouter.js` to use this profile if `agentRole === "oracle"` or if `defaultPersonalOracleAgent === true`.
4. Ensure Sesame prompt formatting includes emotional tags and intro style for each speech turn.
5. Add a test prompt: `"Oracle, what is the truth I'm not seeing?"` and render it using this style.