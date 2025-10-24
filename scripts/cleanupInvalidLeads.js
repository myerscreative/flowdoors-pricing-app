#!/usr/bin/env node

/**
 * Cleanup script to remove leads that don't have contact information
 *
 * A valid lead must have at least one of:
 * - name (non-empty)
 * - email (non-empty)
 * - phone (non-empty)
 *
 * Everything else is just a page visit and should be deleted.
 */

const admin = require('firebase-admin')

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(serviceAccountKey)
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId:
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'flowdoors-pricing-app',
    })
    console.log('✅ Firebase Admin initialized with service account key')
  } else {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY not found in environment')
    process.exit(1)
  }
}

const db = admin.firestore()

async function cleanupInvalidLeads() {
  try {
    console.log('🔍 Fetching all leads...')

    // Get all leads
    const leadsSnapshot = await db.collection('leads').get()

    if (leadsSnapshot.empty) {
      console.log('📭 No leads found')
      return
    }

    console.log(`📊 Total leads found: ${leadsSnapshot.docs.length}`)

    const validLeads = []
    const invalidLeads = []
    const batch = db.batch()

    // Process each lead
    leadsSnapshot.docs.forEach((doc) => {
      const data = doc.data()

      // Check if lead has contact information
      const hasName = data.name && data.name.trim() !== ''
      const hasEmail = data.email && data.email.trim() !== ''
      const hasPhone = data.phone && data.phone.trim() !== ''

      const hasContactInfo = hasName || hasEmail || hasPhone

      if (hasContactInfo) {
        validLeads.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
        })
      } else {
        invalidLeads.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          createdAt: data.createdAt,
        })

        // Mark for deletion
        batch.delete(doc.ref)
      }
    })

    console.log(`✅ Valid leads (with contact info): ${validLeads.length}`)
    console.log(`❌ Invalid leads (no contact info): ${invalidLeads.length}`)

    if (invalidLeads.length > 0) {
      console.log('\n🗑️  Invalid leads to be deleted:')
      invalidLeads.slice(0, 5).forEach((lead, i) => {
        console.log(
          `   ${i + 1}. ID: ${lead.id}, Name: "${lead.name}", Email: "${lead.email}", Phone: "${lead.phone}"`
        )
      })

      if (invalidLeads.length > 5) {
        console.log(`   ... and ${invalidLeads.length - 5} more`)
      }

      console.log('\n🚀 Deleting invalid leads...')
      await batch.commit()

      console.log(
        `✅ Successfully deleted ${invalidLeads.length} invalid leads`
      )
    } else {
      console.log(
        '✨ No invalid leads found - all leads have contact information'
      )
    }

    console.log(`\n📈 Final count: ${validLeads.length} valid leads remaining`)
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
  }
}

// Run the cleanup
cleanupInvalidLeads()
  .then(() => {
    console.log('\n🎉 Cleanup completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  })

