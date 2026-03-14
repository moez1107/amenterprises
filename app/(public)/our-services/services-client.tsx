"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Code2,
  Smartphone,
  Palette,
  Cloud,
  Brain,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ParticlesBackground } from "@/components/public/particles-background"

type Service = {
  id: string
  title: string
  category: string
  description: string
  features: string[]
  gradient: string
  icon_name: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Smartphone,
  Palette,
  Cloud,
  Brain,
  Shield,
}

export default function ServicesClient({ services }: { services: Service[] }) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = useMemo(() => {
    const unique = Array.from(new Set(services.map(s => s.category || "Uncategorized")))
    return ["All", ...unique]
  }, [services])

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesCategory = selectedCategory === "All" || s.category === selectedCategory
      const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [services, selectedCategory, search])

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950 transition-colors duration-500">
        <ParticlesBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />

      <div className="container relative z-10 mx-auto px-5 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            Our Professional IT Services
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Reliable, scalable digital solutions built for startups, enterprises, and growing businesses in Pakistan and beyond.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                className={cn(
                  "px-4 py-2 rounded-full font-medium text-sm transition-colors",
                  cat === selectedCategory
                    ? "bg-primary text-white"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white"
                )}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search services..."
            className="border rounded-full px-4 py-2 w-full sm:w-64 text-gray-700 dark:text-gray-300 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Services Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
          {filteredServices.map(service => {
            const Icon = iconMap[service.icon_name] || Code2
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="group"
              >
                <div
                  className={cn(
                    "h-full rounded-2xl border bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm",
                    "border-gray-200/70 dark:border-gray-800/60",
                    "shadow-sm hover:shadow-xl transition-all duration-300 ease-out",
                    "hover:-translate-y-2 hover:scale-[1.02]"
                  )}
                >
                  <div className="p-7 md:p-8 flex flex-col h-full">
                    <div
                      className={cn(
                        "mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-md",
                        "bg-gradient-to-br",
                        service.gradient
                      )}
                    >
                      <Icon className="h-7 w-7" />
                    </div>

                    <h3 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                      {service.title}
                    </h3>

                    <p className="mb-7 text-gray-600 dark:text-gray-300 leading-relaxed flex-grow">
                      {service.description}
                    </p>

                    {service.features?.length > 0 && (
                      <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300">
                        {service.features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-primary/80" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}