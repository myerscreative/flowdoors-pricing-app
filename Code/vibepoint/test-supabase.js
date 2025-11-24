const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mfofqbnimxcgkqalpoze.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mb2ZxYm5pbXhjZ2txYWxwb3plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MzA4MDksImV4cCI6MjA3OTEwNjgwOX0.UZCUq8xe5_ePik3XcTIc4gkviSrbGf8kXEhacVPRIgQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    const { data, error } = await supabase.from('mood_entries').select('count').limit(1)
    if (error) {
      console.error('Supabase connection failed:', error)
    } else {
      console.log('Supabase connection successful!')
    }
  } catch (err) {
    console.error('Connection test failed:', err)
  }
}

testConnection()


