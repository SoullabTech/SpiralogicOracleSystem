#!/usr/bin/env node

/**
 * Quick feature flag verification
 * Shows current configuration and provides recommendations
 */

console.log('🚀 Feature Flag Status Check\n')

// Simulate the environment (this would normally be from process.env)
const envFlags = {
  NEXT_PUBLIC_LIBRARY_ENABLED: 'true',
  NEXT_PUBLIC_LIBRARY_TIMELINE_ENABLED: 'false',
  NEXT_PUBLIC_LIBRARY_REPROCESS_ENABLED: 'false',
  NEXT_PUBLIC_LIBRARY_OFFLINE_CAPTURE: 'false',
  // Oracle defaults
  NEXT_PUBLIC_ORACLE_WEAVE_ENABLED: process.env.NEXT_PUBLIC_ORACLE_WEAVE_ENABLED !== 'false',
  NEXT_PUBLIC_ORACLE_VOICE_AUTO_SEND: process.env.NEXT_PUBLIC_ORACLE_VOICE_AUTO_SEND === 'true',
  NEXT_PUBLIC_ORACLE_MULTI_MODAL: process.env.NEXT_PUBLIC_ORACLE_MULTI_MODAL === 'true',
}

// Feature calculations (mimics the actual features object)
const features = {
  library: {
    enabled: envFlags.NEXT_PUBLIC_LIBRARY_ENABLED === 'true',
    timeline: envFlags.NEXT_PUBLIC_LIBRARY_TIMELINE_ENABLED === 'true' && envFlags.NEXT_PUBLIC_LIBRARY_ENABLED === 'true',
    reprocess: envFlags.NEXT_PUBLIC_LIBRARY_REPROCESS_ENABLED === 'true' && envFlags.NEXT_PUBLIC_LIBRARY_ENABLED === 'true',
    offlineCapture: envFlags.NEXT_PUBLIC_LIBRARY_OFFLINE_CAPTURE === 'true' && envFlags.NEXT_PUBLIC_LIBRARY_ENABLED === 'true',
  },
  oracle: {
    weaveEnabled: envFlags.NEXT_PUBLIC_ORACLE_WEAVE_ENABLED !== 'false', // Default true
    voiceAutoSend: envFlags.NEXT_PUBLIC_ORACLE_VOICE_AUTO_SEND === 'true',
    multiModal: envFlags.NEXT_PUBLIC_ORACLE_MULTI_MODAL === 'true',
  }
}

// Display current configuration
console.log('📚 Library Features:')
console.log(`   ✅ Enabled: ${features.library.enabled ? 'YES' : 'NO'}`)
console.log(`   📊 Timeline: ${features.library.timeline ? 'YES' : 'NO'}`)
console.log(`   🔄 Reprocess: ${features.library.reprocess ? 'YES' : 'NO'}`)
console.log(`   📱 Offline Capture: ${features.library.offlineCapture ? 'YES' : 'NO'}`)

console.log('\n🔮 Oracle Features:')
console.log(`   🧵 Thread Weaving: ${features.oracle.weaveEnabled ? 'YES' : 'NO'}`)
console.log(`   🎤 Voice Auto-Send: ${features.oracle.voiceAutoSend ? 'YES' : 'NO'}`)
console.log(`   📎 Multi-Modal: ${features.oracle.multiModal ? 'YES' : 'NO'}`)

// Recommendations
console.log('\n💡 Recommendations:')

if (features.library.enabled && !features.library.timeline) {
  console.log('   • Consider enabling LIBRARY_TIMELINE_ENABLED for better UX')
}

if (features.oracle.weaveEnabled) {
  console.log('   ✅ Oracle Weave is enabled - users can create conversation summaries')
} else {
  console.log('   ⚠️  Oracle Weave is disabled - consider enabling for better user engagement')
}

if (!features.oracle.multiModal) {
  console.log('   • Enable ORACLE_MULTI_MODAL to allow file uploads in oracle chat')
}

// Usage examples
console.log('\n🔧 Usage in Components:')
console.log(`
// Direct check
import { features } from '@/lib/config/features'

if (features.library.enabled) {
  return <LibraryView />
}

// Hook with capabilities
import { useFeature } from '@/hooks/useFeature'

const weave = useFeature('oracle.weaveEnabled')
if (weave.isEnabled) {
  return <WeaveButton />
}
`)

// Current state summary
const enabledFeatures = []
const disabledFeatures = []

if (features.library.enabled) enabledFeatures.push('Library')
else disabledFeatures.push('Library')

if (features.library.timeline) enabledFeatures.push('Timeline')
else disabledFeatures.push('Timeline')

if (features.oracle.weaveEnabled) enabledFeatures.push('Thread Weaving')
else disabledFeatures.push('Thread Weaving')

if (features.oracle.multiModal) enabledFeatures.push('Multi-Modal')
else disabledFeatures.push('Multi-Modal')

console.log('\n📊 Summary:')
console.log(`   🟢 Enabled (${enabledFeatures.length}): ${enabledFeatures.join(', ') || 'None'}`)
console.log(`   🔴 Disabled (${disabledFeatures.length}): ${disabledFeatures.join(', ') || 'None'}`)

console.log('\n🌐 Next Steps:')
console.log('   1. Visit /dev/features to see live status')
console.log('   2. Test Oracle Weave by having a conversation and clicking "Weave thread"')
console.log('   3. Enable additional features as needed for your use case')
console.log('')