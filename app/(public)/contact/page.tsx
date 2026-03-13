"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ParticlesBackground } from "@/components/public/particles-background"
import { toast } from "sonner"
import { submitContactForm } from "@/lib/supabase/data"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

// ────────────────────────────────────────────────
// Zod Schema (Validation)
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
  // Honeypot field (spam protection) – bots isse bhar dete hain
  website: z.string().max(0, { message: "Leave this field empty" }).optional(),
})

type FormValues = z.infer<typeof formSchema>

const contactInfo = [
  { icon: Mail, title: "Email Us", value: "contact@amenterprises.tech", href: "mailto:contact@amenterprises.tech" },
  { icon: Phone, title: "Call Us", value: "+92 317 371 2950", href: "tel:+923173712950" },
  { icon: MapPin, title: "Visit Us", value: "Islamabad, Pakistan & London, UK", href: "#" },
  { icon: Clock, title: "Working Hours", value: "Mon - Fri: 9AM - 6PM", href: "#" },
]

const services = [
  "Web Development",
  "Mobile App Development",
  "UI/UX Design",
  "Cloud Solutions",
  "AI & Machine Learning",
  "E-Commerce",
  "Other",
]

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      service: "",
      budget: "",
      message: "",
      website: "",
    },
  })

  async function onSubmit(values: FormValues) {
    // Agar honeypot bhara hua hai → spam samjho
    if (values.website) {
      toast.error("Something went wrong. Please try again.")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitContactForm({
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        company_name: values.company || undefined,
        service: values.service || undefined,
        budget: values.budget || undefined,
        message: values.message,
        source: "contact_page",
      })

      if (result.success) {
        toast.success("Message sent successfully! We'll get back to you soon.")
        form.reset()
      } else {
        toast.error(result.error?.message || "Failed to send message. Please try again.")
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <ParticlesBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Contact Us</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mt-4 mb-6 text-balance">
              Let's Start a <span className="gradient-text">Conversation</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have a project in mind? We'd love to hear about it. Get in touch and let's create something amazing together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold mb-4">Get In Touch</h2>
                <p className="text-muted-foreground">
                  Reach out through any channel below. We usually respond within 24 hours.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((info) => (
                  <a
                    key={info.title}
                    href={info.href}
                    className="flex items-start gap-4 p-4 rounded-xl glass-card hover:border-primary/30 transition-all group"
                  >
                    <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <info.icon className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{info.title}</h3>
                      <p className="text-sm text-muted-foreground">{info.value}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Social Links */}
              <div className="pt-8 border-t border-border">
                <h3 className="font-semibold mb-4">Follow Us</h3>
                <div className="flex items-center gap-3">
                  {["GitHub", "LinkedIn", "Twitter"].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                      aria-label={social}
                    >
                      {social.charAt(0)}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact Form – Modern with React Hook Form + Zod */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="glass-card rounded-2xl p-8 space-y-6">
                  <h2 className="text-2xl font-bold mb-2">Send Us a Message</h2>

                  {/* Honeypot – hidden field */}
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <input type="text" className="hidden" {...field} tabIndex={-1} autoComplete="off" />
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+92 300 1234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Company" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Interested In</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {services.map((service) => (
                                <SelectItem key={service} value={service.toLowerCase()}>
                                  {service}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Range</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select budget range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="<5k">Less than $5,000</SelectItem>
                              <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                              <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                              <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                              <SelectItem value="50k+">$50,000+</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Details *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your project, goals, and timeline..."
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-accent text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : <>Send Message <Send className="ml-2 h-4 w-4" /></>}
                  </Button>
                </form>
              </Form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <MessageSquare className="size-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Have Questions?</h2>
            <p className="text-muted-foreground mb-6">
              Check out our FAQ section for quick answers to common questions.
            </p>
            <Button variant="outline">View FAQ</Button>
          </motion.div>
        </div>
      </section>
    </>
  )
}