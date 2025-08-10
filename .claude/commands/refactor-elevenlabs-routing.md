# Title

Refactor ElevenLabs to Only Handle Static Narration

# Summary

Adjust ElevenLabs integration so it only serves narration-based content (meditations, intros). Dynamic conversational agents must be rerouted to the new Sesame CSM module.

# Instructions

1. Identify all existing ElevenLabs API call sites.
2. Wrap each in conditional checks: `if (agentRole === "narrator")`.
3. Migrate all other roles to use `voiceRouter.js`, which handles routing to Sesame.
4. Validate output behavior with mock agent responses.
