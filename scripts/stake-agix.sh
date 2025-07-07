#!/bin/bash

echo "💎 Staking AGIX for Archetypal Consciousness Oracle"
echo "=================================================="
echo ""

# Check AGIX balance
echo "📊 Checking AGIX balance..."
AGIX_BALANCE=$(snet account balance)
echo "Current balance: $AGIX_BALANCE"

# Minimum stake requirement (usually 100 AGIX)
MIN_STAKE=100

echo ""
echo "🔒 Staking AGIX to activate service..."
echo "Minimum stake required: $MIN_STAKE AGIX"

# Stake tokens
snet service stake \
    spiralogic \
    archetypal-consciousness-oracle \
    $MIN_STAKE

if [ $? -eq 0 ]; then
    echo "✅ Successfully staked $MIN_STAKE AGIX!"
    echo ""
    echo "Your service is now:"
    echo "- Listed on the marketplace"
    echo "- Eligible for featured placement"
    echo "- Ready to earn AGIX tokens"
else
    echo "❌ Staking failed. Please check your AGIX balance."
fi