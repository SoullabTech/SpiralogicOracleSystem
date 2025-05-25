import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./oracle-backend/vitest.config.js",
  "./oracle-frontend/vitest.config.ts",
  "./SpiralogicOracleSystem/oracle-frontend/._vitest.config.ts",
  "./SpiralogicOracleSystem/oracle-frontend/vitest.config.ts",
  "./oracle-backend/src/vitest.config.ts",
  "./oracle-frontend/oracle-test/vite.config.js",
  "./SpiralogicOracleSystem/oracle-frontend/oracle-test/._vite.config.js",
  "./SpiralogicOracleSystem/oracle-frontend/oracle-test/vite.config.js"
])
