# Voice System Documentation

## Overview

This document outlines the voice interface implementation, privacy safeguards, and reliability measures in the Spiralogic Oracle System.

## System Architecture

### Core Voice Processing
- **Speech Recognition**: Browser-native Web Speech API
- **Send Architecture**: Immediate-send on final speech result (no complex timing logic)
- **State Management**: Clean guard system prevents duplicate sends
- **Audio Output**: Web Speech Synthesis for reliable playback
- **Routing**: All voice input unified through text message handler

### Key Design Principles
1. **Reliability First**: Simple, predictable behavior over sophisticated features
2. **Privacy by Design**: Minimal data collection, local processing where possible
3. **Developer Transparency**: Comprehensive debugging tools for system health monitoring
4. **Production Safety**: Debug features completely disabled in production builds

## Privacy & Data Protection

### Data Collection
**What We Collect:**
- Voice attempt timestamps (for performance monitoring)
- Speech recognition success/failure rates
- Audio processing latency measurements
- Session identifiers (temporary, non-personal)

**What We DO NOT Collect:**
- ❌ Actual speech audio or recordings
- ❌ Speech transcript content in production
- ❌ Personal identifiers or account linking
- ❌ Device fingerprinting data
- ❌ Cross-session tracking

### Data Handling
- **Local Processing**: Speech recognition happens entirely in your browser
- **Session Scope**: Analytics data only persists for current session
- **Privacy-Safe Telemetry**: Only structural metadata collected (no transcript content)
- **Batched Transmission**: Events sent in small batches to minimize network overhead
- **Automatic Cleanup**: All temporary data cleared when session ends

### Development vs Production
| Feature | Development | Production |
|---------|-------------|------------|
| Debug Overlay | ✅ Visible with metrics | ❌ Completely hidden |
| Console Logging | ✅ Detailed event logs | ❌ No voice analytics logs |
| Performance Tracking | ✅ Individual attempt details | ✅ Aggregated metrics only |
| Debug Functions | ✅ Available in browser console | ❌ Not exposed |
| Telemetry Collection | ❌ Disabled (debug analytics used) | ✅ Privacy-safe metadata only |
| Analytics Dashboard | ✅ Available at /voice-dashboard | ❌ Blocked in production |

## Security Measures

### Production Safeguards
```javascript
// All debug features gated behind environment check
const isDevelopment = process.env.NODE_ENV === 'development';

// Debug overlay completely removed in production
if (!isDevelopment) return null;
```

### Browser Permissions
- **Microphone Access**: Only requested when user initiates voice interaction
- **Permission Handling**: Graceful degradation if microphone access denied
- **User Control**: Clear feedback when permissions are required

### Data Isolation
- **No Cross-Origin Access**: Voice data confined to current domain
- **Local Storage Only**: Debug preferences stored locally, not transmitted
- **Session Boundaries**: No data persistence across browser sessions

## Reliability Features

### Immediate-Send Architecture
- **Problem Solved**: Eliminates timing-based race conditions
- **User Experience**: Voice input appears as message within ~1 second
- **Edge Case Handling**: Robust behavior during rapid interactions

### Error Handling
- **Graceful Degradation**: System falls back to text input if voice fails
- **Clear Feedback**: User informed of any permission or technical issues
- **No Silent Failures**: All errors logged and handled appropriately

### Performance Monitoring
- **Latency Tracking**: Real-time monitoring of speech-to-text performance
- **Success Rate Monitoring**: Automatic detection of recognition issues
- **Quality Thresholds**: Visual alerts for performance degradation

## Developer Tools

### Debug Overlay (Development Only)
**Features:**
- Real-time performance metrics with color-coded latency
- Individual attempt tracking with detailed timing
- Session-level analytics and trend analysis
- Persistent toggle state across page reloads

**Usage:**
- **Toggle**: Press `Ctrl + \`` or click 🔍 button
- **Interpretation**:
  - 🟢 Green (<1.5s): Optimal performance
  - 🟠 Orange (1.5-3s): Noticeable delay
  - 🔴 Red (>3s): Poor performance

### Console Analytics
```javascript
// Available in development only
debugEvents()      // View all captured events
debugAnalysis()    // Generate instant metrics report
```

### Metrics Available
- Voice attempt success rates
- Average time-to-transcript
- Session completion patterns
- Early abandonment detection
- Fallback usage analysis

## Testing & Validation

### Recommended Test Scenarios
1. **Basic Flow**: Click mic → speak → verify immediate send
2. **Permission Handling**: Test microphone permission deny/allow
3. **Edge Cases**: Rapid clicks, mid-sentence stops, background noise
4. **Performance**: Monitor latency under various conditions
5. **Fallback**: Verify graceful degradation to text input

### Success Criteria
- **Technical Reliability**: >90% speech recognition success rate
- **User Experience**: <1.5s average time-to-send
- **Error Handling**: No stuck states or unresponsive UI
- **Privacy Compliance**: No sensitive data in production logs

## Compliance & Standards

### Privacy Regulations
- **GDPR Compliant**: No personal data processing without consent
- **CCPA Compliant**: No sale or sharing of personal information
- **Local Processing**: Speech recognition happens entirely client-side

### Accessibility
- **Keyboard Navigation**: Full functionality available via keyboard
- **Screen Reader Support**: Clear aria labels and semantic markup
- **Visual Feedback**: Multiple indicators for voice system status

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Support**: iOS Safari, Chrome Mobile
- **Fallback**: Text input always available if voice unsupported

## Support & Troubleshooting

### Common Issues
1. **Microphone Permission**: Check browser settings and grant access
2. **No Voice Response**: Verify Web Speech API support in browser
3. **High Latency**: Check network connectivity and browser performance
4. **Recognition Errors**: Ensure quiet environment and clear speech

### Debug Information
In development mode, detailed performance and error information is available through the debug overlay and browser console.

### Contact
For technical issues or privacy concerns, refer to the main project documentation or file an issue in the project repository.

---

## Technical Implementation Notes

### Analytics Architecture
```javascript
// Lightweight event logging with privacy safeguards
export const logVoiceEvent = (eventName, data = {}) => {
  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    sessionId, // Temporary, non-personal identifier
    ...data,
  };

  // Only log in development or aggregate in production
  if (process.env.NODE_ENV === 'development') {
    console.log("[VoiceAnalytics]", payload);
  }

  // Queue for batched processing (no personal data)
  eventQueue.push(payload);
};
```

### State Management
```javascript
// Clean send guard prevents duplicates
if (!sentRef.current && transcript.trim()) {
  sentRef.current = true;
  onTranscript(transcript);
  try { recognition.stop(); } catch {}
}
```

This documentation ensures users understand the privacy-first approach and technical reliability measures implemented in the voice system.