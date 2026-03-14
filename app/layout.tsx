import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

/* -----------------------------
   Google Fonts
----------------------------- */

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

/* -----------------------------
   SEO Keywords
----------------------------- */

const keywords = [
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
]

/* -----------------------------
   Metadata (SEO)
----------------------------- */

export const metadata: Metadata = {
  metadataBase: new URL("https://amenterprises.tech"),

  title: {
    default:
      "AM Enterprises | 360 Digital Solutions Rawalpindi, Islamabad & Worldwide",
    template: "%s | AM Enterprises",
  },

  description:
    "AM Enterprises provides top-notch 360 digital solutions in Rawalpindi, Islamabad and worldwide. Services include Web Design, SEO, Social Media Marketing, Branding, CRM, E-commerce Solutions and Enterprise Software.",

  keywords,

  authors: [
    {
      name: "AM Enterprises",
      url: "https://amenterprises.tech",
    },
  ],

  creator: "AM Enterprises",
  publisher: "AM Enterprises",

  icons: {
    icon: "/assets/logo.png",
    apple: "/assets/logo.png",
  },

  openGraph: {
    title:
      "AM Enterprises | 360 Digital Solutions Rawalpindi & International",

    description:
      "Grow your business with AM Enterprises – top digital solutions provider for Web Design, SEO, SMM, Branding and Enterprise Software worldwide.",

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
      "Leading digital solutions company providing Web Development, SEO, Branding and Social Media Marketing worldwide.",

    images: ["/assets/logo.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
}

/* -----------------------------
   Root Layout
----------------------------- */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">

        <AuthProvider>

          {children}

          <Toaster position="top-right" />

          <Analytics />

        </AuthProvider>

        {/* Structured Data for SEO */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "AM Enterprises",
              url: "https://amenterprises.tech",
              logo: "https://amenterprises.tech/assets/logo.png",

              sameAs: [
                "https://www.facebook.com/AMEnterprises",
                "https://www.linkedin.com/company/amenterprises",
                "https://twitter.com/AMEnterprises",
              ],

              contactPoint: [
                {
                  "@type": "ContactPoint",
                  telephone: "+92-317-3712950",
                  contactType: "customer service",
                  areaServed: "PK",
                  availableLanguage: ["English", "Urdu"],
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  )
}