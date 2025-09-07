/**
 * Maya Voice System Test Script
 * Copy and paste into browser console to test Maya's voice functionality
 */

console.log('🎤 Maya Voice System Test');
console.log('========================');

/**
 * Test Web Speech API availability
 */
window.testVoiceSupport = () => {
  console.log('🔍 Testing Voice Support...');
  
  const results = {
    webSpeechSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    voicesAvailable: false,
    englishVoicesCount: 0,
    femaleVoicesCount: 0,
    recommendedVoices: []
  };

  if (results.webSpeechSupported) {
    const voices = speechSynthesis.getVoices();
    results.voicesAvailable = voices.length > 0;
    results.englishVoicesCount = voices.filter(v => v.lang.startsWith('en')).length;
    
    // Count potential female voices
    const femaleKeywords = ['female', 'samantha', 'victoria', 'karen', 'hazel', 'aria', 'libby'];
    results.femaleVoicesCount = voices.filter(v => 
      femaleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
    ).length;
    
    // Get recommended voices for Maya
    const preferredVoices = ['Samantha', 'Victoria', 'Karen', 'Hazel'];
    results.recommendedVoices = voices
      .filter(v => preferredVoices.some(pv => v.name.includes(pv)))
      .map(v => ({ name: v.name, lang: v.lang, local: v.localService }));
  }

  console.log('✅ Voice Support Results:', results);
  return results;
};

/**
 * Test Maya's greeting with different voices
 */
window.testMayaGreeting = () => {
  console.log('👋 Testing Maya\'s Greeting...');
  
  if (!('speechSynthesis' in window)) {
    console.error('❌ Speech synthesis not supported');
    return;
  }

  const greetings = [
    "Hello, I am Maya, your personal oracle agent. I will learn and evolve with you.",
    "Greetings, seeker. I am Maya, here to guide you through the mysteries that await.",
    "Welcome to your sacred space. I am Maya, and together we shall explore the depths of wisdom."
  ];

  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  
  const utterance = new SpeechSynthesisUtterance(greeting);
  utterance.rate = 0.85;    // Maya's mystical pace
  utterance.pitch = 1.15;   // Maya's ethereal tone
  utterance.volume = 0.8;   // Maya's gentle presence
  utterance.lang = 'en-US';

  // Try to use a good voice for Maya
  const voices = speechSynthesis.getVoices();
  const mayaVoice = voices.find(v => 
    v.name.includes('Samantha') || 
    v.name.includes('Victoria') ||
    v.name.includes('Female') ||
    (v.name.includes('Google') && v.name.includes('Female'))
  );
  
  if (mayaVoice) {
    utterance.voice = mayaVoice;
    console.log(`🎙️ Using voice: ${mayaVoice.name} (${mayaVoice.lang})`);
  } else {
    console.log('🎙️ Using default voice');
  }

  utterance.onstart = () => console.log('🗣️ Maya is speaking...');
  utterance.onend = () => console.log('✅ Maya finished speaking');
  utterance.onerror = (e) => console.error('❌ Maya voice error:', e.error);

  speechSynthesis.speak(utterance);
  console.log('📝 Maya said:', greeting);
};

/**
 * Test voice fallback system (simulating server failure)
 */
window.testVoiceFallback = async () => {
  console.log('🔄 Testing Voice Fallback System...');
  
  try {
    // First, try server endpoint (expected to fail in development)
    console.log('1. Testing server voice synthesis...');
    const response = await fetch('/api/voice/sesame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'This is a fallback test for Maya.' })
    });

    if (response.ok) {
      console.log('✅ Server voice synthesis working');
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        console.log('🔊 Server voice playback completed');
      };
      
      audio.play();
    } else {
      throw new Error('Server voice failed');
    }
  } catch (error) {
    console.log('⚠️ Server voice failed (expected), trying Web Speech API...');
    
    // Fallback to Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Server voice is unavailable, so I am using Web Speech API as a fallback.');
      utterance.rate = 0.85;
      utterance.pitch = 1.15;
      utterance.volume = 0.8;
      
      utterance.onend = () => console.log('✅ Web Speech API fallback successful');
      utterance.onerror = (e) => console.error('❌ All voice methods failed:', e.error);
      
      speechSynthesis.speak(utterance);
    } else {
      console.error('❌ No voice synthesis available');
    }
  }
};

/**
 * Test voice controls integration
 */
window.testVoiceControls = () => {
  console.log('🎛️ Testing Voice Controls...');
  
  // Test if React components are loaded
  const hasReact = typeof window.React !== 'undefined';
  const hasHooks = typeof window.useMayaVoice !== 'undefined';
  
  console.log('React available:', hasReact);
  console.log('Maya hooks available:', hasHooks);
  
  // Test localStorage for voice preferences
  const voiceSettings = localStorage.getItem('maya-voice-settings');
  console.log('Stored voice settings:', voiceSettings ? JSON.parse(voiceSettings) : 'None');
  
  // Test feature flags
  const featureFlags = localStorage.getItem('spiralogic-feature-flags');
  const flags = featureFlags ? JSON.parse(featureFlags) : {};
  console.log('Voice-related feature flags:', {
    enhanced_ui_v2: flags.enhanced_ui_v2,
    uizard_components: flags.uizard_components
  });
};

/**
 * Complete Maya voice system test
 */
window.runMayaVoiceTest = async () => {
  console.clear();
  console.log('🎯 COMPLETE MAYA VOICE SYSTEM TEST');
  console.log('===================================');
  
  console.log('\n1. 🔍 Testing Voice Support...');
  const support = window.testVoiceSupport();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('\n2. 🎛️ Testing Voice Controls...');
  window.testVoiceControls();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (support.webSpeechSupported) {
    console.log('\n3. 👋 Testing Maya Greeting...');
    window.testMayaGreeting();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n4. 🔄 Testing Fallback System...');
    await window.testVoiceFallback();
  } else {
    console.log('\n❌ Skipping voice tests - Web Speech API not supported');
  }
  
  setTimeout(() => {
    console.log('\n✅ MAYA VOICE TEST COMPLETE');
    console.log('============================');
    console.log('Summary:');
    console.log('- Voice Support:', support.webSpeechSupported ? '✅' : '❌');
    console.log('- English Voices:', support.englishVoicesCount);
    console.log('- Female Voices:', support.femaleVoicesCount);
    console.log('- Recommended Voices:', support.recommendedVoices.length);
    
    if (support.webSpeechSupported) {
      console.log('\n🎙️ Maya\'s voice is ready!');
      console.log('Try the "Hear Maya" button in your onboarding or Oracle chat.');
    } else {
      console.log('\n⚠️ Voice synthesis not available in this browser');
      console.log('Maya will respond with text only.');
    }
  }, 5000);
};

// Auto-run basic support check
console.log('\n💡 Quick Commands:');
console.log('==================');
console.log('testVoiceSupport()    - Check voice capabilities');
console.log('testMayaGreeting()    - Hear Maya speak');
console.log('testVoiceFallback()   - Test server → Web Speech fallback');
console.log('testVoiceControls()   - Check React integration');
console.log('runMayaVoiceTest()    - Full automated test suite');
console.log('\n🚀 Try: runMayaVoiceTest() for complete testing\n');

// Show current voice status
window.testVoiceSupport();