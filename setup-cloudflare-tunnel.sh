#!/bin/bash

# Cloudflare Tunnel Setup for Sesame
# This creates a permanent, secure tunnel to your local Sesame service

echo "🌀 Cloudflare Tunnel Setup for Sesame"
echo "====================================="
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "📦 Installing cloudflared..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install cloudflare/cloudflare/cloudflared
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        sudo dpkg -i cloudflared-linux-amd64.deb
    else
        echo "❌ Please install cloudflared manually from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation"
        exit 1
    fi
fi

echo "✅ cloudflared is installed"
echo ""

# Quick tunnel (temporary, for testing)
echo "Option 1: Quick Tunnel (Temporary - Good for testing)"
echo "------------------------------------------------------"
echo "Run this command:"
echo "  cloudflared tunnel --url http://localhost:8000"
echo ""
echo "This will give you a temporary URL like: https://random-name.trycloudflare.com"
echo ""

# Permanent tunnel setup
echo "Option 2: Permanent Tunnel (Recommended for production)"
echo "-------------------------------------------------------"
echo ""
echo "Step 1: Login to Cloudflare"
echo "  cloudflared tunnel login"
echo ""
echo "Step 2: Create a tunnel named 'sesame'"
echo "  cloudflared tunnel create sesame"
echo ""
echo "Step 3: Create config file"
cat > cloudflared-config.yml << 'EOF'
tunnel: sesame
credentials-file: ~/.cloudflared/[TUNNEL_ID].json

ingress:
  - hostname: sesame.yourdomain.com
    service: http://localhost:8000
  - service: http_status:404
EOF

echo "Config file created: cloudflared-config.yml"
echo ""
echo "Step 4: Route DNS (if you have a domain)"
echo "  cloudflared tunnel route dns sesame sesame.yourdomain.com"
echo ""
echo "Step 5: Run the tunnel"
echo "  cloudflared tunnel run sesame"
echo ""

# Create systemd service for auto-start (Linux/macOS with systemd)
echo "Optional: Install as system service (auto-start on boot)"
echo "---------------------------------------------------------"
cat > sesame-tunnel.service << 'EOF'
[Unit]
Description=Cloudflare Tunnel for Sesame
After=network.target

[Service]
Type=simple
User=YOUR_USER
ExecStart=/usr/local/bin/cloudflared tunnel run sesame
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "Service file created: sesame-tunnel.service"
echo ""
echo "To install as service:"
echo "  sudo cp sesame-tunnel.service /etc/systemd/system/"
echo "  sudo systemctl enable sesame-tunnel"
echo "  sudo systemctl start sesame-tunnel"
echo ""

# Create convenience script
cat > start-sesame-tunnel.sh << 'EOF'
#!/bin/bash
# Start Sesame and Cloudflare Tunnel

echo "🚀 Starting Sesame service..."
cd "$(dirname "$0")"
./sesame-quick-start.sh &

echo "⏳ Waiting for Sesame to start..."
sleep 5

echo "🌐 Starting Cloudflare tunnel..."
cloudflared tunnel --url http://localhost:8000
EOF

chmod +x start-sesame-tunnel.sh

echo "✅ Created start-sesame-tunnel.sh"
echo ""
echo "====================================="
echo "Quick Start Commands:"
echo "====================================="
echo ""
echo "1. For temporary tunnel (easiest):"
echo "   ./start-sesame-tunnel.sh"
echo ""
echo "2. For permanent tunnel:"
echo "   cloudflared tunnel login"
echo "   cloudflared tunnel create sesame"
echo "   cloudflared tunnel run sesame"
echo ""
echo "Then add the tunnel URL to Vercel environment variables!"
echo ""