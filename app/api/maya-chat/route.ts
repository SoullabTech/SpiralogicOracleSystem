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
    const { content } = await req.json()
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      )
    }
    
    // Try the production Oracle service first
    try {
      const response = await fetch('http://localhost:3003/api/v1/converse/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'beta-user',
          userText: content,
          element: 'aether'
        })
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          response: data.response || data.message || "I hear you. Tell me more about what's on your mind.",
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
              content: content
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      })

      if (openaiResponse.ok) {
        const data = await openaiResponse.json()
        const response = data.choices[0].message.content
        
        return NextResponse.json({
          response,
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
    const hash = content.length % 5
    const deepFallbacks = [
      "I notice there's something important in what you're sharing. What would you like to explore about this?",
      "I'm curious about what's beneath this concern. What does your intuition tell you?",
      "What would it feel like if you knew the answer was already within you?",
      "There's wisdom in this question itself. What's drawing your attention right now?",
      "I'm here with you in this uncertainty. What feels most true for you in this moment?"
    ]
    
    return NextResponse.json({
      response: deepFallbacks[hash],
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