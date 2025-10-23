import { NextResponse } from 'next/server'

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  // Test activation link generation
  const testToken = 'test-token-123'
  const testEmail = 'test@example.com'
  const activationLink = `${appUrl}/activate-account?token=${testToken}&email=${encodeURIComponent(testEmail)}`

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    appUrl,
    baseUrl,
    siteUrl,
    activationLink,
    allEnvVars: {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    },
  })
}
