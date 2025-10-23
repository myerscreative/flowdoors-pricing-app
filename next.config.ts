// next.config.ts
import type { NextConfig } from 'next'

// Define the webpack function with the exact type from NextConfig, without importing 'webpack'
const webpackFn: NonNullable<NextConfig['webpack']> = (
  config,
  { isServer }
) => {
  // Ensure arrays/objects exist per type guards
  config.ignoreWarnings = [
    /Module not found: Can't resolve '@opentelemetry\/winston-transport'/,
    /Module not found: Can't resolve '@opentelemetry\/exporter-jaeger'/,
    /require\.extensions is not supported by webpack/,
    /Critical dependency: the request of a dependency is an expression/,
    /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
  ]

  if (!isServer) {
    config.resolve = config.resolve ?? {}
    config.resolve.fallback = {
      ...(config.resolve.fallback ?? {}),
      '@opentelemetry/winston-transport': false,
      '@opentelemetry/exporter-jaeger': false,
      handlebars: false,
      fs: false,
      net: false,
      dns: false,
    }
  }

  return config
}

const nextConfig: NextConfig = {
  typescript: {
    // Skip type checking during build (for now)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build (for now)
    ignoreDuringBuilds: true,
  },
  webpack: webpackFn,
  experimental: {
    optimizePackageImports: ['@genkit-ai/core', '@genkit-ai/firebase'],
  },
  images: {
    // Allow FlowDoors assets from GCS and Webflow CDN
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/flowdoors_images/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/quote/start',
        permanent: true,
      },
      // Additional redirect patterns to ensure it works
      {
        source: '/home',
        destination: '/quote/start',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
