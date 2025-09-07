# 🚀 Docker Build & Deploy to Northflank

Dead simple script for building and pushing your agents to Docker Hub for Northflank deployment.

## 📁 Directory Structure

```
northflank-migration/
├── build_and_push.sh       # 🎯 Main build script (USE THIS!)
├── voice-agent/            # Voice agent code & Dockerfile
├── memory-agent/           # Memory agent code & Dockerfile
├── docker-compose.yml      # Local testing
└── README.md               # This guide
```

## 🛠 Super Simple Usage

1. **Make sure your Dockerfiles are ready:**
   ```bash
   ls voice-agent/Dockerfile memory-agent/Dockerfile
   ```

2. **Run the magic script:**
   ```bash
   ./build_and_push.sh
   ```

3. **Copy the image paths to Northflank:**
   - `andreanezat/voice-agent:latest`
   - `andreanezat/memory-agent:latest`

That's it! 🎉

## 🎯 What the Script Does

✅ **Cleanup** - Removes old Docker cache and layers  
✅ **Login** - Authenticates with Docker Hub  
✅ **Build** - Creates linux/amd64 images for both agents  
✅ **Push** - Uploads images to Docker Hub  
✅ **Verify** - Confirms images are available on Docker Hub  
✅ **Summary** - Shows you exactly what to use in Northflank  

## 🔧 Configuration

Edit the script to customize:
```bash
DOCKER_USER="andreanezat"      # Your Docker Hub username
VOICE_PATH="./voice-agent"     # Path to voice agent code
MEMORY_PATH="./memory-agent"   # Path to memory agent code
```

## 🐛 Troubleshooting

**"Directory not found" error:**
```bash
# Make sure your agent directories exist:
mkdir -p voice-agent memory-agent
```

**Docker login fails:**
```bash
# Login manually first:
docker login
```

**Build fails:**
```bash
# Check your Dockerfiles:
docker build voice-agent/  # Test voice agent
docker build memory-agent/ # Test memory agent
```

**Images not found on Docker Hub:**
```bash
# Check your repositories exist:
# Go to https://hub.docker.com/u/andreanezat
```

## 📋 Northflank Deployment

After successful build:

1. **Go to Northflank Dashboard**
2. **Create New Service**
3. **Choose "Deploy from Docker Hub"**
4. **Enter Image Path:** `andreanezat/voice-agent:latest`
5. **Set Environment Variables** (if needed)
6. **Deploy!**

Repeat for memory agent with `andreanezat/memory-agent:latest`

## 🔍 Verification Features

The script automatically:
- ✅ Checks Docker Hub API to verify uploads
- ✅ Shows image sizes and info
- ✅ Provides exact next steps
- ✅ Gives you copy-paste ready image paths

## 💡 Pro Tips

- Run script from `northflank-migration/` directory
- Ensure Docker Desktop is running
- Check Docker Hub rate limits if builds are slow
- Use `.dockerignore` files to speed up builds
- The script handles linux/amd64 architecture automatically

## 🎯 What You Get

After running `./build_and_push.sh`:

```
✅ andreanezat/voice-agent:latest  → Ready for Northflank
✅ andreanezat/memory-agent:latest → Ready for Northflank
```

Just paste those image paths into Northflank and you're done! 🚀