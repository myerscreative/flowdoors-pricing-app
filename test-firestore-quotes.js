const admin = require('firebase-admin')

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.GCLOUD_PROJECT ||
      process.env.GOOGLE_CLOUD_PROJECT

    let credential

    if (
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      projectId
    ) {
      const pk = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      credential = admin.credential.cert({
        projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: pk,
      })
      admin.initializeApp({ projectId, credential })
    } else {
      credential = admin.credential.applicationDefault()
      admin.initializeApp({ projectId, credential })
    }
    console.log('✓ Firebase Admin initialized successfully')
  } catch (e) {
    console.error('❌ Firebase Admin initialization failed:', e)
    process.exit(1)
  }
}

async function checkQuotes() {
  try {
    const db = admin.firestore()
    console.log('✓ Firestore instance obtained')

    // Get all quotes
    console.log('\n🔍 Fetching quotes from Firestore...')
    const quotesRef = db.collection('quotes')
    const snapshot = await quotesRef.limit(10).get()

    console.log(`\n📊 Found ${snapshot.size} quotes (showing first 10)`)

    if (snapshot.empty) {
      console.log('❌ No quotes found in the "quotes" collection!')
      console.log('\n💡 This is why the Marketing dashboard shows zero data.')
      console.log(
        '   Please add some quotes to the Firestore "quotes" collection.'
      )
    } else {
      console.log('\n✓ Quotes exist! Here are the first few:\n')

      snapshot.forEach((doc, index) => {
        const data = doc.data()
        console.log(`\nQuote ${index + 1}:`)
        console.log(`  - ID: ${doc.id}`)
        console.log(
          `  - Quote Number: ${data.quote_number || data.quoteId || 'N/A'}`
        )
        console.log(`  - Status: ${data.status || 'N/A'}`)
        console.log(
          `  - Customer: ${data.customer?.firstName || ''} ${data.customer?.lastName || ''}`
        )
        console.log(
          `  - Created: ${data.createdAt ? new Date(data.createdAt.toDate()).toISOString() : 'N/A'}`
        )
        console.log(
          `  - UTM Source: ${data.utmSource || data.utm_source || 'none'}`
        )
        console.log(`  - GCLID: ${data.gclid || 'none'}`)
        console.log(`  - FBCLID: ${data.fbclid || 'none'}`)
        console.log(`  - Referrer: ${data.referrer || data.referer || 'none'}`)
        console.log(
          `  - Total: $${data.totals?.grandTotal || data.totals?.subtotal || 0}`
        )
      })

      console.log('\n\n🎯 Marketing Attribution Summary:')
      let hasGoogle = 0
      let hasFacebook = 0
      let hasDirect = 0
      let hasOther = 0

      snapshot.forEach((doc) => {
        const data = doc.data()
        const utmSource = (
          data.utmSource ||
          data.utm_source ||
          ''
        ).toLowerCase()

        if (utmSource.includes('google') || data.gclid) {
          hasGoogle++
        } else if (utmSource.includes('facebook') || data.fbclid) {
          hasFacebook++
        } else if (
          utmSource ||
          data.utmMedium ||
          data.gclid ||
          data.fbclid ||
          data.referrer
        ) {
          hasOther++
        } else {
          hasDirect++
        }
      })

      console.log(`  - Google: ${hasGoogle}`)
      console.log(`  - Facebook: ${hasFacebook}`)
      console.log(`  - Direct: ${hasDirect}`)
      console.log(`  - Other: ${hasOther}`)
    }

    // Also check leads
    console.log('\n\n🔍 Checking leads collection...')
    const leadsRef = db.collection('leads')
    const leadsSnapshot = await leadsRef.limit(10).get()
    console.log(`📊 Found ${leadsSnapshot.size} leads (showing first 10)`)

    if (leadsSnapshot.empty) {
      console.log('ℹ️  No leads found in the "leads" collection')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkQuotes()
