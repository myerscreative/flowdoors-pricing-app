/** @type {import('next').NextConfig} */

/** Allow Next/Image to optimize assets from Google Cloud Storage */
const images = {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'storage.googleapis.com',
      port: '',
      pathname: '/scenic_images/**', // narrow to your bucket folder
    },
  ],
}

const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@opentelemetry/winston-transport': false,
      '@opentelemetry/exporter-jaeger': false,
    }
    return config
  },
  images: {
    ...(typeof images === 'object' ? images : {}),
  },
}

export default nextConfig
