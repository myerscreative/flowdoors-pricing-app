import { Toaster } from '@/components/ui/toaster'
import type { Metadata } from 'next'
import { DM_Sans, Inter, Playfair_Display, Poppins } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Providers from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-playfair-display',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: 'FlowDoors - San Diego Custom Door Systems',
  description: 'Premium slide-and-stack door solutions in San Diego, CA',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      'http://localhost:3000'
  ),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-KNLPJSS8'

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `,
          }}
        />
        {/* Google Analytics 4 (GA4) - Direct Implementation */}
        {!!gaId && (
          <>
            <Script
              id="ga4-src"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga4-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', { 
                    send_page_view: false 
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${poppins.variable} ${playfairDisplay.variable} ${dmSans.variable} font-body bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef]`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
