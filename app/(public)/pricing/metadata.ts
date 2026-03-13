import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing & Packages | AM Enterprises",
  description:
    "Transparent pricing for web development, mobile apps, UI/UX and custom software solutions. Choose from Starter, Professional or Enterprise plans.",
  keywords:
    "web development pricing Pakistan, app development cost, custom software packages, IT services pricing, website development rates",
  openGraph: {
    title: "Affordable & Transparent Pricing | AM Enterprises",
    description: "Scalable web & app solutions with clear pricing – no hidden fees.",
    url: "https://amenterprises.tech/pricing",
    siteName: "AM Enterprises",
    images: [
      {
        url: "/og-pricing.jpg", // add a real OG image later
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing & Packages | AM Enterprises",
    description: "Choose the right plan for your project – transparent & professional.",
  },
}