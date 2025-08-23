module.exports = {
  forbidden: [
    // Prevent circular dependencies
    { name: "no-cycles", severity: "error", comment: "Break cycles early." },
    
    // === LAYER SEPARATION RULES ===
    
    { name: 'no-fe-to-be', from: { path: '^app/' }, to: { path: '^backend/' }, severity: 'error', comment: 'Frontend must use API endpoints, not direct backend imports' },
    { name: 'no-be-to-fe', from: { path: '^backend/' }, to: { path: '^app/' }, severity: 'error', comment: 'Backend cannot depend on app code' },
    { name: 'services-not-agents',
      from: { path: '^backend/src/services/' },
      to: { path: '^backend/src/(core/agents|agents)/' },
      severity: 'error',
      comment: 'Services cannot import agents directly'
    },
    { name: 'agents-via-interfaces-only',
      from: { path: '^backend/src/services/' },
      to: { path: '^lib/shared/interfaces/' }, 
      severity: 'error', 
      comment: 'services depend on abstractions' 
    },
    { name: 'single-source-personal-oracle',
      from: {},
      to: { pathNot: '^backend/src/core/agents/PersonalOracleAgent' },
      severity: 'warn',
      comment: 'Migrate imports to canonical PersonalOracleAgent' 
    },
    
    // === GENERAL RULES ===
    
    // Prevent dependencies on dev dependencies
    { 
      name: "not-to-dev-dep", 
      severity: "error",
      comment: "Production code cannot import dev dependencies"
    },
    
    // Prevent imports from test files
    { 
      name: "no-test-imports", 
      severity: "error",
      comment: "Production code cannot import from test files",
      from: { pathNot: "\\.(test|spec)\\.(ts|tsx|js|jsx)$" },
      to: { path: "\\.(test|spec)\\.(ts|tsx|js|jsx)$" }
    }
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    includeOnly: '^(app|backend|lib|types)/',
    tsPreCompilationDeps: true
  }
};