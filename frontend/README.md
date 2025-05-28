# SoulLab Frontend

Sacred Technology for Consciousness Evolution

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment to Vercel

1. Push this code to a GitHub repository
2. Go to [Vercel](https://vercel.com)
3. Import the GitHub repository
4. Set the root directory to `soullab-frontend`
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://oracle-backend-1.onrender.com`
6. Deploy!

## Features

- ✨ Sacred Holoflower visualization
- 🌙 Astrological integration
- 🔮 Personal Oracle sessions
- 📝 Consciousness journal
- 🌟 Elemental balance tracking
- 📱 Mobile-responsive design
- 🎨 Sacred animations and design system

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- React Query
- NextAuth.js

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://oracle-backend-1.onrender.com
NEXTAUTH_URL=https://soullab.life
NEXTAUTH_SECRET=your-production-secret
```

## Project Structure

```
soullab-frontend/
├── app/                  # Next.js app router pages
│   ├── onboarding/      # Sacred onboarding flow
│   ├── dashboard/       # Main user dashboard
│   └── api/            # API routes
├── components/          # React components
│   ├── sacred/         # Sacred UI components
│   ├── ui/             # Base UI components
│   └── layout/         # Layout components
├── lib/                # Utilities and configs
└── public/             # Static assets
```