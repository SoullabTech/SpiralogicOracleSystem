#!/bin/bash
# Analyze voice engine reliability from historical logs

HISTORY_FILE="logs/voice-status-history.jsonl"

if [ ! -f "$HISTORY_FILE" ]; then
    echo "No voice history found at $HISTORY_FILE"
    echo "Run ./backend/scripts/start-beta.sh a few times to build history"
    exit 1
fi

echo "🔍 Voice Engine Reliability Analysis"
echo "===================================="
echo ""

# Count total runs
TOTAL_RUNS=$(wc -l < "$HISTORY_FILE")
echo "📊 Total startup runs: $TOTAL_RUNS"
echo ""

# Engine availability stats
echo "✅ Engine Availability:"
for engine in sesame huggingface elevenlabs; do
    AVAILABLE_COUNT=$(grep -c "\"$engine\".*\"available\": true" "$HISTORY_FILE")
    PERCENTAGE=$((AVAILABLE_COUNT * 100 / TOTAL_RUNS))
    echo "   ${engine^}: $AVAILABLE_COUNT/$TOTAL_RUNS ($PERCENTAGE%)"
done
echo ""

# Primary engine usage
echo "🎯 Primary Engine Usage:"
for engine in sesame huggingface elevenlabs none; do
    COUNT=$(grep -c "\"primary_engine\": \"$engine\"" "$HISTORY_FILE")
    if [ $COUNT -gt 0 ]; then
        PERCENTAGE=$((COUNT * 100 / TOTAL_RUNS))
        echo "   ${engine^}: $COUNT times ($PERCENTAGE%)"
    fi
done
echo ""

# Recent issues
echo "⚠️  Recent Issues (last 5):"
tail -5 "$HISTORY_FILE" | while IFS= read -r line; do
    TIMESTAMP=$(echo "$line" | jq -r '.timestamp' 2>/dev/null || echo "unknown")
    # Check each engine for issues
    for engine in sesame huggingface elevenlabs; do
        STATUS=$(echo "$line" | jq -r ".engines.$engine.status" 2>/dev/null)
        if [ "$STATUS" = "⚠️" ] || [ "$STATUS" = "❌" ]; then
            DETAILS=$(echo "$line" | jq -r ".engines.$engine.details" 2>/dev/null)
            echo "   [$TIMESTAMP] $engine: $DETAILS"
        fi
    done
done
echo ""

# Best/worst times
echo "🕐 Reliability by Time:"
if command -v jq >/dev/null 2>&1; then
    echo "   All engines available:"
    grep '"all_engines_available": true' "$HISTORY_FILE" | tail -3 | \
        jq -r '.timestamp' | while read -r ts; do echo "   ✅ $ts"; done
    
    echo "   No engines available:"
    grep '"any_engine_available": false' "$HISTORY_FILE" | tail -3 | \
        jq -r '.timestamp' | while read -r ts; do echo "   ❌ $ts"; done
fi

echo ""
echo "📝 Full history: $HISTORY_FILE"