// Deprecation notice for old import path
throw new Error(
  'This file has been refactored for modularity. Please use:\n' +
  'import { PersonalOracleAgent } from "@/backend/src/core/agents/PersonalOracleAgent/PersonalOracleAgent";\n' +
  '\n' +
  'The PersonalOracleAgent has been broken down from 4,116 lines into modular components:\n' +
  '- BaseOracleAgent: Core agent functionality\n' +
  '- SacredMirrorProtocol: Jung-Buddha integration patterns\n' +
  '- OracleModeHandler: Contextual mode switching\n' +
  '- PatternEngine: User pattern recognition and analysis\n' +
  '\n' +
  'This improves maintainability and follows the 600 LOC limit per file.'
);