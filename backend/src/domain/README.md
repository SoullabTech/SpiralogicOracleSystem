# Domain Layer

This directory contains the core business logic and domain entities of the Oracle system.

## Structure

- **agents/**: All Oracle agents consolidated here
  - **elemental/**: Aether, Air, Earth, Fire, Water agents
  - **divination/**: Tarot, I-Ching, Astrology agents  
  - **personal/**: PersonalOracleAgent variants
  - **specialized/**: Dream, Shadow, Guide agents
  - **interfaces/**: Agent contracts and types
  - **base/**: BaseAgent and common functionality

- **entities/**: Core domain objects (Participant, AstrologyChart, etc.)
- **valueObjects/**: Immutable domain values
- **businessRules/**: Domain validation and business logic
- **services/**: Domain-specific pure business logic

## Principles

- No dependencies on infrastructure or external services
- Pure business logic only
- Framework-agnostic
- Highly testable