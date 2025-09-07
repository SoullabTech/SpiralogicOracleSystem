# Northflank Deployment Guide for Sesame CSM

## Overview
This guide walks you through deploying the Sesame CSM server on Northflank, a container deployment platform.

## Prerequisites
1. **Northflank account**: Sign up at https://northflank.com
2. **GitHub repository**: Fork or create a repo with the CSM code
3. **Hugging Face account**: With access to required models

## Step 1: Prepare Your Repository

### Option A: Fork the CSM Repository
1. Fork https://github.com/SesameAILabs/csm
2. Add the server files (`server.py`, `server_requirements.txt`, `Dockerfile`)
3. Push your changes

### Option B: Create a New Repository
1. Create a new GitHub repository
2. Copy the contents of `sesame-csm/` directory
3. Add all the files we created
4. Push to GitHub

## Step 2: Get Hugging Face Token

1. Go to https://huggingface.co/settings/tokens
2. Create a new token with "read" permissions
3. Save the token (starts with `hf_`)
4. Accept model licenses:
   - https://huggingface.co/meta-llama/Llama-3.2-1B
   - https://huggingface.co/sesame/csm-1b

## Step 3: Deploy on Northflank

### Create New Service
1. Log in to Northflank
2. Click "Create Service"
3. Choose "Deploy from Git Repository"
4. Connect your GitHub account and select your repository

### Configure Build Settings
- **Build Type**: Dockerfile
- **Dockerfile Path**: `./Dockerfile`
- **Build Context**: Root directory

### Configure Runtime Settings
- **Port**: 8000
- **Health Check Path**: `/health`
- **CPU**: 1-2 vCPU (minimum)
- **Memory**: 4-8 GB (CSM model is large)
- **GPU**: Enable if available (recommended for faster inference)

### Environment Variables
Add these environment variables:

```bash
NO_TORCH_COMPILE=1
HUGGINGFACE_HUB_TOKEN=hf_your_token_here
```

### Resource Requirements
- **Minimum**: 2 vCPU, 4GB RAM
- **Recommended**: 4 vCPU, 8GB RAM, GPU if available
- **Storage**: 10-20GB for model downloads

## Step 4: Configure Domain and Security

### Custom Domain (Optional)
1. Go to your service settings
2. Add a custom domain
3. Configure DNS settings

### Environment Variables for Your App
Update your `.env.local`:

```bash
# Self-hosted Sesame CSM
SESAME_ENABLED=true
SESAME_SELF_HOSTED=true
SESAME_URL=https://your-service-name.northflank.app
SESAME_API_KEY=optional_if_you_add_auth

# Fallback to Hugging Face if needed
SESAME_FALLBACK_ENABLED=true
SESAME_FALLBACK_URL=https://api-inference.huggingface.co/models/gpt2
```

## Step 5: Testing Your Deployment

Once deployed, test your service:

```bash
# Health check
curl https://your-service-name.northflank.app/health

# Generate speech
curl -X POST https://your-service-name.northflank.app/generate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello from Northflank!","format":"base64"}'
```

## Step 6: Monitoring and Scaling

### Monitoring
- Check Northflank logs for model loading progress
- Monitor CPU/Memory usage
- Set up alerts for downtime

### Scaling
- **Horizontal**: Add more replicas for higher throughput
- **Vertical**: Increase CPU/RAM for faster model loading
- **GPU**: Enable GPU acceleration if available

## Troubleshooting

### Common Issues

1. **Model Download Timeout**
   - Increase startup timeout
   - Use larger instance size
   - Pre-download models in Docker image

2. **Out of Memory**
   - Increase memory allocation
   - Use smaller model variant if available
   - Enable GPU to offload processing

3. **Authentication Issues**
   - Verify Hugging Face token
   - Check model access permissions
   - Ensure token is in environment variables

### Debugging
- Check Northflank logs: Service → Logs tab
- Test locally first with Docker
- Use health endpoint to verify model loading

## Cost Optimization

1. **Use Spot Instances**: If available, for lower costs
2. **Auto-scaling**: Scale down when not in use
3. **Resource Limits**: Set appropriate CPU/memory limits
4. **Caching**: Cache model downloads to reduce startup time

## Security Considerations

1. **API Authentication**: Add API keys for production
2. **Rate Limiting**: Implement request rate limits
3. **HTTPS**: Always use HTTPS in production
4. **Environment Variables**: Keep tokens secure

## Next Steps

After successful deployment:
1. Update your Spiralogic backend to use the new endpoint
2. Test integration with your application
3. Set up monitoring and alerting
4. Consider adding authentication for production use