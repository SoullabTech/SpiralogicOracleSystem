#!/bin/bash
# Script to manage exlm-agent service on macOS

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "═════════════════════════════════════════════════════"
echo "   🔍 EXLM-Agent Service Manager"
echo "═════════════════════════════════════════════════════"
echo ""

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This script is for macOS only${NC}"
    exit 1
fi

# Check what's using port 3002
echo "Checking port 3002..."
PORT_INFO=$(lsof -i :3002 -sTCP:LISTEN 2>/dev/null | grep -v "^COMMAND" | head -1)

if [ -z "$PORT_INFO" ]; then
    echo -e "${GREEN}✅ Port 3002 is free!${NC}"
    exit 0
fi

# Parse process info
PROCESS_NAME=$(echo "$PORT_INFO" | awk '{print $1}')
PROCESS_PID=$(echo "$PORT_INFO" | awk '{print $2}')
PROCESS_USER=$(echo "$PORT_INFO" | awk '{print $3}')

echo -e "${YELLOW}Port 3002 is in use by:${NC}"
echo "   Process: $PROCESS_NAME"
echo "   PID: $PROCESS_PID"
echo "   User: $PROCESS_USER"
echo ""

# Look for exlm-agent in launch services
echo "Searching for exlm-agent in launch services..."
EXLM_SERVICES=$(launchctl list | grep -i exlm || echo "")

if [ -z "$EXLM_SERVICES" ]; then
    echo -e "${YELLOW}No exlm-agent service found in launchctl${NC}"
    
    # Check if it's a standalone process
    if [[ "$PROCESS_NAME" == *"exlm"* ]] || [[ "$PORT_INFO" == *"exlm-agent"* ]]; then
        echo ""
        echo -e "${BLUE}This appears to be a standalone exlm-agent process${NC}"
        echo ""
        echo "Options:"
        echo "1) Kill the process (temporary fix)"
        echo "2) Exit without changes"
        echo ""
        read -p "Choose an option (1-2): " choice
        
        case $choice in
            1)
                echo "Killing process $PROCESS_PID..."
                kill -9 $PROCESS_PID 2>/dev/null
                sleep 1
                
                # Verify it's gone
                if lsof -i :3002 -sTCP:LISTEN >/dev/null 2>&1; then
                    echo -e "${RED}❌ Failed to kill process${NC}"
                else
                    echo -e "${GREEN}✅ Process killed successfully${NC}"
                    echo -e "${YELLOW}Note: This is temporary. The process may restart on reboot.${NC}"
                fi
                ;;
            2)
                echo "Exiting without changes."
                ;;
        esac
    else
        echo -e "${BLUE}The process using port 3002 doesn't appear to be exlm-agent${NC}"
        echo "You may want to investigate what '$PROCESS_NAME' is."
    fi
else
    # Found exlm service(s)
    echo -e "${YELLOW}Found exlm service(s):${NC}"
    echo "$EXLM_SERVICES"
    echo ""
    
    # Extract service names
    SERVICE_NAMES=$(echo "$EXLM_SERVICES" | awk '{print $3}')
    
    echo "Options:"
    echo "1) Disable exlm-agent service(s) permanently"
    echo "2) Stop service(s) temporarily (until next reboot)"
    echo "3) Exit without changes"
    echo ""
    read -p "Choose an option (1-3): " choice
    
    case $choice in
        1)
            echo "Disabling exlm-agent service(s) permanently..."
            while IFS= read -r service_name; do
                if [ -n "$service_name" ]; then
                    echo "   Disabling $service_name..."
                    launchctl bootout gui/$(id -u) "$service_name" 2>/dev/null
                    launchctl disable gui/$(id -u)/"$service_name" 2>/dev/null
                fi
            done <<< "$SERVICE_NAMES"
            
            sleep 2
            
            # Verify port is free
            if lsof -i :3002 -sTCP:LISTEN >/dev/null 2>&1; then
                echo -e "${YELLOW}⚠️  Port 3002 still in use. You may need to restart your Mac.${NC}"
            else
                echo -e "${GREEN}✅ Service(s) disabled and port 3002 is now free!${NC}"
            fi
            ;;
        2)
            echo "Stopping exlm-agent service(s) temporarily..."
            while IFS= read -r service_name; do
                if [ -n "$service_name" ]; then
                    echo "   Stopping $service_name..."
                    launchctl bootout gui/$(id -u) "$service_name" 2>/dev/null
                fi
            done <<< "$SERVICE_NAMES"
            
            sleep 2
            
            # Verify port is free
            if lsof -i :3002 -sTCP:LISTEN >/dev/null 2>&1; then
                echo -e "${YELLOW}⚠️  Port 3002 still in use${NC}"
            else
                echo -e "${GREEN}✅ Service(s) stopped and port 3002 is now free!${NC}"
                echo -e "${YELLOW}Note: Service(s) will restart on reboot${NC}"
            fi
            ;;
        3)
            echo "Exiting without changes."
            ;;
    esac
fi

echo ""
echo "═════════════════════════════════════════════════════"
echo ""

# Final check
echo "Final status:"
if lsof -i :3002 -sTCP:LISTEN >/dev/null 2>&1; then
    echo -e "${YELLOW}Port 3002 is still in use${NC}"
    echo ""
    echo "Alternative solutions:"
    echo "1. Use the Spiralogic backend on port 3003 instead:"
    echo -e "   ${BLUE}PORT=3003 ./backend/scripts/start-beta.sh${NC}"
    echo ""
    echo "2. Or update your .env.local file:"
    echo -e "   ${BLUE}echo 'PORT=3003' >> backend/.env.local${NC}"
else
    echo -e "${GREEN}✅ Port 3002 is free and ready to use!${NC}"
fi

echo ""