#!/usr/bin/env node

/**
 * Script to create and activate test users for development
 * Usage: node scripts/create-test-user.js
 */

import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:3000'

async function createTestUser(userData) {
  try {
    console.log(`Creating user: ${userData.name} (${userData.email})`)

    const response = await fetch(`${BASE_URL}/api/users/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const result = await response.json()

    if (result.success) {
      console.log('✅ User created successfully!')
      console.log(`📧 Email: ${userData.email}`)
      console.log(`🆔 Salesperson ID: ${result.salesperson_id}`)
      console.log(`🔗 Activation Link: ${result.activation_link}`)
      console.log(`🔑 Activation Token: ${result.activation_token}`)
      console.log('---')
      return result
    } else {
      console.error('❌ Failed to create user:', result.error)
      return null
    }
  } catch (error) {
    console.error('❌ Error creating user:', error.message)
    return null
  }
}

async function activateUser(email, token, password) {
  try {
    console.log(`Activating user: ${email}`)

    const response = await fetch(`${BASE_URL}/api/users/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        email,
        password,
      }),
    })

    const result = await response.json()

    if (result.success) {
      console.log('✅ User activated successfully!')
      console.log(`📧 Email: ${email}`)
      console.log(`🔑 Password: ${password}`)
      console.log('---')
      return result
    } else {
      console.error('❌ Failed to activate user:', result.error)
      return null
    }
  } catch (error) {
    console.error('❌ Error activating user:', error.message)
    return null
  }
}

async function main() {
  console.log('🚀 Creating test users for Scenic Doors Pricing App\n')

  // Test users to create
  const testUsers = [
    {
      name: 'Test Salesperson',
      email: 'sales@scenicdoors.co',
      role: 'salesperson',
      phone: '555-123-4567',
      location_code: 'SD',
      prefix: 'TS',
      referralCodes: ['TEST001'],
      zipcodes: ['12345'],
      homeZip: '12345',
    },
    {
      name: 'Test Admin',
      email: 'admin@scenicdoors.co',
      role: 'admin',
      phone: '555-999-8888',
      location_code: 'SD',
      prefix: 'TA',
      referralCodes: ['ADMIN001'],
      zipcodes: ['12345'],
      homeZip: '12345',
    },
  ]

  const createdUsers = []

  // Create users
  for (const userData of testUsers) {
    const result = await createTestUser(userData)
    if (result) {
      createdUsers.push({
        ...userData,
        activation_token: result.activation_token,
        salesperson_id: result.salesperson_id,
      })
    }
  }

  console.log('\n🔐 Test User Credentials:')
  console.log('========================\n')

  for (const user of createdUsers) {
    const password = 'TestPass123!'

    console.log(`👤 ${user.name}`)
    console.log(`📧 Email: ${user.email}`)
    console.log(`🔑 Password: ${password}`)
    console.log(`🆔 Salesperson ID: ${user.salesperson_id}`)
    console.log(
      `🔗 Activation Link: ${BASE_URL}/activate-account?token=${user.activation_token}&email=${encodeURIComponent(user.email)}`
    )
    console.log('---\n')
  }

  console.log('📝 Next Steps:')
  console.log('1. Visit the activation links above to set passwords')
  console.log('2. Or use the credentials above to login directly')
  console.log('3. The app should be running at http://localhost:3000')
}

// Run the script if called directly
main().catch(console.error)

export { createTestUser, activateUser }
