# Sesame TTS Service

Lightweight Text-to-Speech service for the Spiralogic Oracle System.

## Deploy to Render.com (Free)

1. Push this folder to a GitHub repository
2. Go to [Render.com](https://render.com)
3. Create a new Web Service
4. Connect your GitHub repo
5. Select the `sesame-service` directory
6. Deploy!

Your service will be available at: `https://your-service.onrender.com`

## Deploy to Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Run: `railway login`
3. Run: `railway init`
4. Run: `railway up`

## Deploy with Cloudflare Tunnel (Keep Local)

1. Install cloudflared: `brew install cloudflare/cloudflare/cloudflared`
2. Run: `cloudflared tunnel --url http://localhost:8000`
3. Get permanent tunnel: `cloudflared tunnel login`
4. Create tunnel: `cloudflared tunnel create sesame`
5. Route tunnel: `cloudflared tunnel route dns sesame sesame.yourdomain.com`

## Environment Variables for Production

Add these to your Vercel project:

```
SESAME_URL=https://your-sesame-service.onrender.com
NEXT_PUBLIC_SESAME_URL=https://your-sesame-service.onrender.com
NEXT_PUBLIC_TTS_API_URL=https://your-sesame-service.onrender.com
SESAME_ENABLED=true
USE_SESAME=true
VOICE_PRIMARY=sesame
```