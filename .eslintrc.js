module.exports = {
  extends: ["next/core-web-vitals"],
  plugins: ["import", "boundaries"],
  settings: { 
    "import/resolver": { 
      typescript: {} 
    }
  },
  rules: {
    "import/no-cycle": ["error", { maxDepth: 1 }],
    "boundaries/element-types": ["error", {
      default: "disallow",
      rules: [
        { 
          from: ["frontend", "app", "components", "lib"], 
          allow: ["lib", "frontend", "app", "components"] 
        },
        { 
          from: ["backend/src/services"], 
          disallow: ["backend/src/agents", "backend/src/core/agents"] 
        },
        { 
          from: ["backend/src/agents", "backend/src/core/agents"], 
          disallow: ["backend/src/services"] 
        },
        { 
          from: ["backend/src/core"], 
          disallow: ["backend/src/routes"] 
        },
      ]
    }],
    // Block raw hex colors to enforce design system tokens (except in config files)
    "no-restricted-syntax": [
      "error",
      {
        selector: "Literal[value=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/]",
        message: "Use design tokens or Tailwind classes; raw hex colors are disallowed."
      }
    ]
  },
  overrides: [
    {
      files: ["tailwind.config.*", "*.config.*", ".storybook/**"],
      rules: {
        "no-restricted-syntax": "off"
      }
    }
  ]
  }
};