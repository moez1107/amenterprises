import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

// Google Fonts Integration with CSS Variables
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

// Deep SEO & Metadata for 360 Digital Solutions
export const metadata: Metadata = {
  title: "AM Enterprises | 360 Digital Solutions Rawalpindi, Islamabad & International",
  description:
    "AM Enterprises provides top-notch 360 digital solutions in Rawalpindi, Islamabad & worldwide. Services include Web Design, SEO, Social Media Marketing, Branding, CRM, E-commerce Solutions, and Enterprise Software. Grow your business with expert digital solutions and achieve measurable results.",
  keywords: [
    "360 digital solutions Rawalpindi",
    "digital marketing agency Rawalpindi",
    "web design company Rawalpindi",
    "Rawalpindi SEO services",
    "Rawalpindi social media marketing",
    "Rawalpindi branding agency",
    "Rawalpindi ecommerce solutions",
    "Rawalpindi software development",
    "Rawalpindi graphic design services",
    "360 digital solutions Pakistan",
    "digital marketing agency Pakistan",
    "best SEO services Pakistan",
    "web design company Pakistan",
    "social media marketing Pakistan",
    "branding agency Pakistan",
    "ecommerce web development Pakistan",
    "360 digital marketing solutions",
    "international SEO services",
    "global web development company",
    "enterprise CRM solutions",
  ],
  generator: "AM Enterprises v0.1",
  icons: {
    icon: [
      { url: "/assets/logo.png", media: "(prefers-color-scheme: light)" },
      { url: "/assets/logo.png", media: "(prefers-color-scheme: dark)" },
      { url: "/assets/logo.png", type: "image/png" },
    ],
    apple: "/assets/logo.png",
  },
  openGraph: {
    title: "AM Enterprises | 360 Digital Solutions Rawalpindi & International",
    description:
      "Grow your business with AM Enterprises – top 360 digital solutions provider for web design, SEO, SMM, branding & enterprise software worldwide.",
    url: "https://amenterprises.tech",
    siteName: "AM Enterprises",
    images: [
      {
        url: "/assets/logo.png",
        width: 1200,
        height: 630,
        alt: "AM Enterprises Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AM Enterprises | 360 Digital Solutions",
    description:
      "Leading 360 digital solutions company in Rawalpindi, Islamabad & International. Web design, SEO, branding, social media, CRM & more.",
    images: ["/assets/logo.png"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html  className={`${inter.variable} ${geistMono.variable}`}>
      <head>
        {/* Preload fonts for better LCP */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&family=Geist+Mono&display=swap"
          rel="stylesheet"
        />

        {/* SEO Meta Tags */}
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords.join(", ")} />
        <meta name="generator" content={metadata.generator} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/logo.png" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={metadata.openGraph?.title} />
        <meta property="og:description" content={metadata.openGraph?.description} />
        <meta property="og:type" content={metadata.openGraph?.type} />
        <meta property="og:site_name" content={metadata.openGraph?.siteName} />
        <meta property="og:url" content={metadata.openGraph?.url} />
        <meta property="og:locale" content={metadata.openGraph?.locale} />
        {metadata.openGraph?.images?.map((img, idx) => (
          <meta key={idx} property="og:image" content={img.url} />
        ))}

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content={metadata.twitter?.card} />
        <meta name="twitter:title" content={metadata.twitter?.title} />
        <meta name="twitter:description" content={metadata.twitter?.description} />
        {metadata.twitter?.images?.map((img, idx) => (
          <meta key={idx} name="twitter:image" content={img} />
        ))}

        {/* Favicon & Theme icons */}
        <link
          rel="icon"
          href={metadata.icons?.icon?.[0]?.url || "/assets/logo.png"}
          type="image/png"
        />
      </head>

      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <AuthProvider>
          {/* Application Children */}
          {children}

          {/* Global Toaster for Notifications */}
          <Toaster position="top-right" />

          {/* Vercel Analytics */}
          <Analytics />
        </AuthProvider>

        {/* Footer Scripts for SEO & Performance */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "AM Enterprises",
              url: "https://amenterprises.tech",
              logo: "/assets/logo.png",
              sameAs: [
                "https://www.facebook.com/AMEnterprises",
                "https://www.twitter.com/AMEnterprises",
                "https://www.linkedin.com/company/amenterprises",
              ],
            }),
          }}
        />
      </body>
    </html>
  )
}