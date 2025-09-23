#!/bin/bash

# Setup script for MAIA Obsidian Export Cron Job

echo "🚀 Setting up MAIA Obsidian Export scheduled job..."

# Get the current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 Project directory: $PROJECT_DIR"

# Check if .env file exists
if [ ! -f "$PROJECT_DIR/.env.local" ]; then
    echo "⚠️  Warning: .env.local file not found"
    echo "   Create .env.local with required environment variables:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - OBSIDIAN_VAULT_PATH"
fi

# Create a wrapper script that loads environment variables
cat > "$PROJECT_DIR/scripts/export-nightly-wrapper.sh" << EOF
#!/bin/bash

# Load environment variables
if [ -f "$PROJECT_DIR/.env.local" ]; then
    export \$(cat "$PROJECT_DIR/.env.local" | grep -v '^#' | xargs)
fi

if [ -f "$PROJECT_DIR/.env" ]; then
    export \$(cat "$PROJECT_DIR/.env" | grep -v '^#' | xargs)
fi

# Change to project directory
cd "$PROJECT_DIR"

# Run the export script
npm run export:nightly >> "$PROJECT_DIR/logs/export-nightly.log" 2>&1
EOF

chmod +x "$PROJECT_DIR/scripts/export-nightly-wrapper.sh"

# Create logs directory
mkdir -p "$PROJECT_DIR/logs"

# Create crontab entry
CRON_ENTRY="0 2 * * * $PROJECT_DIR/scripts/export-nightly-wrapper.sh"

echo "📅 Setting up crontab entry:"
echo "   $CRON_ENTRY"
echo ""
echo "This will run the export job daily at 2:00 AM"
echo ""

# Check if crontab already has this entry
if crontab -l 2>/dev/null | grep -q "export-nightly-wrapper.sh"; then
    echo "⚠️  Crontab entry already exists. Skipping..."
else
    # Add to crontab
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    echo "✅ Crontab entry added successfully"
fi

echo ""
echo "🔧 Setup options:"
echo ""
echo "1. View current crontab:"
echo "   crontab -l"
echo ""
echo "2. Remove the cron job:"
echo "   crontab -l | grep -v 'export-nightly-wrapper.sh' | crontab -"
echo ""
echo "3. Test the export manually:"
echo "   npm run export:test"
echo ""
echo "4. View export logs:"
echo "   tail -f $PROJECT_DIR/logs/export-nightly.log"
echo ""
echo "5. Alternative: Use system cron alternatives"
echo "   - macOS: Use launchd (see scripts/create-launchd-plist.sh)"
echo "   - Linux systemd: Use systemd timers"
echo "   - Cloud: Use Vercel Cron or GitHub Actions"
echo ""

# Create launchd plist for macOS
cat > "$PROJECT_DIR/scripts/create-launchd-plist.sh" << 'EOF'
#!/bin/bash

# Create launchd plist for macOS (alternative to cron)

PLIST_PATH="$HOME/Library/LaunchAgents/com.maia.obsidian-export.plist"
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd | xargs dirname )"

cat > "$PLIST_PATH" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.maia.obsidian-export</string>
    <key>ProgramArguments</key>
    <array>
        <string>$PROJECT_DIR/scripts/export-nightly-wrapper.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>2</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>$PROJECT_DIR/logs/export-nightly.log</string>
    <key>StandardErrorPath</key>
    <string>$PROJECT_DIR/logs/export-nightly-error.log</string>
</dict>
</plist>
PLIST

echo "📄 Created launchd plist at: $PLIST_PATH"
echo ""
echo "To enable:"
echo "  launchctl load $PLIST_PATH"
echo ""
echo "To disable:"
echo "  launchctl unload $PLIST_PATH"
echo ""
echo "To test immediately:"
echo "  launchctl start com.maia.obsidian-export"

EOF

chmod +x "$PROJECT_DIR/scripts/create-launchd-plist.sh"

echo "✨ Setup complete!"
echo ""
echo "📋 Quick start:"
echo "1. Configure environment variables in .env.local"
echo "2. Test manual export: npm run export:test"
echo "3. Check logs: tail -f logs/export-nightly.log"
echo ""
echo "The nightly export will run automatically at 2:00 AM daily."