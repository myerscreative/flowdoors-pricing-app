#!/usr/bin/env node

/**
 * Test script for password reset functionality
 * Usage: node test-password-reset.js <email>
 */

const email = process.argv[2]

if (!email) {
  console.error('Usage: node test-password-reset.js <email>')
  process.exit(1)
}

async function testPasswordReset() {
  try {
    console.log(`\n🔍 Testing password reset for: ${email}\n`)

    const response = await fetch(
      'http://localhost:3000/api/users/password-reset',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      }
    )

    const data = await response.json()

    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))

    if (response.ok) {
      console.log('\n✅ Password reset request successful!')
      console.log('Check the email inbox for the password reset link.')
    } else {
      console.log('\n❌ Password reset request failed.')
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('\nMake sure the dev server is running: pnpm dev')
  }
}

testPasswordReset()
