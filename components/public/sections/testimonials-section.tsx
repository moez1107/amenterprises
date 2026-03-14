"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTestimonials } from "@/hooks/use-data"

// Fallback testimonials
const fallbackTestimonials = [
  {
    id: "1",
    author_name: "Sarah Johnson",
    author_title: "CEO",
    author_company: "TechStart Inc.",
    rating: 5,
    content: "AM Enterprises transformed our vision into a stunning web application. Their team's expertise and dedication exceeded our expectations.",
  },
  {
    id: "2",
    author_name: "Michael Chen",
    author_title: "CTO",
    author_company: "DataFlow Systems",
    rating: 5,
    content: "Working with AM Enterprises was a game-changer for our business. Their cloud solutions helped us scale efficiently.",
  },
  {
    id: "3",
    author_name: "Emily Rodriguez",
    author_title: "Founder",
    author_company: "CreativeHub",
    rating: 5,
    content: "The mobile app they built for us has received outstanding feedback from our users. Highly recommended!",
  },
]

type Testimonial = {
  id: string
  author_name: string
  author_title: string
  author_company: string
  rating: number
  content: string
}

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { data: testimonials, isLoading } = useTestimonials(true) as {
    data: Testimonial[]
    isLoading: boolean
  }

  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : fallbackTestimonials

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length)
  }

  const currentTestimonial = displayTestimonials[currentIndex]

  return (
    <section className="py-24 relative overflow-hidden" id="testimonials">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6 text-balance">
            What Our{" "}
            <span className="gradient-text">Clients Say</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Don't just take our word for it. Here's what our clients have to say about working with us.
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="max-w-4xl mx-auto">
            <div className="h-64 rounded-2xl bg-muted/50 animate-pulse" />
          </div>
        ) : (
          /* Testimonial Carousel */
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card rounded-2xl p-8 md:p-12"
                >
                  {/* Quote Icon */}
                  <Quote className="size-12 text-primary/20 mb-6" />

                  {/* Content */}
                  <p className="text-lg md:text-xl text-foreground mb-8 leading-relaxed">
                    "{currentTestimonial?.content}"
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: currentTestimonial?.rating || 5 }).map((_, i) => (
                      <Star key={i} className="size-5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                      {currentTestimonial?.author_name?.charAt(0) || "A"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{currentTestimonial?.author_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {currentTestimonial?.author_title}, {currentTestimonial?.author_company}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevTestimonial}
                  className="rounded-full"
                >
                  <ChevronLeft className="size-5" />
                </Button>

                {/* Dots */}
                <div className="flex items-center gap-2">
                  {displayTestimonials.map((testimonial: Testimonial, index: number) => (
                    <button
                      aria-label={`Go to testimonial ${index + 1}`}
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        "size-2 rounded-full transition-all",
                        currentIndex === index
                          ? "bg-primary w-8"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextTestimonial}
                  className="rounded-full"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
