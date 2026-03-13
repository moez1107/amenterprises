"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, ChevronDown, HelpCircle, ArrowRight, Plus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { ParticlesBackground } from "@/components/public/particles-background"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type FAQ = {
  id: string
  question: string
  answer: string
  category: string | null
  order_index: number
  active: boolean
  videoUrl?: string // optional video link
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export default function FAQClient() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [askForm, setAskForm] = useState({ name: "", email: "", question: "" })
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const loadFAQs = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from("faqs")
          .select("*")
          .eq("active", true)
          .order("order_index", { ascending: true })

        if (category !== "All") {
          query = query.eq("category", category)
        }

        const { data, error } = await query

        if (error) throw error

        setFaqs(data || [])
      } catch (err) {
        console.error("FAQs error:", err)
        toast.error("Failed to load FAQs")
      } finally {
        setLoading(false)
      }
    }

    loadFAQs()
  }, [category])

  const categories = ["All", ...new Set(faqs.map(f => f.category).filter(Boolean))]

  const filteredFAQs = faqs.filter(f =>
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.answer.toLowerCase().includes(search.toLowerCase())
  )

  // FAQ Schema for Google rich results
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  // Ask Question Form Submit
  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!askForm.name || !askForm.email || !askForm.question) {
      toast.error("Please fill all fields")
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from("faq_submissions") // assume table bana lo
        .insert({
          name: askForm.name,
          email: askForm.email,
          question: askForm.question,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success("Question submitted! We'll get back to you soon.")
      setAskForm({ name: "", email: "", question: "" })
    } catch (err) {
      toast.error("Failed to submit question")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-gray-950 dark:via-indigo-950/30 dark:to-gray-950">
        <ParticlesBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-transparent to-white/90 dark:from-gray-950/90 dark:to-gray-950/90 pointer-events-none" />
        
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
              Frequently Asked Questions
            </span>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-900 dark:from-white dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent leading-tight">
              Got Questions? We've Got Answers
            </h1>

            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Quick answers to common questions about our professional digital services, web development, SEO, digital marketing, Shopify stores, WordPress, branding and software solutions in Islamabad, Rawalpindi & Pakistan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <section className="sticky top-0 z-30 bg-white/95 dark:bg-gray-950/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-6 lg:px-8 py-4 md:py-5">
          <div className="max-w-5xl mx-auto space-y-5 md:space-y-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <Input
                placeholder="Search questions... (e.g. SEO pricing, Shopify timeline)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-11 md:h-12 rounded-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-sm"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Tabs for Desktop, Scrollable Pills for Mobile */}
            <Tabs value={category} onValueChange={setCategory} className="w-full">
              <TabsList className="hidden md:flex justify-center bg-transparent border-b border-gray-200 dark:border-gray-800">
                {categories.map((cat) => (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className="px-6 py-3 text-sm md:text-base data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:border-indigo-400 dark:data-[state=active]:text-indigo-400"
                  >
                    {cat === "All" ? "All Topics" : cat}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Mobile: Scrollable Pills */}
              <div className="md:hidden overflow-x-auto scrollbar-hide pb-2">
                <div className="flex gap-2.5 min-w-max">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-1.5 text-xs md:text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap ${
                        category === cat
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {cat === "All" ? "All Topics" : cat}
                    </button>
                  ))}
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50">
        <div className="container mx-auto px-6 lg:px-8">
          {loading ? (
            <div className="space-y-6 max-w-4xl mx-auto">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : filteredFAQs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 max-w-2xl mx-auto"
            >
              <HelpCircle className="h-20 w-20 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                No matching questions found
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Try different keywords or select another category.
              </p>
              <Button
                onClick={() => {
                  setSearch("")
                  setCategory("All")
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg"
              >
                Clear Filters & Show All
              </Button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl mx-auto space-y-5"
            >
              <Accordion type="multiple" className="space-y-5">
                {filteredFAQs.map((faq) => (
                  <motion.div key={faq.id} variants={itemVariants}>
                    <AccordionItem
                      value={faq.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <AccordionTrigger className="px-6 py-5 text-left hover:no-underline">
                        <div className="flex items-start gap-4 w-full">
                          <div className="size-10 md:size-12 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center shrink-0 mt-1 border border-indigo-100 dark:border-indigo-800">
                            <span className="text-indigo-600 dark:text-indigo-300 font-semibold text-lg">Q</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg md:text-xl font-medium text-gray-900 dark:text-white pr-8 leading-tight">
                              {faq.question}
                            </h3>
                            {faq.category && (
                              <Badge 
                                variant="secondary" 
                                className="mt-2 text-xs md:text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
                              >
                                {faq.category}
                              </Badge>
                            )}
                            {faq.videoUrl && (
                              <div className="mt-3">
                                <a
                                  href={faq.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm inline-flex items-center"
                                >
                                  Watch Video Explanation <ArrowRight className="ml-1 h-3 w-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-8 pt-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                        <div className="pl-14 md:pl-16">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>
          )}
        </div>
      </section>

      {/* Related Questions / People Also Ask */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              People Also Ask
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Common questions our visitors search for
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              { q: "How much does SEO cost in Pakistan?", link: "#" },
              { q: "How long does it take to build a Shopify store?", link: "#" },
              { q: "What is included in your digital marketing package?", link: "#" },
              { q: "Do you provide WordPress maintenance services?", link: "#" },
              { q: "How can I rank my website on Google in Islamabad?", link: "#" },
              { q: "What is the cost of logo design in Rawalpindi?", link: "#" },
              { q: "Do you offer website redesign services?", link: "#" },
              { q: "How effective is social media marketing in 2025?", link: "#" },
            ].map((item, i) => (
              <Link key={i} href={item.link}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.q}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-300">
                        Read answer →
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Ask a Question Form */}
      <section className="py-20 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/50 dark:via-purple-950/50 dark:to-pink-950/50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Still Have a Question?
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-10">
                Couldn't find what you're looking for? Ask us directly – we usually reply within 24 hours.
              </p>

              <form onSubmit={handleAskSubmit} className="space-y-5 text-left">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Name
                    </label>
                    <Input
                      value={askForm.name}
                      onChange={(e) => setAskForm({ ...askForm, name: e.target.value })}
                      placeholder="John Doe"
                      required
                      className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={askForm.email}
                      onChange={(e) => setAskForm({ ...askForm, email: e.target.value })}
                      placeholder="example@email.com"
                      required
                      className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Question
                  </label>
                  <Textarea
                    value={askForm.question}
                    onChange={(e) => setAskForm({ ...askForm, question: e.target.value })}
                    placeholder="Type your question here..."
                    rows={5}
                    required
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 w-full md:w-auto"
                >
                  {submitting ? "Submitting..." : "Submit Question"}
                  {!submitting && <Send className="ml-2 h-5 w-5" />}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              Whether it's a new website, SEO boost, or full digital marketing strategy – we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg px-10 py-7 text-lg">
                  Contact Us Now
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-900/80 backdrop-blur-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/50 px-10 py-7 text-lg">
                Book Free Consultation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}