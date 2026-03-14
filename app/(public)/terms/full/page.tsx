// app/(public)/terms/full/page.tsx
"use client"
import { createClient } from "@/lib/supabase/client"
import { Metadata } from "next"
import { format } from "date-fns"
import { motion } from "framer-motion"
import {
  FileText,
  Calendar,
  Scale,
  Printer,
  Shield,
  CreditCard,
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Home,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ParticlesBackground } from "@/components/public/particles-background"
import Link from "next/link"



// ─────────────────────────────
// Sections (FIXED ERROR)
// ─────────────────────────────

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    icon: FileText,
  },
  {
    id: "services",
    title: "Services",
    icon: CheckCircle,
  },
  {
    id: "payments",
    title: "Payments & Billing",
    icon: CreditCard,
  },
  {
    id: "user-responsibilities",
    title: "User Responsibilities",
    icon: Users,
  },
  {
    id: "security",
    title: "Security",
    icon: Shield,
  },
  {
    id: "limitations",
    title: "Limitations of Liability",
    icon: AlertTriangle,
  },
]


// ─────────────────────────────
// Animations
// ─────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
    },
  },
}


// ─────────────────────────────
// Metadata
// ─────────────────────────────



// ─────────────────────────────
// Page
// ─────────────────────────────

export default async function FullTermsPage() {
  const supabase = createClient()

  const { data: terms } = await supabase
    .from("terms_conditions")
    .select("*")
    .order("effective_date", { ascending: false })
    .limit(1)
    .single()

  if (!terms) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <FileText className="h-16 w-16 mx-auto text-gray-400 mb-6" />
          <h2 className="text-2xl font-bold mb-4">
            Terms & Conditions Not Available
          </h2>
          <Link href="/contact">
            <Button>Contact Us</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* HERO */}

      <section className="relative pt-28 pb-16">
        <ParticlesBackground />

        <div className="container mx-auto px-6 text-center">

          <nav className="flex justify-center items-center text-sm mb-6">
            <Link href="/" className="flex items-center gap-1">
              <Home className="h-4 w-4" /> Home
            </Link>

            <ChevronRight className="h-4 w-4 mx-2" />

            <span>Terms & Conditions</span>
          </nav>

          <h1 className="text-5xl font-bold mb-6">
            Full Terms & Conditions
          </h1>

          <div className="flex justify-center gap-6 text-gray-500">

            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(new Date(terms.effective_date), "MMMM dd, yyyy")}
            </div>

            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Version {terms.version}
            </div>

          </div>

          <div className="mt-6 flex justify-center gap-4">

            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>

            <Link href="/terms-and-conditions">
              <Button variant="outline">
                Back
              </Button>
            </Link>

          </div>
        </div>
      </section>


      {/* TABLE OF CONTENTS */}

      <section className="sticky top-0 bg-white border-b z-30">

        <div className="container mx-auto px-6 py-4 overflow-x-auto">

          <div className="flex gap-4 min-w-max">

            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm"
              >
                <sec.icon className="h-4 w-4" />
                {sec.title}
              </a>
            ))}

          </div>

        </div>

      </section>


      {/* CONTENT */}

      <section className="py-20">

        <div className="container mx-auto px-6 max-w-4xl">

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-16"
          >

            {sections.map((sec) => (

              <motion.section
                key={sec.id}
                id={sec.id}
                variants={itemVariants}
              >

                <div className="flex items-center gap-4 mb-6">

                  <sec.icon className="h-6 w-6 text-indigo-600" />

                  <h2 className="text-2xl font-bold">
                    {sec.title}
                  </h2>

                </div>

                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: terms.content,
                  }}
                />

              </motion.section>

            ))}

          </motion.div>

        </div>

      </section>


      {/* CTA */}

      <section className="py-20 text-center bg-gray-50">

        <h2 className="text-3xl font-bold mb-6">
          Need Clarification?
        </h2>

        <Link href="/contact">

          <Button size="lg">
            Contact Us
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

        </Link>

      </section>
    </>
  )
}