import type { NextConfig } from 'next'

// Type the webpack function using NextConfig's own definition (no 'webpack' import needed)
const webpackFn: NonNullable<NextConfig['webpack']> = (
  config,
  { isServer }
) => {
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
}

export default nextConfig
