#!/usr/bin/env python3
"""
Migration script to build and deploy services to Northflank
"""

import os
import sys
import subprocess
import json
import time
from pathlib import Path

# Configuration
CONFIG = {
    "registry": "ghcr.io",  # GitHub Container Registry (free for public repos)
    "namespace": "soullabtech",  # Your GitHub username/org
    "services": {
        "voice-agent": {
            "path": "../voice-agent",
            "description": "TTS service with GPU support",
            "port": 8000,
            "requires_gpu": True
        },
        "memory-agent": {
            "path": "../memory-agent", 
            "description": "Context and conversation storage",
            "port": 8000,
            "requires_gpu": False
        }
    }
}

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def log(message, color=None):
    """Log with optional color"""
    if color:
        print(f"{color}{message}{Colors.END}")
    else:
        print(message)

def run_cmd(cmd, cwd=None, check=True):
    """Run a command and return the result"""
    log(f"Running: {cmd}", Colors.BLUE)
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            cwd=cwd, 
            check=check,
            capture_output=True,
            text=True
        )
        if result.stdout:
            print(result.stdout)
        return result
    except subprocess.CalledProcessError as e:
        log(f"Command failed: {e}", Colors.RED)
        if e.stderr:
            log(f"Error: {e.stderr}", Colors.RED)
        if check:
            sys.exit(1)
        return e

def check_prerequisites():
    """Check that required tools are available"""
    log("🔍 Checking prerequisites...", Colors.YELLOW)
    
    # Check Docker
    try:
        subprocess.run(["docker", "--version"], check=True, capture_output=True)
        log("✅ Docker is available", Colors.GREEN)
    except (subprocess.CalledProcessError, FileNotFoundError):
        log("❌ Docker is not available. Please install Docker first.", Colors.RED)
        sys.exit(1)
    
    # Check Docker login (for pushing)
    result = subprocess.run(["docker", "info"], capture_output=True, text=True)
    if "Registry: https://index.docker.io/v1/" not in result.stdout:
        log("⚠️  Docker may not be logged in. You may need to run 'docker login' if pushing fails.", Colors.YELLOW)

def build_service(service_name, service_config):
    """Build a Docker image for a service"""
    log(f"🔨 Building {service_name}...", Colors.YELLOW)
    
    service_path = Path(__file__).parent / service_config["path"]
    if not service_path.exists():
        log(f"❌ Service path not found: {service_path}", Colors.RED)
        return False
    
    # Build image tag
    tag = f"{CONFIG['registry']}/{CONFIG['namespace']}/{service_name}:latest"
    
    # Build Docker image
    cmd = f"docker build -t {tag} ."
    result = run_cmd(cmd, cwd=service_path, check=False)
    
    if result.returncode == 0:
        log(f"✅ Built {service_name} successfully", Colors.GREEN)
        return tag
    else:
        log(f"❌ Failed to build {service_name}", Colors.RED)
        return None

def push_service(tag):
    """Push a Docker image to registry"""
    log(f"📤 Pushing {tag}...", Colors.YELLOW)
    
    cmd = f"docker push {tag}"
    result = run_cmd(cmd, check=False)
    
    if result.returncode == 0:
        log(f"✅ Pushed {tag} successfully", Colors.GREEN)
        return True
    else:
        log(f"❌ Failed to push {tag}", Colors.RED)
        return False

def test_service_locally(service_name, tag):
    """Test a service locally before deploying"""
    log(f"🧪 Testing {service_name} locally...", Colors.YELLOW)
    
    # Run container
    cmd = f"docker run -d --name test-{service_name} -p 8080:8000 {tag}"
    result = run_cmd(cmd, check=False)
    
    if result.returncode != 0:
        log(f"❌ Failed to start test container for {service_name}", Colors.RED)
        return False
    
    # Wait for startup
    time.sleep(5)
    
    # Test health endpoint
    health_cmd = "curl -f http://localhost:8080/health || echo 'Health check failed'"
    result = run_cmd(health_cmd, check=False)
    
    # Clean up
    run_cmd(f"docker stop test-{service_name}", check=False)
    run_cmd(f"docker rm test-{service_name}", check=False)
    
    if "healthy" in result.stdout:
        log(f"✅ {service_name} health check passed", Colors.GREEN)
        return True
    else:
        log(f"⚠️  {service_name} health check failed - check the logs", Colors.YELLOW)
        return False

def generate_northflank_config(built_images):
    """Generate Northflank configuration file"""
    log("📝 Generating Northflank configuration...", Colors.YELLOW)
    
    config = {
        "apiVersion": "v1",
        "spec": {
            "kind": "Workflow",
            "name": "spiralogic-oracle-system",
            "services": []
        }
    }
    
    for service_name, tag in built_images.items():
        service_config = CONFIG["services"][service_name]
        
        service_spec = {
            "name": service_name,
            "image": tag,
            "ports": [
                {
                    "name": "http",
                    "port": service_config["port"],
                    "protocol": "TCP"
                }
            ],
            "resources": {
                "requests": {
                    "cpu": "100m",
                    "memory": "256Mi"
                },
                "limits": {
                    "cpu": "1000m" if service_config.get("requires_gpu") else "500m",
                    "memory": "2Gi" if service_config.get("requires_gpu") else "1Gi"
                }
            },
            "env": [
                {"name": "PORT", "value": str(service_config["port"])}
            ]
        }
        
        if service_config.get("requires_gpu"):
            service_spec["resources"]["limits"]["nvidia.com/gpu"] = "1"
        
        config["spec"]["services"].append(service_spec)
    
    # Write config file
    config_path = Path(__file__).parent.parent / ".northflank" / "config.yaml"
    config_path.parent.mkdir(exist_ok=True)
    
    import yaml
    with open(config_path, 'w') as f:
        yaml.dump(config, f, default_flow_style=False)
    
    log(f"✅ Configuration saved to {config_path}", Colors.GREEN)

def main():
    """Main migration workflow"""
    log("🚀 Starting Northflank Migration", Colors.BOLD + Colors.GREEN)
    
    # Check prerequisites
    check_prerequisites()
    
    # Build and push services
    built_images = {}
    
    for service_name, service_config in CONFIG["services"].items():
        log(f"\n{'='*50}", Colors.BLUE)
        log(f"Processing {service_name}", Colors.BOLD)
        log(f"Description: {service_config['description']}", Colors.BLUE)
        
        # Build image
        tag = build_service(service_name, service_config)
        if not tag:
            continue
        
        # Test locally (optional)
        if "--skip-test" not in sys.argv:
            test_service_locally(service_name, tag)
        
        # Push image
        if "--skip-push" not in sys.argv:
            if push_service(tag):
                built_images[service_name] = tag
        else:
            built_images[service_name] = tag
    
    # Generate configuration
    if built_images:
        generate_northflank_config(built_images)
    
    # Summary
    log(f"\n{'='*50}", Colors.GREEN)
    log("🎉 Migration Complete!", Colors.BOLD + Colors.GREEN)
    
    if built_images:
        log("\n📦 Built Images:", Colors.BOLD)
        for service, tag in built_images.items():
            log(f"  • {service}: {tag}", Colors.GREEN)
        
        log("\n🚀 Next Steps:", Colors.BOLD)
        log("1. Go to Northflank dashboard", Colors.BLUE)
        log("2. Create a new project", Colors.BLUE)
        log("3. Add services using the images above", Colors.BLUE)
        log("4. Configure environment variables if needed", Colors.BLUE)
        log("5. Deploy and test!", Colors.BLUE)
        
        log(f"\n💡 Pro tip: Use the generated config at .northflank/config.yaml", Colors.YELLOW)
    else:
        log("❌ No images were successfully built", Colors.RED)
        sys.exit(1)

if __name__ == "__main__":
    main()