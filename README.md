# Spiralogic Oracle System

## Overview

Spiralogic Oracle System is a sophisticated AI-powered platform that combines multiple language models with archetypal psychology and elemental wisdom to provide personalized transformational guidance. The system features a dual AI architecture, persistent memory system, and real-time pattern recognition.

## Core Features

### 1. Dual AI System
- **Claude Integration**: Handles emotional and intuitive content
- **GPT-4 Integration**: Processes analytical and structured content
- **Intelligent Routing**: Automatically directs queries to the most appropriate AI model
- **Context Awareness**: Maintains conversation history and client context

### 2. Memory System
- **Persistent Storage**: Long-term memory storage using Supabase
- **Memory Types**:
  - Insights
  - Patterns
  - Reflections
  - Session Records
- **Memory Connections**: Automatic pattern recognition and relationship mapping
- **Strength-based Retrieval**: Prioritizes memories based on importance and recency

### 3. Elemental Framework
- **Five Elements**:
  - Fire (Transformation)
  - Water (Emotion)
  - Earth (Stability)
  - Air (Intellect)
  - Aether (Integration)
- **Element Detection**: Automatic analysis of content for elemental alignment
- **Dynamic Shifting**: Suggests element transitions based on client needs

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Soullab/SpiralogicOracleSystem.git
cd SpiralogicOracleSystem
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_CLAUDE_API_KEY=your-claude-api-key
VITE_OPENAI_API_KEY=your-openai-api-key
```

4. Start the development server:
```bash
npm run dev
```

## Environment Setup

The application requires the following environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_CLAUDE_API_KEY`: Your Anthropic Claude API key
- `VITE_OPENAI_API_KEY`: Your OpenAI API key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (server-side only)

## Database Setup

The application uses Supabase as its database. The schema includes:

- User profiles and roles
- Memory system tables
- Session management
- Practitioner tools
- Client journeys

Run the migrations in the `supabase/migrations` directory to set up your database schema.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.