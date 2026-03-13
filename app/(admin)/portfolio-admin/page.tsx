"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
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
   AlertDialogTrigger, // ✅ ADD THIS
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus, Pencil, Trash, Loader2, ExternalLink } from "lucide-react"

// ─────────────────────────────────────────────
// Types (Full fields from portfolio_projects table)
// ─────────────────────────────────────────────
type PortfolioProject = {
  id: string
  title: string
  slug: string
  short_description: string
  thumbnail_url?: string
  project_type?: string
  category?: string
  success_story?: string
  project_url?: string        // External live link
  featured: boolean
  active: boolean
  order_index: number
  created_at: string
  updated_at?: string
}

// ─────────────────────────────────────────────
// Form State for Add/Edit
// ─────────────────────────────────────────────
type FormState = {
  id?: string
  title: string
  slug: string
  short_description: string
  thumbnail_url: string
  project_type: string
  category: string
  success_story: string
  project_url: string
  featured: boolean
  active: boolean
  order_index: number
}

export default function AdminPortfolioPage() {
  const supabase = createClient()

  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mode, setMode] = useState<"add" | "edit">("add")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    title: "",
    slug: "",
    short_description: "",
    thumbnail_url: "",
    project_type: "",
    category: "",
    success_story: "",
    project_url: "",
    featured: false,
    active: true,
    order_index: 0,
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // ─────────────────────────────────────────────
  // Fetch All Projects
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .order("order_index", { ascending: true })

    if (error) {
      console.error("Error fetching projects:", error)
      toast.error("Failed to load projects")
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }

  // ─────────────────────────────────────────────
  // Form Validation
  // ─────────────────────────────────────────────
  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!form.title.trim()) newErrors.title = "Title is required"
    if (!form.slug.trim()) newErrors.slug = "Slug is required"
    if (!form.short_description.trim()) newErrors.short_description = "Short description is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ─────────────────────────────────────────────
  // Reset Form
  // ─────────────────────────────────────────────
  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      short_description: "",
      thumbnail_url: "",
      project_type: "",
      category: "",
      success_story: "",
      project_url: "",
      featured: false,
      active: true,
      order_index: projects.length,
    })
    setErrors({})
    setMode("add")
  }

  // ─────────────────────────────────────────────
  // Open Add Dialog
  // ─────────────────────────────────────────────
  const handleAdd = () => {
    resetForm()
    setOpenDialog(true)
  }

  // ─────────────────────────────────────────────
  // Open Edit Dialog
  // ─────────────────────────────────────────────
  const handleEdit = (project: PortfolioProject) => {
    setMode("edit")
    setForm({
      id: project.id,
      title: project.title,
      slug: project.slug,
      short_description: project.short_description,
      thumbnail_url: project.thumbnail_url || "",
      project_type: project.project_type || "",
      category: project.category || "",
      success_story: project.success_story || "",
      project_url: project.project_url || "",
      featured: project.featured,
      active: project.active,
      order_index: project.order_index,
    })
    setOpenDialog(true)
  }

  // ─────────────────────────────────────────────
  // Save (Add or Update)
  // ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors")
      return
    }

    setIsSubmitting(true)

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim().toLowerCase(),
      short_description: form.short_description.trim(),
      thumbnail_url: form.thumbnail_url.trim() || null,
      project_type: form.project_type.trim() || null,
      category: form.category.trim() || null,
      success_story: form.success_story.trim() || null,
      project_url: form.project_url.trim() || null,
      featured: form.featured,
      active: form.active,
      order_index: form.order_index,
    }

    let result

    if (mode === "add") {
      result = await supabase.from("portfolio_projects").insert(payload).select().single()
    } else {
      result = await supabase
        .from("portfolio_projects")
        .update(payload)
        .eq("id", form.id!)
        .select()
        .single()
    }

    const { data, error } = result

    setIsSubmitting(false)

    if (error) {
      toast.error(error.message)
      return
    }

    if (mode === "add") {
      setProjects([data, ...projects])
      toast.success("Project added successfully")
    } else {
      setProjects(projects.map(p => p.id === data.id ? data : p))
      toast.success("Project updated successfully")
    }

    setOpenDialog(false)
    resetForm()
  }

  // ─────────────────────────────────────────────
  // Delete Project
  // ─────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return

    const { error } = await supabase
      .from("portfolio_projects")
      .delete()
      .eq("id", deleteId)

    if (error) {
      toast.error("Delete failed: " + error.message)
    } else {
      setProjects(projects.filter(p => p.id !== deleteId))
      toast.success("Project deleted successfully")
    }

    setDeleteId(null)
  }

  // ─────────────────────────────────────────────
  // Toggle Featured / Active
  // ─────────────────────────────────────────────
  const toggleField = async (id: string, field: "featured" | "active", current: boolean) => {
    const newValue = !current

    // Optimistic update
    setProjects(prev =>
      prev.map(p => p.id === id ? { ...p, [field]: newValue } : p)
    )

    const { error } = await supabase
      .from("portfolio_projects")
      .update({ [field]: newValue })
      .eq("id", id)

    if (error) {
      toast.error("Update failed")
      // Rollback
      setProjects(prev =>
        prev.map(p => p.id === id ? { ...p, [field]: current } : p)
      )
    }
  }

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Management</h1>
          <p className="text-muted-foreground">Add, edit and manage your public portfolio projects</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add New Project
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">No projects yet. Add your first project.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-4 text-left">Title</th>
                  <th className="p-4 text-left">Slug</th>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-center">Featured</th>
                  <th className="p-4 text-center">Active</th>
                  <th className="p-4 text-center">Order</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-t hover:bg-muted/30">
                    <td className="p-4 font-medium">{project.title}</td>
                    <td className="p-4 text-muted-foreground">{project.slug}</td>
                    <td className="p-4">{project.category || "—"}</td>
                    <td className="p-4 text-center">
                      <Switch
                        checked={project.featured}
                        onCheckedChange={() => toggleField(project.id, "featured", project.featured)}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <Switch
                        checked={project.active}
                        onCheckedChange={() => toggleField(project.id, "active", project.active)}
                      />
                    </td>
                    <td className="p-4 text-center">{project.order_index}</td>
                    <td className="p-4 text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => setDeleteId(project.id)}
                              className="bg-destructive"
                            >
                              Delete
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

      {/* Add / Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={(open) => { setOpenDialog(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{mode === "add" ? "Add New Project" : "Edit Project"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={e => {
                  setForm({ ...form, title: e.target.value })
                  // Auto slug generation
                  if (mode === "add") {
                    setForm(prev => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                    }))
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Slug (URL friendly) *</Label>
              <Input
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase() })}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Short Description *</Label>
              <Textarea
                value={form.short_description}
                onChange={e => setForm({ ...form, short_description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Thumbnail URL</Label>
              <Input
                value={form.thumbnail_url}
                onChange={e => setForm({ ...form, thumbnail_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Project URL (Live Link - New Tab)</Label>
              <Input
                value={form.project_url}
                onChange={e => setForm({ ...form, project_url: e.target.value })}
                placeholder="https://clientwebsite.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Project Type</Label>
              <Input
                value={form.project_type}
                onChange={e => setForm({ ...form, project_type: e.target.value })}
                placeholder="Website, E-Commerce, Mobile App..."
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="FinTech, Healthcare, Retail..."
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Success Story (Optional)</Label>
              <Textarea
                value={form.success_story}
                onChange={e => setForm({ ...form, success_story: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.featured}
                  onCheckedChange={checked => setForm({ ...form, featured: checked })}
                />
                <Label>Featured Project</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={form.active}
                  onCheckedChange={checked => setForm({ ...form, active: checked })}
                />
                <Label>Active (Show on Public)</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Order Index</Label>
              <Input
                type="number"
                value={form.order_index}
                onChange={e => setForm({ ...form, order_index: Number(e.target.value) || 0 })}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "add" ? "Add Project" : "Update Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}