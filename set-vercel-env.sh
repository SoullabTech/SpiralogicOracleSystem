#!/bin/bash
# Script to set Vercel production environment variables

echo "Setting Vercel production environment variables..."

# Voice provider settings
echo "VOICE_PROVIDER=sesame"
echo "SESAME_PROVIDER=runpod"

echo ""
echo "To set these in Vercel:"
echo "1. Go to https://vercel.com/dashboard → SpiralogicOracleSystem → Settings → Environment Variables"
echo "2. Add these for Production environment:"
echo "   - VOICE_PROVIDER = sesame"
echo "   - SESAME_PROVIDER = runpod"
echo "3. Redeploy from Deployments tab"

echo ""
echo "Already set:"
echo "   - RUNPOD_API_KEY = [configured in Vercel]"
echo "   - RUNPOD_ENDPOINT_ID = [configured in Vercel]"