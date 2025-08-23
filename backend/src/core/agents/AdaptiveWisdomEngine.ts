// Deprecation notice for old import path
throw new Error(
  'This file has been refactored for modularity. Please use:\n' +
  'import { AdaptiveWisdomEngine } from "@/backend/src/core/agents/AdaptiveWisdomEngine";\n' +
  '\n' +
  'The AdaptiveWisdomEngine has been broken down from 735 lines into modular components:\n' +
  '- WisdomRouter: Routes between different wisdom approaches (Jung, Buddha, etc.)\n' +
  '- PatternDetector: Detects patterns in user input and conversation history\n' +
  '- ApproachHandlers: Handles specific therapeutic approaches and response generation\n' +
  '- AdaptiveWisdomEngine: Main orchestrator that coordinates all components\n' +
  '\n' +
  'This improves maintainability and follows the 600 LOC limit per file.'
);