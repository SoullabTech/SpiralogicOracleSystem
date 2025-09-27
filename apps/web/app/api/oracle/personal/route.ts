import { NextRequest, NextResponse } from 'next/server'

/**
 * Legacy endpoint compatibility layer
 * Old production code uses 'input' field, new code uses 'message'
 * Transform and proxy to new /api/maya-chat endpoint
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('⚠️ Legacy /api/oracle/personal called')
    console.log('Body received:', JSON.stringify(body).substring(0, 100))

    // Extract and validate message
    const messageText = (body.input || body.message || body.content || '').trim()

    if (!messageText || messageText.length === 0) {
      console.error('❌ Empty message received')
      return NextResponse.json(
        {
          success: false,
          error: 'Message is required and cannot be empty',
          response: "I'm here to listen. What would you like to share?",
          message: "I'm here to listen. What would you like to share?"
        },
        { status: 400 }
      )
    }

    // Transform old field names to new ones
    const transformedBody = {
      message: messageText,
      userId: body.userId || 'legacy-user',
      enableVoice: body.enableVoice || false
    }

    console.log('Transformed to:', JSON.stringify(transformedBody).substring(0, 100))

    // Proxy to new endpoint
    const response = await fetch(`${req.nextUrl.origin}/api/maya-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedBody)
    })

    if (!response.ok) {
      console.error('Maya-chat returned error:', response.status)
      const errorText = await response.text()
      console.error('Error body:', errorText)

      return NextResponse.json(
        { error: 'Internal server error', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Transform response back to legacy format if needed
    const legacyResponse = {
      success: true,
      response: data.text || data.message,
      message: data.text || data.message,
      ...data
    }

    return NextResponse.json(legacyResponse)
  } catch (error: any) {
    console.error('Legacy endpoint error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
}