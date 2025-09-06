#!/usr/bin/env node

/**
 * Beta Launch Verification Script
 * Ensures all components are ready for beta testing
 */

const fs = require('fs');
const path = require('path');

const checks = {
  'Core Components': [
    {
      name: 'Beta Mirror Page',
      path: 'app/beta-mirror/page.tsx',
      required: true
    },
    {
      name: 'Beta Minimal Mirror Component',
      path: 'components/chat/BetaMinimalMirror.tsx',
      required: true
    },
    {
      name: 'Hybrid Input Component',
      path: 'components/chat/HybridInput.tsx',
      required: true
    },
    {
      name: 'Maia Bubble Component',
      path: 'components/chat/MaiaBubble.tsx',
      required: true
    }
  ],
  'Toast System': [
    {
      name: 'Toast Provider',
      path: 'components/system/ToastProvider.tsx',
      required: true
    },
    {
      name: 'Toast Component',
      path: 'components/system/Toast.tsx',
      required: true
    },
    {
      name: 'useToast Hook',
      path: 'hooks/useToast.ts',
      required: true
    }
  ],
  'Audio & Analytics': [
    {
      name: 'Audio Unlock Module',
      path: 'lib/audio/audioUnlock.ts',
      required: true
    },
    {
      name: 'Event Tracking',
      path: 'lib/analytics/eventTracking.ts',
      required: true
    },
    {
      name: 'Voice Flow Analytics',
      path: 'lib/analytics/voiceFlowAnalytics.ts',
      required: true
    },
    {
      name: 'Analytics API Route',
      path: 'app/api/analytics/audio/route.ts',
      required: true
    }
  ],
  'Dashboard Widgets': [
    {
      name: 'Audio Unlock Widget',
      path: 'components/dashboard/AudioUnlockWidget.tsx',
      required: true
    },
    {
      name: 'Browser Breakdown Widget',
      path: 'components/dashboard/AudioUnlockByBrowser.tsx',
      required: true
    }
  ],
  'Testing Documentation': [
    {
      name: 'Beta Testing Script',
      path: 'docs/BETA_TESTING_SCRIPT.md',
      required: true
    },
    {
      name: 'Beta Feedback Form',
      path: 'docs/BETA_FEEDBACK_FORM.md',
      required: true
    },
    {
      name: 'Beta Launch Checklist',
      path: 'docs/BETA_LAUNCH_CHECKLIST.md',
      required: true
    },
    {
      name: 'Beta Feedback Analysis',
      path: 'docs/BETA_FEEDBACK_ANALYSIS.md',
      required: true
    }
  ]
};

let totalChecks = 0;
let passedChecks = 0;
let warnings = [];

console.log('🚀 Beta Launch Verification\n');
console.log('=' .repeat(50));

// Check each category
for (const [category, items] of Object.entries(checks)) {
  console.log(`\n📦 ${category}`);
  console.log('-'.repeat(40));
  
  for (const item of items) {
    totalChecks++;
    const fullPath = path.join(__dirname, '..', item.path);
    const exists = fs.existsSync(fullPath);
    
    if (exists) {
      passedChecks++;
      console.log(`  ✅ ${item.name}`);
      
      // Additional validation for specific files
      if (item.path.includes('BetaMinimalMirror')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (!content.includes('ToastProvider')) {
          warnings.push(`⚠️  ${item.name} might be missing ToastProvider integration`);
        }
        if (!content.includes('useToastContext')) {
          warnings.push(`⚠️  ${item.name} might not be using toast notifications`);
        }
      }
      
      if (item.path.includes('HybridInput')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (!content.includes('unlockAudio')) {
          warnings.push(`⚠️  ${item.name} might be missing audio unlock integration`);
        }
      }
    } else {
      console.log(`  ❌ ${item.name} - NOT FOUND`);
      if (item.required) {
        console.log(`     ⚠️  This is a required component!`);
      }
    }
  }
}

// Check for analytics integration
console.log('\n📊 Analytics Integration Check');
console.log('-'.repeat(40));

const hybridInputPath = path.join(__dirname, '..', 'components/chat/HybridInput.tsx');
if (fs.existsSync(hybridInputPath)) {
  const content = fs.readFileSync(hybridInputPath, 'utf8');
  const hasAudioUnlock = content.includes('unlockAudio');
  const hasToast = content.includes('showToast');
  
  console.log(`  ${hasAudioUnlock ? '✅' : '❌'} Audio unlock integration`);
  console.log(`  ${hasToast ? '✅' : '❌'} Toast notification support`);
  
  if (hasAudioUnlock && hasToast) {
    passedChecks++;
    totalChecks++;
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📋 SUMMARY\n');
console.log(`Total Checks: ${totalChecks}`);
console.log(`Passed: ${passedChecks}`);
console.log(`Failed: ${totalChecks - passedChecks}`);
console.log(`Success Rate: ${Math.round((passedChecks / totalChecks) * 100)}%`);

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(w => console.log(`  ${w}`));
}

// Final verdict
console.log('\n' + '='.repeat(50));
if (passedChecks === totalChecks) {
  console.log('✅ READY FOR BETA LAUNCH!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run build');
  console.log('2. Test locally at: http://localhost:3000/beta-mirror');
  console.log('3. Deploy to staging');
  console.log('4. Begin beta testing with BETA_TESTING_SCRIPT.md');
} else {
  console.log('❌ NOT READY - Please fix missing components');
  console.log('\nMissing critical components. Review the failures above.');
}

console.log('\n');
process.exit(passedChecks === totalChecks ? 0 : 1);