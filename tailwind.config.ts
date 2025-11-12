import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        flowdoors: {
          // Primary Blue (#00aeef)
          blue: {
            DEFAULT: '#00aeef',
            50: '#e6f7fd',
            100: '#cceff9',
            200: '#99dff4',
            300: '#66cfee',
            400: '#33c0f3',
            500: '#00aeef',
            600: '#0097d1',
            700: '#0080b3',
            800: '#006a95',
            900: '#005377',
          },
          // Accent Green (#8dc63f)
          green: {
            DEFAULT: '#8dc63f',
            50: '#f3f9e9',
            100: '#e7f3d3',
            200: '#cfe7a7',
            300: '#b7db7b',
            400: '#9fd04f',
            500: '#8dc63f',
            600: '#7ab82f',
            700: '#68a125',
            800: '#558a1e',
            900: '#437317',
          },
          // Charcoal (#2e2e2e)
          charcoal: {
            DEFAULT: '#2e2e2e',
            50: '#f5f5f5',
            100: '#e0e0e0',
            200: '#c2c2c2',
            300: '#a3a3a3',
            400: '#858585',
            500: '#666666',
            600: '#4d4d4d',
            700: '#3d3d3d',
            800: '#2e2e2e',
            900: '#1a1a1a',
          },
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      backgroundClip: {
        text: 'text',
      },
      transitionDuration: {
        '400': '400ms',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [animate],
} satisfies Config

export default config
