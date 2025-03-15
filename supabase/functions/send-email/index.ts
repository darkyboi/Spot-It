
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND')

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('Missing Resend API key')
    }

    const { to, subject, html } = await req.json()

    if (!to || !subject || !html) {
      throw new Error('Missing required parameters: to, subject, or html')
    }

    console.log(`Attempting to send email to ${to} with subject: ${subject}`)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Spot It <notifications@spotit-app.com>',
        to: [to],
        subject,
        html,
      }),
    })

    const data = await res.json()
    
    if (!res.ok) {
      console.error('Error from Resend API:', data)
      throw new Error(`Resend API error: ${JSON.stringify(data)}`)
    }

    console.log('Email sent successfully:', data)
    
    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-email function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    )
  }
}

serve(handler)
