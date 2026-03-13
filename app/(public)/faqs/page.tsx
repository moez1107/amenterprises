// app/faqs/page.tsx

import FAQClient from "./faq-client"
import type { Metadata } from "next"

// Dynamic SEO metadata (better ranking ke liye)
export const metadata: Metadata = {
  title: "FAQs | Digital Marketing, Web Development & SEO Services - Islamabad & Rawalpindi",
  description:
    "Common questions about web development, SEO, digital marketing, Shopify stores, WordPress, social media management & more in Islamabad, Rawalpindi & Pakistan. Get clear answers from AM Enterprises experts.",
  keywords: [
    "FAQs digital marketing Islamabad",
    "web development questions Rawalpindi",
    "SEO services Pakistan FAQ",
    "Shopify store setup cost",
    "WordPress maintenance services",
    "digital agency Islamabad FAQs",
    "social media marketing questions",
    "AM Enterprises FAQ",
  ].join(", "),
  openGraph: {
    title: "FAQs - Digital Services & Solutions | AM Enterprises",
    description:
      "Answers to frequently asked questions about our digital services including web development, SEO, digital marketing, branding & more in Islamabad & Rawalpindi.",
    url: "https://amenterprises.tech/faqs",
    siteName: "AM Enterprises",
    images: [
      {
        url: "/og-faqs.jpg", // apni OG image daal dena
        width: 1200,
        height: 630,
        alt: "FAQs - AM Enterprises Digital Services",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQs | Digital Marketing & Web Development - Islamabad",
    description:
      "Find answers to common questions about SEO, web development, digital marketing services in Pakistan.",
    images: ["/og-faqs.jpg"],
  },
  alternates: {
    canonical: "https://yourdomain.com/faqs",
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

export default function FAQsPage() {
  return <FAQClient />
}