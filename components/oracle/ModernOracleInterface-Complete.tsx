// Complete the remaining UI sections for production deployment
// This extends the ModernOracleInterface with the final sections

// Add to the existing component after line 552:

/* Message Display Area */
{messages.length === 0 && !voiceState.isListening && (
  <div className="text-center py-12">
    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
      <span className="text-white text-3xl font-semibold">M</span>
    </div>
    <h2 className="text-2xl font-light text-white mb-3">Hello! I'm Maya</h2>
    <p className="text-slate-400 max-w-md mx-auto mb-6">
      Your personal voice oracle. Speak with me naturally or type your thoughts.
    </p>
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={startVoiceRecording}
        disabled={systemStatus.voice !== 'ready'}
        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-full transition-colors"
      >
        <Mic size={18} />
        Start Speaking
      </button>
      <button
        onClick={() => setDebugMode(true)}
        className="px-4 py-2 text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500 rounded-full transition-colors"
      >
        Debug Panel
      </button>
    </div>
  </div>
)}

/* Voice Transcript Preview */
{(voiceState.isListening || voiceState.interimTranscript || voiceState.finalTranscript) && (
  <div className="mb-6">
    <TranscriptPreview
      interimTranscript={voiceState.interimTranscript}
      finalTranscript={voiceState.finalTranscript}
      isListening={voiceState.isListening}
    />
  </div>
)}

/* Chat Messages */
<AnimatePresence>
  {messages.map((message) => (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-2xl ${message.role === 'user' ? 'ml-12' : 'mr-12'}`}>
        {/* Message Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-slate-400 font-mono">
            {message.role === 'user' ? 'YOU' : 'MAYA'}
          </span>
          {message.provider && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              message.provider === 'whisper' ? 'bg-blue-500/20 text-blue-300' :
              message.provider === 'sesame' ? 'bg-amber-500/20 text-amber-300' :
              message.provider === 'elevenlabs' ? 'bg-green-500/20 text-green-300' :
              'bg-gray-500/20 text-gray-300'
            }`}>
              {message.provider}
            </span>
          )}
          {message.confidence && (
            <span className="text-xs text-slate-500">
              {Math.round(message.confidence * 100)}%
            </span>
          )}
        </div>

        {/* Message Content */}
        <div className={`px-4 py-3 rounded-2xl ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 text-white border border-slate-600'
        }`}>
          <p className="text-sm leading-relaxed">{message.text}</p>
          
          {/* Audio Controls for Maya messages */}
          {message.role === 'maya' && message.audioUrl && (
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  const audio = new Audio(message.audioUrl);
                  setCurrentAudio(audio);
                  audio.play();
                }}
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <Volume2 size={12} />
                Play Audio
              </button>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p className="text-xs text-slate-500 mt-1 text-right">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </motion.div>
  ))}
</AnimatePresence>

/* Loading Indicator */
{isLoading && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex justify-start"
  >
    <div className="max-w-2xl mr-12">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-slate-400 font-mono">MAYA</span>
        <span className="text-xs text-slate-500">thinking...</span>
      </div>
      <div className="bg-slate-700 border border-slate-600 px-4 py-3 rounded-2xl">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  </motion.div>
)}

/* Voice Controls - Large Mic Button */
{!voiceState.isListening && messages.length > 0 && (
  <div className="fixed bottom-24 right-6">
    <button
      onClick={startVoiceRecording}
      disabled={systemStatus.voice !== 'ready'}
      className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-105"
    >
      <Mic size={24} className="text-white" />
    </button>
  </div>
)}

/* Input Area */
<div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700">
  <div className="max-w-4xl mx-auto px-4 py-4">
    <form onSubmit={handleSubmit} className="flex items-center space-x-3">
      <div className="flex-1 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={voiceState.isListening ? "Listening..." : "Type your message..."}
          disabled={isLoading || voiceState.isListening}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
        />
      </div>
      
      <button
        type="submit"
        disabled={!input.trim() || isLoading || voiceState.isListening}
        className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
      >
        <Send size={20} />
      </button>
      
      <button
        type="button"
        onClick={voiceState.isListening ? stopVoiceRecording : startVoiceRecording}
        disabled={systemStatus.voice !== 'ready'}
        className={`p-3 rounded-full transition-colors ${
          voiceState.isListening 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-amber-600 hover:bg-amber-700'
        } disabled:opacity-50 text-white`}
      >
        {voiceState.isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
    </form>
  </div>
</div>