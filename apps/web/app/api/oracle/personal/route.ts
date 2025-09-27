import { NextRequest, NextResponse } from 'next/server'

/**
 * Legacy endpoint redirect
 * Old production code called /api/oracle/personal
 * This redirects to the new /api/maya-chat endpoint
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('⚠️ Legacy /api/oracle/personal called, proxying to /api/maya-chat')

    // Proxy to new endpoint
    const response = await fetch(`${req.nextUrl.origin}/api/maya-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Legacy endpoint proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}