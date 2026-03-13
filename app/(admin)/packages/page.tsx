"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog" 
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus, Pencil, Trash, Loader2, X, Check } from "lucide-react"
import { useRouter } from "next/navigation"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type PricingPlan = {
  id: string
  name: string
  slug: string
  description: string
  monthly_price: number
  yearly_price: number
  currency: string
  is_popular: boolean
  features: string[]
  cta_text: string
  order_index: number
  active: boolean
  created_at: string
  updated_at: string
}

type FormState = {
  id?: string
  name: string
  slug: string
  description: string
  monthly_price: number
  yearly_price: number
  currency: string
  is_popular: boolean
  features: string[]
  featureInput: string
  cta_text: string
  order_index: number
  active: boolean
}

// ─────────────────────────────────────────────
export default function AdminPackagesPage() {
  const supabase = createClient()
  const router = useRouter()

  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mode, setMode] = useState<"add" | "edit">("add")
  const [currentPlan, setCurrentPlan] = useState<PricingPlan | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
    description: "",
    monthly_price: 0,
    yearly_price: 0,
    currency: "PKR",
    is_popular: false,
    features: [],
    featureInput: "",
    cta_text: "Get Started",
    order_index: 0,
    active: true,
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Check auth & fetch plans
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to access this page")
        router.push("/login")
        return
      }

      fetchPlans()
    }

    checkAuthAndFetch()
  }, [router, supabase])

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("pricing_plans")
        .select("*")
        .order("order_index", { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (err: any) {
      toast.error("Failed to load plans: " + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  // Form Helpers
  // ─────────────────────────────────────────────
  const validateForm = useCallback(() => {
    const newErrors: typeof errors = {}

    if (!form.name.trim()) newErrors.name = "Plan name is required"
    if (!form.slug.trim()) newErrors.slug = "Slug is required"
    else if (!/^[a-z0-9-]+$/.test(form.slug)) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens"
    }

    if (form.monthly_price < 0) newErrors.monthly_price = "Monthly price cannot be negative"
    if (form.yearly_price < 0) newErrors.yearly_price = "Yearly price cannot be negative"

    if (form.features.length === 0) newErrors.features = "At least one feature is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form])

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      monthly_price: 0,
      yearly_price: 0,
      currency: "PKR",
      is_popular: false,
      features: [],
      featureInput: "",
      cta_text: "Get Started",
      order_index: plans.length,
      active: true,
    })
    setErrors({})
    setMode("add")
    setCurrentPlan(null)
  }

  // ─────────────────────────────────────────────
  // Dialog Handlers
  // ─────────────────────────────────────────────
  const handleAdd = () => {
    resetForm()
    setOpenDialog(true)
  }

  const handleEdit = (plan: PricingPlan) => {
    setMode("edit")
    setCurrentPlan(plan)
    setForm({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      monthly_price: plan.monthly_price,
      yearly_price: plan.yearly_price,
      currency: plan.currency,
      is_popular: plan.is_popular,
      features: [...plan.features],
      featureInput: "",
      cta_text: plan.cta_text,
      order_index: plan.order_index,
      active: plan.active,
    })
    setOpenDialog(true)
  }

  // ─────────────────────────────────────────────
  // Features Management
  // ─────────────────────────────────────────────
  const addFeature = () => {
    if (!form.featureInput.trim()) return
    setForm(prev => ({
      ...prev,
      features: [...prev.features, prev.featureInput.trim()],
      featureInput: "",
    }))
  }

  const removeFeature = (index: number) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  // ─────────────────────────────────────────────
  // Save (Create/Update)
  // ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        description: form.description.trim(),
        monthly_price: form.monthly_price,
        yearly_price: form.yearly_price,
        currency: form.currency,
        is_popular: form.is_popular,
        features: form.features,
        cta_text: form.cta_text.trim(),
        order_index: form.order_index,
        active: form.active,
      }

      let result
      if (mode === "add") {
        result = await supabase.from("pricing_plans").insert(payload).select().single()
      } else {
        result = await supabase
          .from("pricing_plans")
          .update(payload)
          .eq("id", form.id!)
          .select()
          .single()
      }

      const { data, error } = result

      if (error) throw error

      if (mode === "add") {
        setPlans([data, ...plans])
        toast.success("Plan created successfully!")
      } else {
        setPlans(plans.map(p => p.id === data.id ? data : p))
        toast.success("Plan updated successfully!")
      }

      setOpenDialog(false)
      resetForm()
    } catch (err: any) {
      toast.error(`${mode === "add" ? "Create" : "Update"} failed: ${err.message}`)
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─────────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteId) return

    try {
      // Optimistic delete
      const originalPlans = [...plans]
      setPlans(plans.filter(p => p.id !== deleteId))

      const { error } = await supabase
        .from("pricing_plans")
        .delete()
        .eq("id", deleteId)

      if (error) {
        setPlans(originalPlans) // rollback
        throw error
      }

      toast.success("Plan deleted successfully")
    } catch (err: any) {
      toast.error("Delete failed: " + err.message)
      console.error(err)
    } finally {
      setDeleteId(null)
    }
  }

  // ─────────────────────────────────────────────
  // Toggle Active / Popular (Optimistic)
  // ─────────────────────────────────────────────
  const toggleField = async (
    id: string,
    field: "active" | "is_popular",
    currentValue: boolean
  ) => {
    const newValue = !currentValue

    // Optimistic UI
    setPlans(prev =>
      prev.map(p => p.id === id ? { ...p, [field]: newValue } : p)
    )

    try {
      const { error } = await supabase
        .from("pricing_plans")
        .update({ [field]: newValue })
        .eq("id", id)

      if (error) throw error
    } catch (err: any) {
      // Rollback on error
      setPlans(prev =>
        prev.map(p => p.id === id ? { ...p, [field]: currentValue } : p)
      )
      toast.error(`Failed to update ${field}`)
      console.error(err)
    }
  }

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Plans</h1>
          <p className="text-muted-foreground mt-1">
            Manage your public pricing packages and features
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add New Plan
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : plans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              No pricing plans found
            </p>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border overflow-hidden bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-6 py-4 text-left font-medium">Plan</th>
                  <th className="px-6 py-4 text-left font-medium">Slug</th>
                  <th className="px-6 py-4 text-center font-medium">Monthly</th>
                  <th className="px-6 py-4 text-center font-medium">Popular</th>
                  <th className="px-6 py-4 text-center font-medium">Active</th>
                  <th className="px-6 py-4 text-center font-medium">Order</th>
                  <th className="px-6 py-4 text-right font-medium pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {plans.map(plan => (
                  <tr key={plan.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{plan.name}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">{plan.slug}</td>
                    <td className="px-6 py-4 text-center font-medium">
                      {plan.currency === "PKR" ? "₨" : "$"}{plan.monthly_price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Switch
                        checked={plan.is_popular}
                        onCheckedChange={() => toggleField(plan.id, "is_popular", plan.is_popular)}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Switch
                        checked={plan.active}
                        onCheckedChange={() => toggleField(plan.id, "active", plan.active)}
                      />
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium">
                      {plan.order_index}
                    </td>
                    <td className="px-6 py-4 text-right pr-8 space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(plan)}
                        className="hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{plan.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The plan will be removed from the public pricing page.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => setDeleteId(plan.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete Plan
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={open => {
        setOpenDialog(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {mode === "add" ? "Create New Pricing Plan" : `Edit: ${currentPlan?.name}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8 py-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="required">Plan Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Professional"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="required">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={e => setForm({
                    ...form,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                  })}
                  placeholder="professional"
                  className={errors.slug ? "border-destructive" : ""}
                />
                {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description / Tagline</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Ideal for growing businesses and medium-sized projects"
                rows={3}
              />
            </div>

            {/* Pricing Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="monthly_price">Monthly Price</Label>
                <Input
                  id="monthly_price"
                  type="number"
                  min="0"
                  step="1000"
                  value={form.monthly_price}
                  onChange={e => setForm({ ...form, monthly_price: Number(e.target.value) || 0 })}
                  className={errors.monthly_price ? "border-destructive" : ""}
                />
                {errors.monthly_price && <p className="text-sm text-destructive mt-1">{errors.monthly_price}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearly_price">Yearly Price</Label>
                <Input
                  id="yearly_price"
                  type="number"
                  min="0"
                  step="1000"
                  value={form.yearly_price}
                  onChange={e => setForm({ ...form, yearly_price: Number(e.target.value) || 0 })}
                  className={errors.yearly_price ? "border-destructive" : ""}
                />
                {errors.yearly_price && <p className="text-sm text-destructive mt-1">{errors.yearly_price}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={form.currency}
                  onChange={e => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                  placeholder="PKR"
                />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <Label>Features</Label>
              <div className="flex gap-3">
                <Input
                  placeholder="Type feature and press Enter"
                  value={form.featureInput}
                  onChange={e => setForm({ ...form, featureInput: e.target.value })}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addFeature()
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={addFeature}>
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {form.features.map((feature, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="pl-3 pr-2 py-1.5 flex items-center gap-1.5 hover:bg-destructive/10 cursor-pointer"
                    onClick={() => removeFeature(idx)}
                  >
                    {feature}
                    <X className="h-3.5 w-3.5" />
                  </Badge>
                ))}
              </div>

              {errors.features && (
                <p className="text-sm text-destructive mt-2">{errors.features}</p>
              )}
              {form.features.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Add at least one feature
                </p>
              )}
            </div>

            {/* CTA & Order & Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cta_text">CTA Button Text</Label>
                <Input
                  id="cta_text"
                  value={form.cta_text}
                  onChange={e => setForm({ ...form, cta_text: e.target.value })}
                  placeholder="Get Started"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order_index">Display Order</Label>
                <Input
                  id="order_index"
                  type="number"
                  min="0"
                  value={form.order_index}
                  onChange={e => setForm({ ...form, order_index: Number(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  Lower number = higher position
                </p>
              </div>

              <div className="flex flex-col justify-center gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <Switch
                    id="popular"
                    checked={form.is_popular}
                    onCheckedChange={checked => setForm({ ...form, is_popular: checked })}
                  />
                  <Label htmlFor="popular" className="cursor-pointer">Mark as Most Popular</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="active"
                    checked={form.active}
                    onCheckedChange={checked => setForm({ ...form, active: checked })}
                  />
                  <Label htmlFor="active" className="cursor-pointer">Show on Public Page</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-4 sm:gap-0 pt-6 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : mode === "add" ? "Create Plan" : "Update Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}