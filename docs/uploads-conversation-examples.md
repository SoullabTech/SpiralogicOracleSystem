# Upload Conversation Examples

This document showcases how users can interact with uploads conversationally in the Oracle system.

## Audio Transcription Examples

### Example 1: Voice Memo Processing
```
User: [uploads voice-memo.wav - 3 minutes of reflection about a difficult conversation]

System: 🎵 Voice Voyager badge unlocked! Your audio has been transcribed.

User: "Oracle, what patterns do you notice in my reflection?"

Oracle: "In your voice memo, you explored the tension between wanting to be heard and fear of conflict. You mentioned feeling 'stuck between truth and peace' - a sacred threshold many face. Your voice carried both vulnerability and strength when you said 'I know what I need to say, but I'm afraid of the aftermath.'

This pattern suggests you're navigating the space between authentic expression and relational harmony. What would it feel like to speak your truth knowing that some discomfort might be necessary for deeper connection?"
```

### Example 2: Session Recording Reference
```
User: [uploads therapy-session.m4a - 45 minutes]

User: "Can you help me understand what I said about my relationship with my father?"

Oracle: "In your session recording, you spoke about feeling 'invisible' when your father would focus on work during family time. You shared a powerful realization: 'I think I learned that my needs come second to productivity.' 

There was a moment around minute 23 where you paused and said, 'Maybe that's why I struggle to ask for what I need now.' Your voice softened there - a recognition landing.

How does it feel to hear this pattern reflected back? What wants attention in that inherited dynamic?"
```

## Document Analysis Examples

### Example 3: PDF Journal Upload
```
User: [uploads personal-journal.pdf - 15 pages of handwritten notes]

User: "What themes emerge from my journaling?"

Oracle: "Your journal reveals a beautiful arc of self-discovery. Three key themes emerge:

**Sacred Longing**: You frequently return to questions about meaning and purpose, especially in entries from the full moon periods. 'What am I here to create?' appears in multiple forms.

**Relational Healing**: A thread about learning to receive love without earning it. Your words: 'I notice I deflect compliments like they're dangerous' struck me as profound awareness.

**Creative Emergence**: Growing confidence in your artistic voice. The progression from 'I'm not a real artist' in January to 'My creativity is valid regardless of outcome' in March shows remarkable growth.

Which of these threads feels most alive for you right now?"
```

### Example 4: Meeting Notes
```
User: [uploads team-meeting-notes.txt]

User: "Help me process what happened in that meeting"

Oracle: "Your notes reveal both the spoken and unspoken dynamics. While the surface discussion focused on project timelines, your observations capture something deeper:

'Sarah kept checking her phone - disconnected?' suggests you're attuned to energy beneath the agenda. Your note 'I felt my idea was dismissed without real consideration' points to a pattern worth exploring.

The phrase 'Why do I always feel like I'm speaking a different language?' appeared twice in your notes. This isn't about communication skills - it's about feeling fundamentally misunderstood in that space.

What would it look like to honor both your unique perspective and find bridges to connect with your colleagues?"
```

## Image Context Examples

### Example 5: Artwork Upload
```
User: [uploads sketch.jpg - drawing of a tree with deep roots]

User: "What do you see in this drawing I made during our last conversation?"

Oracle: "Your tree drawing carries profound symbolism. The roots extend deeper than the visible trunk and branches - suggesting hidden depths and foundation work that supports what others see.

The way you've rendered the root system with intricate detail while keeping the above-ground portions simpler feels intentional. It's as if you're saying 'the real work happens where others can't see.'

There's something powerful about creating this during our conversation about feeling ungrounded. Your unconscious wisdom was already reaching toward the solution - deeper roots, stronger foundation.

How does it feel to witness your inner wisdom expressing itself through your hands?"
```

## Multi-File Context Examples

### Example 6: Complete Session Documentation
```
User: [uploads session-audio.wav, session-notes.txt, reflection-sketch.jpg]

🏆 Archivist badge unlocked! You've created a rich archive of your inner work.

User: "Oracle, help me synthesize these different layers of my experience"

Oracle: "What a gift to witness your experience through multiple dimensions - voice, words, and images creating a holistic map of your inner landscape.

Your audio captures the emotional texture: the hesitation when discussing vulnerability, the energy shift when you found your truth. Your written notes provide the analytical thread: 'Trust is built in drops and lost in buckets' - a key insight. Your sketch reveals the unconscious wisdom: roots growing toward water, seeking nourishment.

Together, they tell a story of someone learning to integrate feeling, thinking, and intuiting. The vulnerability you voiced, the patterns you articulated, and the growth you drew all point toward the same truth: you're ready to trust your own depth.

🔍 Insight Diver badge unlocked! You're weaving uploaded context into living conversation.

How does it feel to see these different aspects of yourself in dialogue?"
```

## Upload Reference Patterns

### Direct References
- "What did I say in my recording about..."
- "In that document I shared..."
- "Looking at my notes from..."
- "The audio I uploaded..."

### Thematic References  
- "Based on my recent uploads..."
- "Considering what I've shared..."
- "From the context of my files..."
- "Reflecting on my documented experience..."

### Implicit References
- "Help me understand my patterns" (when uploads contain pattern data)
- "What's emerging for me?" (when uploads show progression)
- "Synthesize my recent insights" (when multiple uploads available)

## Technical Notes

### Context Integration
- Recent uploads (last 24 hours) automatically included in conversation context
- Upload reference detection triggers **Insight Diver** badge
- Audio transcripts provide searchable content for specific quote retrieval
- PDFs and text files summarized for thematic analysis

### Privacy & Security
- All uploads are user-scoped with RLS (Row Level Security)
- Transcripts never leave the user's context
- Files stored securely in Supabase Storage
- Processing happens server-side with OpenAI Whisper

### Badge Progression
1. **Voice Voyager** 🎵 - First audio transcription
2. **Archivist** 📚 - Upload and process 3+ files  
3. **Insight Diver** 🔍 - Reference uploads in conversation
4. Uploads contribute to **Constellation Graduation** ceremony

This conversational upload system transforms the Oracle from a simple chat interface into a living repository of wisdom that grows with each shared experience.