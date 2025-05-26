/* eslint-disable @typescript-eslint/no-unused-vars */

interface OracleRequest {
  question: string
  personality: string
  conversationHistory?: Array<{ role: string, content: string }>
}

interface OracleResponse {
  response: string
  personality: string
  timestamp: string
}

export async function askOracle(request: OracleRequest): Promise<OracleResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/oracle/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Oracle API request failed: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Oracle API Error:', error)
    return {
      response: generateFallbackResponse(request.question),
      personality: request.personality,
      timestamp: new Date().toISOString(),
    }
  }
}

function generateFallbackResponse(question: string): string {
  const lowerQuestion = question.toLowerCase()

  if (lowerQuestion.includes('love') || lowerQuestion.includes('relationship')) {
    return "💖 The energies of love surround you. Trust in divine timing and open your heart to new possibilities."
  }

  if (lowerQuestion.includes('work') || lowerQuestion.includes('career')) {
    return "🌟 Your professional path is aligning with your higher purpose. Stay focused on your goals."
  }

  if (lowerQuestion.includes('future')) {
    return "🔮 The future is bright with infinite possibilities. Your choices today create tomorrow's reality."
  }

  const responses = [
    "🌟 The cosmic energies suggest patience and trust in your journey ahead.",
    "🔮 Ancient wisdom whispers that the answer lies within your heart.",
    "✨ The universe is aligning to bring clarity to your path.",
    "🌙 Trust your intuition - it holds the key to your question.",
    "🌸 Growth and transformation are approaching. Stay open to possibilities.",
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}
