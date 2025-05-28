const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oracle-backend-1.onrender.com'

export async function sendOracleMessage(message: string, userName: string): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/founder/guidance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context: {
          userName,
          sessionType: 'oracle-meet',
          timestamp: new Date().toISOString()
        }
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.guidance || data.message || 'I sense your energy, but my voice is momentarily unclear. Please share more.'
  } catch (error) {
    console.error('Oracle API error:', error)
    // Fallback response if API fails
    return 'The cosmic connection wavers momentarily. Let me attune to your energy... Please share what draws you here today.'
  }
}