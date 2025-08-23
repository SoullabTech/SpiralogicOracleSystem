# Application Layer

This directory contains application services and use case orchestration.

## Structure

- **services/**: Pure business services implementing use cases
- **orchestration/**: Cross-domain workflow coordination
- **workflows/**: Multi-step business processes
- **interfaces/**: Service contracts and application interfaces

## Principles

- Depends only on Domain layer
- Implements use cases and business workflows
- Coordinates domain services and agents
- No knowledge of infrastructure details