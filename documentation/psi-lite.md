# PSI-lite: MicroPsi-inspired Motivation System

## Overview

PSI-lite is a lightweight, educational implementation of a motivation-driven agent architecture inspired by MicroPsi cognitive architecture concepts. This module implements a generic "need-driven appraisal/action" loop for experimental purposes.

## Important Notes

- This is a **MicroPsi-inspired** educational prototype implementing generic motivation concepts described in public talks/papers
- This is **NOT** proprietary code from Joscha Bach or Micropsi Industries
- Implementation is based on publicly available research on cognitive architectures and motivation systems
- Feature-flagged via `PSI_LITE_ENABLED` environment variable for safe deployment

## Architecture

### Core Components

1. **Needs System**: Tracks satisfaction levels for different drives (coherence, novelty, social connection)
2. **Action Options**: Available behaviors with predicted need satisfaction changes
3. **Appraisal Engine**: Evaluates action options based on current needs and affect
4. **Affective State**: Mood and arousal that influence decision-making

### Key Features

- Need-driven action selection
- Affect-biased utility calculation  
- Simple learning through outcome feedback
- Modular, extensible design

## API Endpoints

- `GET /api/psi/enabled` - Check if PSI-lite is enabled
- `POST /api/psi/reset` - Reset system state
- `POST /api/psi/step` - Execute one decision-making step

## Frontend Debug Interface

Access the live debug interface at `/debug/psi` to:
- View current system state
- Execute decision steps
- Monitor appraisal calculations
- Reset system state

## Future Enhancements

- Learnable need weights based on outcomes
- Memory integration with existing AIN system
- Policy search and optimization
- Hierarchical goal structures

## Development

To enable PSI-lite:
1. Set `PSI_LITE_ENABLED=true` in environment
2. Restart backend service
3. Access debug interface at `/debug/psi`

## Learning & Memory Bridge

- Outcome-driven learning adjusts `Need.weight` if the realized change in need level matches the predicted direction of the chosen action.
- Tunables:
  - `PSI_LEARNING_ENABLED` (default true)
  - `PSI_LEARNING_RATE` (default 0.08), try 0.02–0.15
- Episodes are logged to `logs/psi-episodes.jsonl` by default.
- To integrate with AIN memory, call:
  ```ts
  import { setPsiEpisodeWriter } from "@/services/psiMemoryBridge";
  setPsiEpisodeWriter(async (ep) => {
    // send ep into your memory bus/service
  });
  ```

## Rollback

To disable the feature:
```bash
# Environment variable method
PSI_LITE_ENABLED=false

# Or git revert if needed
git revert <commit-sha>
```