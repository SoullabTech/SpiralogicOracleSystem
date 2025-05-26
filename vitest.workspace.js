import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./oracle-backend-backup/vitest.config.js",
  "./oracle-backend/vitest.config.js",
  "./oracle-backend-backup/src/vitest.config.ts",
  "./oracle-backend-backup/oracle-backend/vitest.config.js",
  "./oracle-backend/src/vitest.config.ts",
  "./oracle-backend/dist/vitest.config.js",
  "./oracle-backend-backup/oracle-backend/src/vitest.config.ts"
])
