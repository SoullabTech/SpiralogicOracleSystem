# Infrastructure Layer

This directory contains all external system integrations and infrastructure concerns.

## Structure

- **adapters/**: External service integrations (databases, APIs, etc.)
- **repositories/**: Data persistence implementations
- **external/**: Third-party service wrappers
- **config/**: Infrastructure-specific configuration

## Principles

- Implements interfaces defined in Domain/Application layers
- Contains all external dependencies
- Framework and technology specific implementations
- Should be easily replaceable