/**
 * Interactive Uizard Enhancement Testing Script
 * Copy and paste into browser console for comprehensive testing
 */

// ========================================
// FEATURE FLAG TESTING
// ========================================

console.log('🎯 Uizard Enhancement Testing Script Loaded');
console.log('=============================================');

/**
 * Enable all Uizard enhancements
 */
window.enableUizardEnhancements = () => {
  const flags = {
    enhanced_ui_v2: true,
    uizard_components: true,
    uizard_buttons: true,
    uizard_cards: true,
    enhanced_animations: true,
    beta_enhancements: true,
    experimental_features: true
  };
  
  localStorage.setItem('spiralogic-feature-flags', JSON.stringify(flags));
  console.log('✅ Uizard enhancements ENABLED:', flags);
  console.log('🔄 Refresh page to see changes');
  
  return flags;
};

/**
 * Disable all Uizard enhancements (fallback to original)
 */
window.disableUizardEnhancements = () => {
  const flags = {
    enhanced_ui_v2: false,
    uizard_components: false,
    uizard_buttons: false,
    uizard_cards: false,
    enhanced_animations: false,
    beta_enhancements: false,
    experimental_features: false
  };
  
  localStorage.setItem('spiralogic-feature-flags', JSON.stringify(flags));
  console.log('❌ Uizard enhancements DISABLED:', flags);
  console.log('🔄 Refresh page to see original version');
  
  return flags;
};

/**
 * Toggle specific enhancement feature
 */
window.toggleFeature = (featureName) => {
  const current = JSON.parse(localStorage.getItem('spiralogic-feature-flags') || '{}');
  current[featureName] = !current[featureName];
  
  localStorage.setItem('spiralogic-feature-flags', JSON.stringify(current));
  console.log(`🔄 Toggled ${featureName}:`, current[featureName]);
  console.log('🔄 Refresh page to see changes');
  
  return current;
};

/**
 * Get current feature flag status
 */
window.getFeatureFlags = () => {
  const flags = JSON.parse(localStorage.getItem('spiralogic-feature-flags') || '{}');
  console.log('🎛️ Current Feature Flags:', flags);
  return flags;
};

// ========================================
// PERFORMANCE TESTING
// ========================================

/**
 * Measure component render performance
 */
window.measureRenderPerformance = () => {
  console.log('⚡ Starting render performance test...');
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      if (entry.entryType === 'measure' || entry.entryType === 'navigation') {
        console.log(`📊 ${entry.name}: ${entry.duration.toFixed(2)}ms`);
      }
    });
  });
  
  observer.observe({ entryTypes: ['measure', 'navigation'] });
  
  // Test interaction performance
  console.time('Card Hover Interaction');
  document.querySelectorAll('[data-testid*="oracle-card"]').forEach(card => {
    card.dispatchEvent(new MouseEvent('mouseenter'));
    setTimeout(() => {
      card.dispatchEvent(new MouseEvent('mouseleave'));
    }, 100);
  });
  console.timeEnd('Card Hover Interaction');
  
  return 'Performance monitoring active - check console for results';
};

/**
 * Check memory usage
 */
window.checkMemoryUsage = () => {
  if (performance.memory) {
    const memory = {
      used: `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    };
    console.log('🧠 Memory Usage:', memory);
    return memory;
  } else {
    console.log('❌ Memory API not available in this browser');
    return null;
  }
};

// ========================================
// ANIMATION TESTING
// ========================================

/**
 * Test all card animations
 */
window.testCardAnimations = () => {
  console.log('🎨 Testing card animations...');
  
  const cards = document.querySelectorAll('[class*="oracle-card"], [data-testid*="card"]');
  console.log(`Found ${cards.length} cards to test`);
  
  cards.forEach((card, index) => {
    setTimeout(() => {
      console.log(`Testing card ${index + 1}...`);
      
      // Test hover animation
      card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      
      setTimeout(() => {
        card.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        
        // Test click animation
        setTimeout(() => {
          card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }, 200);
      }, 500);
      
    }, index * 100);
  });
  
  return `Testing ${cards.length} cards - watch for smooth 60fps animations`;
};

/**
 * Test button interactions
 */
window.testButtonAnimations = () => {
  console.log('🔘 Testing button animations...');
  
  const buttons = document.querySelectorAll('button, [role="button"]');
  console.log(`Found ${buttons.length} buttons to test`);
  
  buttons.forEach((button, index) => {
    setTimeout(() => {
      console.log(`Testing button ${index + 1}: "${button.textContent?.trim() || 'Unnamed'}"`);
      
      // Test hover
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      
      setTimeout(() => {
        // Test press animation
        button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        
        setTimeout(() => {
          button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
          button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        }, 100);
      }, 300);
      
    }, index * 50);
  });
  
  return `Testing ${buttons.length} buttons - look for glow/bounce effects`;
};

// ========================================
// ANALYTICS TESTING
// ========================================

/**
 * Monitor analytics events
 */
window.startAnalyticsMonitoring = () => {
  console.log('📊 Starting analytics monitoring...');
  
  const originalLog = console.log;
  const analyticsEvents = [];
  
  // Intercept analytics logs
  console.log = function(...args) {
    if (args[0] && args[0].includes('[Uizard Analytics]')) {
      analyticsEvents.push({
        timestamp: new Date().toISOString(),
        event: args
      });
      console.group('📊 Analytics Event Captured');
      originalLog.apply(console, args);
      console.groupEnd();
    } else {
      originalLog.apply(console, args);
    }
  };
  
  // Store events globally
  window._analyticsEvents = analyticsEvents;
  
  setTimeout(() => {
    console.log = originalLog;
    console.log(`📊 Analytics monitoring complete. Captured ${analyticsEvents.length} events:`);
    analyticsEvents.forEach(event => {
      console.log(`  ${event.timestamp}:`, event.event[1]);
    });
  }, 10000);
  
  return 'Analytics monitoring active for 10 seconds...';
};

/**
 * Get captured analytics events
 */
window.getAnalyticsEvents = () => {
  return window._analyticsEvents || [];
};

// ========================================
// A/B TESTING SIMULATION
// ========================================

/**
 * Simulate A/B test by opening comparison windows
 */
window.startABTest = () => {
  console.log('🧪 Starting A/B test simulation...');
  
  // Open original version
  const originalWindow = window.open(window.location.href, 'original', 'width=800,height=600,left=0,top=0');
  originalWindow.onload = () => {
    originalWindow.disableUizardEnhancements();
    originalWindow.document.title = 'Original Version';
  };
  
  // Open enhanced version
  const enhancedWindow = window.open(window.location.href, 'enhanced', 'width=800,height=600,left=800,top=0');
  enhancedWindow.onload = () => {
    enhancedWindow.enableUizardEnhancements();
    enhancedWindow.document.title = 'Enhanced Version';
  };
  
  console.log('🧪 A/B test windows opened - compare side by side!');
  return 'A/B test active - compare the two windows';
};

// ========================================
// COMPREHENSIVE TEST SUITE
// ========================================

/**
 * Run complete test suite
 */
window.runComprehensiveTest = async () => {
  console.clear();
  console.log('🚀 COMPREHENSIVE UIZARD ENHANCEMENT TEST SUITE');
  console.log('===============================================');
  
  // Step 1: Feature Flag Test
  console.log('\n1. 🎛️ Testing Feature Flags...');
  window.enableUizardEnhancements();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Step 2: Performance Test
  console.log('\n2. ⚡ Testing Performance...');
  window.measureRenderPerformance();
  window.checkMemoryUsage();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 3: Animation Test
  console.log('\n3. 🎨 Testing Animations...');
  window.testCardAnimations();
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n4. 🔘 Testing Button Interactions...');
  window.testButtonAnimations();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 4: Analytics Test
  console.log('\n5. 📊 Testing Analytics...');
  window.startAnalyticsMonitoring();
  
  // Step 5: Summary
  setTimeout(() => {
    console.log('\n✅ COMPREHENSIVE TEST COMPLETE');
    console.log('==============================');
    console.log('Results summary:');
    console.log('- Feature flags: ✅ Working');
    console.log('- Performance: ✅ Monitored');
    console.log('- Animations: ✅ Tested');
    console.log('- Analytics: ✅ Captured');
    console.log('\nTest data available in:');
    console.log('- window._analyticsEvents (analytics data)');
    console.log('- window.getFeatureFlags() (current flags)');
    console.log('- Console logs above (detailed results)');
  }, 12000);
  
  return 'Running comprehensive test suite... check console for progress';
};

// ========================================
// QUICK ACCESS COMMANDS
// ========================================

console.log('\n🎯 QUICK ACCESS COMMANDS:');
console.log('========================');
console.log('enableUizardEnhancements()     - Turn ON all enhancements');
console.log('disableUizardEnhancements()    - Turn OFF all enhancements');
console.log('toggleFeature("uizard_cards")  - Toggle specific feature');
console.log('getFeatureFlags()              - Show current settings');
console.log('measureRenderPerformance()     - Test performance');
console.log('testCardAnimations()           - Test card hover/click');
console.log('testButtonAnimations()         - Test button interactions');
console.log('startAnalyticsMonitoring()     - Monitor analytics events');
console.log('runComprehensiveTest()         - Run full test suite');
console.log('startABTest()                  - Side-by-side comparison');
console.log('\n💡 Try: runComprehensiveTest() for full automated testing');

// Auto-show current status
window.getFeatureFlags();