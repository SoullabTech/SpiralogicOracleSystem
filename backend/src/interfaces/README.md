# Interface Adapters Layer

This directory contains interface adapters that handle input/output formatting and protocols.

## Structure

- **http/**: REST API routes (HTTP concerns only)
- **events/**: Event handlers and messaging
- **cli/**: Command-line interfaces
- **websockets/**: Real-time communication handlers

## Principles

- Handle only protocol and format translation
- Delegate business logic to Application layer
- Convert external requests to internal commands
- Format internal responses for external consumption