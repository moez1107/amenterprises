"use client"

import { motion } from "framer-motion"
import { 
  Code2, 
  Smartphone, 
  Palette, 
  Cloud, 
  Brain, 
  Shield, 
  Zap,
  Globe,
  Cog,
  Database,
  type LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useServices } from "@/hooks/use-data"

// Icon mapping for services
const iconMap: Record<string, LucideIcon> = {
  Globe: Globe,
  Code2: Code2,
  Smartphone: Smartphone,
  Palette: Palette,
  Cloud: Cloud,
  Brain: Brain,
  Shield: Shield,
  Zap: Zap,
  Cog: Cog,
  Database: Database,
}

const gradients = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-orange-500 to-red-500",
  "from-teal-500 to-green-500",
  "from-violet-500 to-purple-500",
  "from-red-500 to-orange-500",
  "from-yellow-500 to-amber-500",
  "from-emerald-500 to-teal-500",
]

// Fallback data for when database is empty
const fallbackServices = [
  { name: "Web Development", short_description: "Custom web applications built with modern technologies", icon: "Code2" },
  { name: "Mobile Apps", short_description: "Native and cross-platform mobile applications", icon: "Smartphone" },
  { name: "UI/UX Design", short_description: "User-centered design solutions", icon: "Palette" },
  { name: "Cloud Solutions", short_description: "Scalable cloud infrastructure", icon: "Cloud" },
  { name: "AI & ML", short_description: "Intelligent automation and analytics", icon: "Brain" },
  { name: "DevOps", short_description: "CI/CD pipelines and automation", icon: "Cog" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

type Service = {
  id: string
  title: string
  description: string
  icon?: string
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export function ServicesSection() {
  const { data: services, isLoading } = useServices() as { data: any[]; isLoading: boolean }
  
  const displayServices = services && services.length > 0 ? services : fallbackServices

  return (
    <section className="py-24 relative overflow-hidden" id="services">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Our Services</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6 text-balance">
            Everything You Need to{" "}
            <span className="gradient-text">Succeed Online</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            From concept to launch, we provide comprehensive digital solutions tailored to your business needs.
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : (
          /* Services Grid */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {displayServices.map((service: any, index: number) => {
              const Icon = iconMap[service.icon] || Code2
              const gradient = gradients[index % gradients.length]
              
              return (
                <motion.div
                  key={service.id || service.name}
                  variants={itemVariants}
                  className="group relative"
                >
                  <div className="h-full p-6 rounded-2xl glass-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    {/* Icon */}
                    <div className={cn(
                      "size-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300",
                      gradient
                    )}>
                      <Icon className="size-7 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.short_description || service.description}
                    </p>

                    {/* Hover Gradient Overlay */}
                    <div className={cn(
                      "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br pointer-events-none",
                      gradient
                    )} />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </section>
  )
}
