# 🌀 Sacred Techno-Interface - Minimal Deployment

## Quick Start

This is the minimal, deployment-ready version of the Sacred Techno-Interface. It provides core Oracle functionality without complex dependencies.

### Features
- ✓ Health check endpoint
- ✓ Basic Oracle echo responses
- ✓ Elemental status monitoring
- ✓ Daily wisdom endpoint
- ✓ Clean error handling

### Installation

```bash
# Install dependencies
npm install

# Build minimal version
npm run build:minimal

# Start server
npm run start:minimal
```

### Environment Variables

Create a `.env` file:

```env
PORT=3000
NODE_ENV=production
```

### API Endpoints

- `GET /` - API info and available endpoints
- `GET /api/health` - Health check with elemental status
- `POST /api/oracle/echo` - Echo message to Oracle
- `GET /api/elemental/status` - Check elemental balance
- `GET /api/wisdom/daily` - Get daily wisdom

### Deployment

#### Render.com
- Build Command: `npm run build:minimal`
- Start Command: `npm run start:minimal`

#### Heroku
```bash
heroku create sacred-techno-interface
git push heroku main
```

#### Generic
1. Set `PORT` environment variable
2. Run `npm run build:minimal`
3. Run `npm run start:minimal`

### Testing

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test Oracle echo
curl -X POST http://localhost:3000/api/oracle/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Oracle"}'
```

### Next Steps

Once deployed and stable, you can incrementally add:
1. Supabase integration for persistence
2. OpenAI integration for advanced Oracle responses
3. Authentication middleware
4. Complex agent systems
5. Memory and learning capabilities

---

**"The spiral path begins with a single step"** 🌀