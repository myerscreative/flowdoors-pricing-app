import { genkit } from 'genkit'
import { googleAI } from '@genkit-ai/googleai'

// For local development, please replace YOUR_API_KEY_HERE with your actual Google AI API key.
const apiKey =
  process.env.GOOGLE_API_KEY || 'AIzaSyACfvA5TTzItpQ-2dbePTL9sfTSzCpXtKM'

if (apiKey === 'YOUR_API_KEY_HERE') {
  console.warn(
    'Google AI API key is not set. Please replace "AIzaSyACfvA5TTzItpQ-2dbePTL9sfTSzCpXtKM" in src/ai/genkit.ts with your actual key.'
  )
}

export const ai = genkit({
  plugins: [googleAI({ apiKey })],
  model: 'googleai/gemini-2.0-flash',
})
