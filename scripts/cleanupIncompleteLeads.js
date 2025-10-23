#!/usr/bin/env node

/**
 * Script to clean up incomplete leads from Firestore
 * Removes any leads that don't have name, email, and phone
 * Usage: node scripts/cleanupIncompleteLeads.js
 */

import admin from 'firebase-admin'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

function validateEnvVars() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.error('❌ Error: Missing required environment variable:')
    console.error('  - FIREBASE_SERVICE_ACCOUNT_KEY')
    console.log('\nPlease add this to your .env.local file.')
    console.log('See scripts/README.md for more information.')
    process.exit(1)
  }
}

async function initializeFirebaseAdmin() {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
    console.log('✅ Firebase Admin initialized successfully.')
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message)
    console.log(
      '\nMake sure FIREBASE_SERVICE_ACCOUNT_KEY in .env.local is valid JSON.'
    )
    process.exit(1)
  }
}

function looksLikeEmail(v) {
  if (!v) return false
  const s = v.trim()
  return s.length > 3 && s.includes('@') && s.includes('.')
}

function looksLikePhone(v) {
  if (!v) return false
  return v.replace(/\D/g, '').length >= 10
}

async function cleanupIncompleteLeads() {
  const db = admin.firestore()
  const leadsRef = db.collection('leads')

  try {
    console.log('🔍 Fetching all leads...')
    const snapshot = await leadsRef.get()
    console.log(`📊 Total leads found: ${snapshot.size}`)

    const incompleteLeads = []

    // Identify incomplete leads
    snapshot.forEach((doc) => {
      const data = doc.data()
      const name = data.name
      const email = data.email
      const phone = data.phone

      const hasName = name && name.length >= 2
      const hasEmail = looksLikeEmail(email)
      const hasPhone = looksLikePhone(phone)

      if (!hasName || !hasEmail || !hasPhone) {
        const missing = []
        if (!hasName) missing.push('name')
        if (!hasEmail) missing.push('email')
        if (!hasPhone) missing.push('phone')

        incompleteLeads.push({
          id: doc.id,
          data,
          reason: `Missing: ${missing.join(', ')}`,
        })
      }
    })

    console.log(
      `\n🗑️  Found ${incompleteLeads.length} incomplete leads to remove:\n`
    )

    if (incompleteLeads.length === 0) {
      console.log('✨ No incomplete leads found! Database is clean.')
      return
    }

    // Display incomplete leads
    incompleteLeads.forEach((lead, index) => {
      console.log(`${index + 1}. ID: ${lead.id}`)
      console.log(`   Name: ${lead.data.name || '(missing)'}`)
      console.log(`   Email: ${lead.data.email || '(missing)'}`)
      console.log(`   Phone: ${lead.data.phone || '(missing)'}`)
      console.log(`   Reason: ${lead.reason}`)
      console.log('')
    })

    // Prompt for confirmation
    console.log(
      `⚠️  About to delete ${incompleteLeads.length} incomplete lead(s).`
    )
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n')

    // Wait 5 seconds before proceeding
    await new Promise((resolve) => setTimeout(resolve, 5000))

    console.log('🚀 Starting deletion...\n')

    // Delete incomplete leads in batches
    let deletedCount = 0
    const batchSize = 500 // Firestore batch limit

    for (let i = 0; i < incompleteLeads.length; i += batchSize) {
      const batch = db.batch()
      const batchItems = incompleteLeads.slice(i, i + batchSize)

      batchItems.forEach((lead) => {
        const docRef = leadsRef.doc(lead.id)
        batch.delete(docRef)
      })

      await batch.commit()
      deletedCount += batchItems.length
      console.log(`✅ Deleted ${deletedCount} lead(s)...`)
    }

    console.log(`\n✨ Successfully deleted ${deletedCount} incomplete lead(s)!`)
    console.log(`📊 Remaining leads: ${snapshot.size - deletedCount}`)
  } catch (error) {
    console.error('❌ Error cleaning up leads:', error)
    throw error
  }
}

// Main execution
async function main() {
  validateEnvVars()
  await initializeFirebaseAdmin()
  await cleanupIncompleteLeads()
}

// Run the cleanup
main()
  .then(() => {
    console.log('\n✅ Cleanup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Cleanup failed:', error)
    process.exit(1)
  })
