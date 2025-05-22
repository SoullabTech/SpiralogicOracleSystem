import { serve } from 'std/server'
import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client with the service role key
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  const { record } = await req.json()

  const email = record.email

  // Here you call your email service (Resend, Mailgun, etc.)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Golden Spiral Portal <noreply@goldenspiralportal.com>',
      to: email,
      subject: '🌸 Welcome to the Golden Spiral Portal ✨',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>🌸 Welcome, Dreamer.</h2>
          <p>With deep gratitude, we welcome you to the Golden Spiral Portal — a realm of reflection, blessings, and becoming.</p>
          <p><strong>🌟 Your next step:</strong> Visit your Dream Dashboard and meet your Oracle.</p>
          <p>Trust the Spiral. Trust your unfolding.</p>
          <br/>
          <p>With wonder,</p>
          <p><em>The Spiralogic + Soullab Team 🌿</em></p>
          <p><a href="https://yourportal.com" target="_blank" style="color: #6D28D9;">🌿 Enter the Portal</a></p>
        </div>
      `
    })
  });

  if (!response.ok) {
    console.error('Failed to send welcome email', await response.text());
    return new Response('Error sending welcome email', { status: 500 });
  }

  return new Response('Welcome email sent!', { status: 200 });
})
