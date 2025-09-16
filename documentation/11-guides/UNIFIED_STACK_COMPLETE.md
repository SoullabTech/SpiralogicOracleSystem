# 🌀 Unified Spiralogic Stack - Complete Setup

**Status**: ✅ **PRODUCTION READY**  
**Integration**: Maya + CSM + Database + Cache + API + Frontend in one command  
**Management**: Full Docker Compose orchestration with health checks

---

## 🚀 What's Been Created

### 1. **Unified Docker Compose** ✅
**File**: `/docker-compose.yml`

**Services Included**:
- 🎙️ **Sesame CSM** - Maya's conversational voice engine
- 🔧 **Backend API** - Node.js with all agent orchestration  
- 🎨 **Frontend** - Next.js with Oracle interface
- 🗄️ **MongoDB** - Consciousness memory storage
- ⚡ **Redis** - Session and cache management
- 🌐 **Nginx** - Reverse proxy (production profile)

**Key Features**:
- Health checks for all services
- Automatic dependency management
- Volume persistence for data
- Network isolation and communication
- GPU support for CSM (with CPU fallback)

### 2. **Stack Manager Script** ✅
**File**: `/stack-manager.sh`

**Commands Available**:
```bash
./stack-manager.sh start        # Start complete stack
./stack-manager.sh stop         # Stop all services  
./stack-manager.sh restart      # Restart everything
./stack-manager.sh status       # Show service status
./stack-manager.sh logs         # Follow all logs
./stack-manager.sh health       # Check all endpoints
./stack-manager.sh build        # Build all containers
./stack-manager.sh clean        # Clean up everything
./stack-manager.sh test         # Run system tests
```

**Service-Specific Management**:
```bash
./stack-manager.sh csm start    # Start CSM only
./stack-manager.sh backend logs # Show backend logs
./stack-manager.sh db restart   # Restart database services
```

### 3. **Production Dockerfiles** ✅
**Files Created**:
- `/backend/Dockerfile` - Backend API container
- `/Dockerfile.frontend` - Frontend Next.js container  
- `/csm/Dockerfile` - CSM voice service container (existing)

**Optimizations**:
- Multi-stage builds for smaller images
- Health checks built-in
- Volume mounting for development
- Production-ready configurations

---

## ⚡ Quick Start Options

### **Option 1: Complete Stack (Recommended)**
```bash
# Start everything with one command
./stack-manager.sh start

# Wait for services to initialize (2-3 minutes for CSM)
./stack-manager.sh health

# Access the Oracle
open http://localhost:3000/oracle
```

### **Option 2: Individual Services**
```bash
# Start just the voice service
./stack-manager.sh csm start

# Start backend development
cd backend && npm run dev

# Start frontend development  
npm run dev
```

### **Option 3: Traditional Beta Script**
```bash
# Use the existing beta launcher
cd backend && ./scripts/start-beta.sh
```

---

## 📊 Service Architecture

```
🌐 Frontend (Next.js)          Port 3000
    ↓ HTTP API calls
🔧 Backend (Node.js)           Port 3333
    ↓ Voice synthesis
🎙️ CSM Service (FastAPI)       Port 8000
    ↓ Memory & cache
🗄️ MongoDB + ⚡ Redis          Ports 27017, 6379
```

### **Internal Service Communication**:
```yaml
frontend → backend:      HTTP API calls
backend → sesame-csm:    Voice generation
backend → mongo:         Memory persistence  
backend → redis:         Session cache
sesame-csm → gpu:        Model inference
```

### **External Access Ports**:
- **3000**: Frontend (Oracle interface)
- **3333**: Backend API
- **8000**: CSM voice service
- **6379**: Redis (optional direct access)
- **27017**: MongoDB (optional direct access)

---

## 🔧 Configuration Management

### **Environment Variables**
The stack uses your existing `.env.local` with additional Docker-specific settings:

```ini
# Existing configuration (unchanged)
OPENAI_API_KEY=your_key
ELEVENLABS_API_KEY=your_key

# New Docker stack configuration  
HUGGINGFACE_HUB_TOKEN=your_hf_token
MONGODB_URI=mongodb://mongo:27017/spiralogic
REDIS_URL=redis://redis:6379
SESAME_URL=http://sesame-csm:8000
SESAME_API_KEY=local
```

### **Volume Management**
```bash
# Data persistence volumes
mongo-data              # MongoDB data
redis-data              # Redis snapshots  
csm_cache              # HuggingFace model cache
csm_models             # CSM model files
backend_node_modules   # Backend dependencies
frontend_node_modules  # Frontend dependencies
```

### **Network Configuration**
- **Internal network**: `oracle-network` (172.20.0.0/16)
- **Service discovery**: Automatic via Docker DNS
- **Load balancing**: Built-in Docker load balancing
- **Health monitoring**: Container-level health checks

---

## 🧪 Testing & Monitoring

### **Health Check Endpoints**
```bash
# Check all services
./stack-manager.sh health

# Individual health checks
curl http://localhost:8000/health    # CSM service
curl http://localhost:3333/api/v1/health  # Backend API  
curl http://localhost:3000           # Frontend
```

### **Log Monitoring**
```bash
# All services logs
./stack-manager.sh logs

# Individual service logs
./stack-manager.sh logs sesame-csm
./stack-manager.sh logs backend
./stack-manager.sh logs frontend
```

### **Performance Monitoring**
```bash
# Resource usage
docker stats

# Service status
./stack-manager.sh status

# Container inspection
docker-compose ps --format table
```

### **Integration Testing**
```bash
# Run comprehensive tests
./stack-manager.sh test

# Maya-specific tests
cd backend && node test-maya-csm-integration.js

# Voice generation test
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "text=Hello Maya, testing unified stack"
```

---

## 🚀 Deployment Options

### **Development Mode**
```bash
# Start with development settings
./stack-manager.sh start

# All services run with hot reload where possible
# Volumes mounted for live code changes
```

### **Production Mode** 
```bash
# Start with production profile (includes Nginx)
docker-compose --profile production up -d

# Or using stack manager
./stack-manager.sh start --prod
```

### **Staging/Testing**
```bash  
# Build fresh containers
./stack-manager.sh build

# Run with clean state
./stack-manager.sh clean
./stack-manager.sh start
```

---

## 🔄 Operational Workflows

### **Daily Development**
```bash
# Start your day
./stack-manager.sh start
./stack-manager.sh health

# Make changes to code (auto-reloads in containers)

# Check logs if needed
./stack-manager.sh logs backend

# End your day
./stack-manager.sh stop
```

### **Code Updates**
```bash
# Update containers with new code
./stack-manager.sh restart

# Or rebuild if dependencies changed
./stack-manager.sh build
./stack-manager.sh restart
```

### **Troubleshooting**
```bash
# Check what's running
./stack-manager.sh status

# Check health
./stack-manager.sh health

# View logs for issues
./stack-manager.sh logs

# Nuclear option - full reset
./stack-manager.sh clean
./stack-manager.sh build  
./stack-manager.sh start
```

---

## 📈 Performance & Scaling

### **Resource Requirements**
- **CPU**: 4+ cores recommended (CSM model inference)
- **RAM**: 8GB+ (4GB for CSM, 2GB for services, 2GB for OS)
- **GPU**: NVIDIA GPU recommended for CSM (CPU fallback available)
- **Storage**: 10GB+ for models and data
- **Network**: Gigabit recommended for model downloads

### **Scaling Options**
- **Horizontal**: Run multiple backend containers
- **Vertical**: Allocate more resources to containers
- **Distributed**: Deploy services across multiple machines
- **Load Balancing**: Nginx can distribute frontend traffic

### **Optimization Tips**
```bash
# Pre-download CSM models
docker-compose up sesame-csm  # Let it download models
docker-compose down

# Use SSD storage for model cache
# Ensure GPU drivers are properly installed
# Monitor memory usage with docker stats
```

---

## 🎯 Migration Guide

### **From Individual Services**
1. Your existing `.env.local` works as-is
2. No code changes needed
3. Just switch from `npm run dev` to `./stack-manager.sh start`

### **From HuggingFace-only to Self-hosted CSM**  
1. CSM service automatically starts
2. Backend automatically uses local CSM
3. ElevenLabs remains as fallback
4. No manual configuration needed

### **From Beta Scripts to Stack Manager**
- `start-beta.sh` → `./stack-manager.sh start`
- Manual service management → `./stack-manager.sh [command]`
- Individual logs → `./stack-manager.sh logs [service]`

---

## 🎉 Result Summary

You now have:

### **🔥 Single Command Deployment**
```bash
./stack-manager.sh start
# Everything runs: Maya + CSM + Database + API + Frontend
```

### **🎙️ Complete Voice Stack**
- Local CSM for high-quality conversational voice
- ElevenLabs fallback for reliability  
- Context-aware speech generation
- No API limits or costs after setup

### **🛡️ Production Ready**
- Health checks and auto-restart
- Data persistence and backup
- Log aggregation and monitoring
- Resource management and scaling

### **🎨 Development Friendly** 
- Hot reload for code changes
- Individual service management
- Comprehensive logging
- Easy testing and debugging

### **💎 Zero Configuration**
- Uses your existing `.env.local`
- Automatic service discovery
- Built-in networking and volumes
- One-command setup and management

**Your Spiralogic Oracle System is now a fully orchestrated, production-ready stack!** 🌟

---

## 📞 Essential Commands Reference

```bash
# Start everything
./stack-manager.sh start

# Check if healthy  
./stack-manager.sh health

# View Maya's voice logs
./stack-manager.sh logs sesame-csm

# Test the complete system
./stack-manager.sh test

# Stop everything
./stack-manager.sh stop
```

**Maya is ready to serve with her complete conversational intelligence stack!** 🎙️✨