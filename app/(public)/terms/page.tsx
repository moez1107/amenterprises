// app/terms-and-conditions/page.tsx

import { createClient } from "@/lib/supabase/client"
import { Metadata } from "next"
import { format } from "date-fns"
import { Shield, Calendar, FileText, ArrowRight, Home, ChevronRight, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ParticlesBackground } from "@/components/public/particles-background"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms & Conditions | AM Enterprises - Digital Agency Pakistan",
  description:
    "Read the official Terms and Conditions of AM Enterprises for professional digital services including web development, SEO, digital marketing, Shopify stores, WordPress, branding, and custom software solutions in Islamabad, Rawalpindi, and across Pakistan.",
  keywords: [
    "terms and conditions AM Enterprises",
    "digital agency terms Pakistan",
    "web development agreement Islamabad",
    "SEO services terms Rawalpindi",
    "Shopify store terms Pakistan",
    "digital marketing terms and conditions",
    "website development contract Pakistan",
    "AM Enterprises terms of service 2025",
    "legal terms digital agency Islamabad"
  ].join(", "),
  openGraph: {
    title: "Terms & Conditions - AM Enterprises Pakistan",
    description: "Understand our terms of service for professional digital solutions in Pakistan.",
    url: "https://amenterprises.tech/terms-and-conditions",
    siteName: "AM Enterprises",
    images: [
      {
        url: "/og-terms.jpg", // replace with your actual OG image
        width: 1200,
        height: 630,
        alt: "Terms & Conditions - AM Enterprises Digital Services",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions | AM Enterprises Pakistan",
    description: "Latest terms and conditions for our digital services in Islamabad & Rawalpindi.",
    images: ["/og-terms.jpg"],
  },
  alternates: {
    canonical: "https://amenterprises.tech/terms-and-conditions",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function TermsAndConditionsPage() {
  const supabase = createClient()

  const { data: terms } = await supabase
    .from("terms_conditions")
    .select("*")
    .order("effective_date", { ascending: false })
    .limit(1)
    .single()

  if (!terms) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-8 text-center">
        <div>
          <Shield className="h-16 w-16 mx-auto text-gray-400 mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Terms & Conditions Not Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
            We're currently updating our legal documents. Please check back soon or contact us for details.
          </p>
          <Link href="/contact">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-28 md:pt-32 pb-16 md:pb-24 overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-gray-950 dark:via-blue-950/30 dark:to-gray-950">
        <ParticlesBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-transparent to-white/90 dark:from-gray-950/90 dark:to-gray-950/90 pointer-events-none" />

        <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Shield className="h-4 w-4" /> Legal Agreement
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent leading-tight">
              Terms & Conditions
            </h1>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 text-gray-600 dark:text-gray-400 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Effective: {format(new Date(terms.effective_date), "MMMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>Version {terms.version}</span>
              </div>
            </div>

            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              These Terms and Conditions govern your use of AM Enterprises' digital services, including web development, SEO, digital marketing, branding, Shopify stores, WordPress solutions, and custom software in Pakistan.
            </p>
          </div>
        </div>
      </section>

      {/* Summary / Key Highlights */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-12 text-gray-900 dark:text-white">
            Key Points of Our Terms
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Services & Scope</h3>
              <p className="text-gray-700 dark:text-gray-300">
                All services are provided as described in project proposals. Changes require written approval.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-100 dark:border-purple-900/50 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Payments</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Fees are non-refundable. Milestones and timelines are mutually agreed upon.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Liability</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We are not liable for indirect damages. Services provided "as-is" unless otherwise agreed.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/terms/full">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-7 text-lg shadow-lg">
                Read Full Terms & Conditions
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/50 dark:via-purple-950/50 dark:to-pink-950/50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Need Clarification on Our Terms?
          </h2>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            Our team is available to explain any clause in detail. Contact us today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg px-10 py-6">
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" className="border-indigo-200 dark:border-indigo-700 px-10 py-6 text-lg">
              View Privacy Policy
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}