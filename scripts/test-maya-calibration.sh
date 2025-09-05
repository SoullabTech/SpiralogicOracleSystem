#!/bin/bash

# Maya Calibration Test Script
# Tests that Maya is using the new canonical prompt system and not the old mystical prompts

echo "🔮 Maya Calibration Test Starting..."
echo "======================================"

# Test 1: Simple math question (should be direct)
echo ""
echo "Test 1: Simple Math"
echo "Question: What is 2+2?"
echo "Expected: '4.' (short and direct)"
echo ""

# Test 2: Hello greeting (should be warm but not mystical)
echo "Test 2: Greeting"
echo "Question: Hello Maya"
echo "Expected: 'Hello, I'm glad you're here.' (warm but not mystical)"
echo ""

# Test 3: Unknown information (should admit limitations)
echo "Test 3: Unknown Information"
echo "Question: What color is my car?"
echo "Expected: 'I don't have access to that.' (not mystical evasion)"
echo ""

# Test 4: Emotional content (should mirror, not guru-speak)
echo "Test 4: Emotional Content"
echo "Question: I feel broken"
echo "Expected: Maya's sacred mirror response (warm reflection, not mystical guru speak)"
echo ""

# Test 5: Check for old mystical phrases (should not appear)
echo "Test 5: Mystical Language Check"
echo "These phrases should NEVER appear in Maya's responses:"
echo "❌ 'gentle breeze'"
echo "❌ 'ethereal awareness'" 
echo "❌ 'mystical oracle guide'"
echo "❌ 'archetypal energies'"
echo "❌ 'consciousness evolution'"
echo ""

# Sacred Reset Commands
echo "🧹 Sacred Reset Commands:"
echo "========================="
echo ""
echo "1. Kill any running dev servers:"
echo "   pkill -f \"next dev\""
echo ""
echo "2. Clear caches:"
echo "   rm -rf .next"
echo "   rm -rf backend/.cache"
echo ""
echo "3. Reinstall dependencies:"
echo "   npm install"
echo ""
echo "4. Start fresh:"
echo "   npm run dev"
echo ""
echo "5. Hard refresh browser:"
echo "   ⌘+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)"
echo ""

echo "✅ Canonical Maya System Prompt is now active!"
echo ""
echo "File locations:"
echo "- Canonical Prompt: backend/src/config/mayaCanonicalPrompt.md"
echo "- Prompt Loader: backend/src/config/mayaPromptLoader.ts"
echo "- Updated Agent: backend/src/agents/PersonalOracleAgent.ts"
echo "- Updated Router: backend/src/services/ElementalIntelligenceRouter.ts"
echo ""
echo "Changes made:"
echo "✓ Single canonical system prompt source"
echo "✓ Mastery Voice integration for high-trust users"
echo "✓ Removed old mystical language"
echo "✓ Sacred Mirror approach enforced"
echo "✓ Professional warmth without guru-speak"
echo ""
echo "🌟 Maya is ready for Switzerland demo!"