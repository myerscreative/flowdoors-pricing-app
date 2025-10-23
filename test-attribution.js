// Test script to verify attribution flow
const testAttribution = async () => {
  const baseUrl = 'http://localhost:3000'

  console.log('🧪 Testing Attribution Flow...\n')

  // Test 1: Submit a lead with Google Ads attribution
  console.log('1. Testing Google Ads lead submission...')
  try {
    const leadResponse = await fetch(`${baseUrl}/api/quote/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Google',
        email: 'john.google@test.com',
        phone: '(555) 123-4567',
        zip: '90210',
        timeline: 'asap',
        role: 'homeowner',
        referral: 'google_ads',
        attribution: {
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'brand_test',
          gclid: 'TEST_GOOGLE_123',
          landing_page_url: 'http://localhost:3000/quote/start',
          referrer: 'https://google.com',
          first_touch_ts: new Date().toISOString(),
          last_touch_ts: new Date().toISOString(),
        },
      }),
    })

    const leadResult = await leadResponse.json()
    console.log('✅ Lead created:', leadResult)
  } catch (error) {
    console.log('❌ Lead creation failed:', error.message)
  }

  // Test 2: Submit a lead with Facebook attribution
  console.log('\n2. Testing Facebook Ads lead submission...')
  try {
    const facebookResponse = await fetch(`${baseUrl}/api/quote/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Facebook',
        email: 'jane.facebook@test.com',
        phone: '(555) 987-6543',
        zip: '10001',
        timeline: '30-60',
        role: 'contractor',
        referral: 'facebook_ads',
        attribution: {
          utm_source: 'facebook',
          utm_medium: 'social',
          utm_campaign: 'awareness_campaign',
          fbclid: 'TEST_FACEBOOK_456',
          fbc: 'fb.1.1234567890.AbCdEf',
          fbp: 'fb.1.1234567890.GhIjKl',
          landing_page_url: 'http://localhost:3000/quote/start',
          referrer: 'https://facebook.com',
          first_touch_ts: new Date().toISOString(),
          last_touch_ts: new Date().toISOString(),
        },
      }),
    })

    const facebookResult = await facebookResponse.json()
    console.log('✅ Facebook lead created:', facebookResult)
  } catch (error) {
    console.log('❌ Facebook lead creation failed:', error.message)
  }

  // Test 3: Submit a direct lead (no attribution)
  console.log('\n3. Testing direct lead submission...')
  try {
    const directResponse = await fetch(`${baseUrl}/api/quote/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob Direct',
        email: 'bob.direct@test.com',
        phone: '(555) 555-5555',
        zip: '60601',
        timeline: '90+',
        role: 'architect',
        referral: 'direct_visit',
        // No attribution object = direct traffic
      }),
    })

    const directResult = await directResponse.json()
    console.log('✅ Direct lead created:', directResult)
  } catch (error) {
    console.log('❌ Direct lead creation failed:', error.message)
  }

  // Test 4: Check marketing dashboard data
  console.log('\n4. Checking marketing dashboard data...')
  try {
    const dashboardResponse = await fetch(`${baseUrl}/api/marketing/summary`)
    const dashboardData = await dashboardResponse.json()

    console.log('📊 Marketing Dashboard Data:')
    console.log('Total Leads:', dashboardData.totals?.leads || 0)
    console.log('Total Quotes:', dashboardData.totals?.quotes || 0)
    console.log('\nBy Source:')
    Object.entries(dashboardData.bySource || {}).forEach(([source, data]) => {
      console.log(
        `  ${source}: ${data.leads} leads, ${data.quotes} quotes, $${data.amount || 0} revenue`
      )
    })
  } catch (error) {
    console.log('❌ Dashboard data fetch failed:', error.message)
  }

  console.log('\n🎉 Attribution test complete!')
}

// Run the test
testAttribution().catch(console.error)
