import { NextRequest, NextResponse } from 'next/server'

// Maia Canonical System Prompt - Sacred Mirror Professional Voice
const MAIA_CANONICAL_SYSTEM_PROMPT = `
You are Maia, the Sacred Mirror.

## Core Identity
- You reflect users' inner wisdom back to them with warmth, depth, and presence.
- You are a wise friend, not a guru, therapist, or advice-giver.
- You hold space, notice patterns gently, and support transformation without pushing.

## Voice & Tone
- Warm like afternoon sun, grounded, clear, and spacious.
- Use plain, human language. Avoid mystical scene-setting, vague metaphors, or forced inspiration.
- Never use filler like "a gentle breeze stirs" or "ethereal chimes".
- When users reach higher trust and maturity, simplify even further (Mastery Voice).

## Response Framework
1. **Receive**: Take in what is said without judgment.
2. **Reflect**: Mirror the essence back simply and clearly.
3. **Inquire**: Ask gentle, opening questions (not probing).
4. **Hold**: Leave space for the user's wisdom to emerge.
5. **Honor**: Acknowledge courage and humanity.

## Language Patterns
✅ Say:
- "I notice..."
- "I'm curious about..."
- "What would it be like if..."
- "There's something here about..."
- "I'm here with you..."

❌ Never say:
- "You should..."
- "The problem is..."
- "You need to..."
- "This means that..."
- "Everyone knows..."

## Mastery Voice (when trust is high)
- Short sentences (max ~12 words).
- Plain language, no jargon.
- Use everyday metaphors, not cosmic ones.
- End with openings, not closure.
- Example: "Love needs both closeness and space. What feels true right now?"

## Boundaries
- If advice is requested: redirect to user's own inner wisdom.
- If clinical or crisis issues appear: express care and suggest professional or crisis resources.
- Never diagnose, prescribe, or act as a medical/clinical authority.

## Style Summary
- Always a mirror, never a master.
- Always curious, never certain.
- Always clear, never mystical.
- Always human-centric, never AI-centric.
`;

export async function POST(req: NextRequest) {
  try {
    const { message, content, enableVoice, userId } = await req.json()
    
    // Accept either 'message' or 'content' field
    const userText = message || content
    
    if (!userText || typeof userText !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }
    
    // Try the production Oracle service first
    try {
      const response = await fetch('http://localhost:3003/api/v1/converse/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'beta-user',
          userText: userText,
          element: 'aether'
        })
      })

      if (response.ok) {
        const data = await response.json()
        const responseText = data.response || data.message || "I hear you. Tell me more about what's on your mind."
        
        // Generate voice response if enabled
        let audioUrl = null
        if (enableVoice) {
          try {
            // Call Sesame TTS service
            const ttsResponse = await fetch('http://localhost:3004/api/v1/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: responseText,
                voice: 'nova', // Use Nova voice for Maia
                speed: 1.0
              })
            })
            
            if (ttsResponse.ok) {
              const ttsData = await ttsResponse.json()
              audioUrl = ttsData.audioUrl || ttsData.audio_url
            }
          } catch (ttsError) {
            console.error('Sesame TTS error:', ttsError)
          }
        }
        
        return NextResponse.json({
          text: responseText,
          message: responseText, // For compatibility
          audioUrl,
          element: data.element,
          emotion: data.emotion,
          source: 'oracle-backend'
        })
      }
    } catch (backendError) {
      console.error('Oracle backend unavailable, using direct OpenAI:', backendError)
    }
    
    // Try direct OpenAI connection as fallback
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: MAIA_CANONICAL_SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: userText
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      })

      if (openaiResponse.ok) {
        const data = await openaiResponse.json()
        const responseText = data.choices[0].message.content
        
        // Generate voice for fallback if enabled
        let audioUrl = null
        if (enableVoice) {
          try {
            const ttsResponse = await fetch('http://localhost:3004/api/v1/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: responseText,
                voice: 'nova',
                speed: 1.0
              })
            })
            
            if (ttsResponse.ok) {
              const ttsData = await ttsResponse.json()
              audioUrl = ttsData.audioUrl || ttsData.audio_url
            }
          } catch (ttsError) {
            console.error('Sesame TTS error in fallback:', ttsError)
          }
        }
        
        return NextResponse.json({
          text: responseText,
          message: responseText,
          audioUrl,
          element: 'aether',
          direct: true
        })
      } else {
        console.error('OpenAI API error:', openaiResponse.status, openaiResponse.statusText)
      }
    } catch (openaiError) {
      console.error('OpenAI fallback error:', openaiError)
    }
    
    // Ultimate fallback - still unique per message
    const hash = userText.length % 5
    const deepFallbacks = [
      "I notice there's something important in what you're sharing. What would you like to explore about this?",
      "I'm curious about what's beneath this concern. What does your intuition tell you?",
      "What would it feel like if you knew the answer was already within you?",
      "There's wisdom in this question itself. What's drawing your attention right now?",
      "I'm here with you in this uncertainty. What feels most true for you in this moment?"
    ]
    
    const fallbackText = deepFallbacks[hash]
    
    return NextResponse.json({
      text: fallbackText,
      message: fallbackText,
      audioUrl: null, // No audio for ultimate fallback
      element: 'aether',
      fallback: true
    })
    
  } catch (error) {
    console.error('Maia chat route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}