"use client"

import { useEffect, useState } from "react"
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
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus, Pencil, Trash, Loader2, Globe, FileText, Eye, Search } from "lucide-react"
import { format } from "date-fns"

// ─────────────────────────────────────────────
// Blog Post Type (full fields from DB)
// ─────────────────────────────────────────────
type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image?: string
  category: string
  author: string
  status: "draft" | "published"
  featured: boolean
  published_at?: string
  created_at: string
  updated_at?: string
  meta_title?: string
  meta_description?: string
  keywords?: string[]
}

// ─────────────────────────────────────────────
// Form State
// ─────────────────────────────────────────────
type FormState = {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  category: string
  author: string
  status: "draft" | "published"
  featured: boolean
  meta_title: string
  meta_description: string
  keywords: string
}

export default function AdminBlogPage() {
  const supabase = createClient()

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mode, setMode] = useState<"add" | "edit">("add")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [form, setForm] = useState<FormState>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    category: "",
    author: "",
    status: "draft",
    featured: false,
    meta_title: "",
    meta_description: "",
    keywords: "",
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // ─────────────────────────────────────────────
  // Fetch All Posts + Realtime Subscription
  // ─────────────────────────────────────────────
  useEffect(() => {
    let mounted = true

    const fetchPosts = async () => {
      if (!mounted) return
      setLoading(true)
      try {
        // Select * to avoid column missing errors
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .order("published_at", { ascending: false, nullsFirst: true })

        if (error) throw error

        if (mounted) setPosts(data || [])
      } catch (err: any) {
        console.error("Blog fetch error:", err.message)
        toast.error("Failed to load blog posts – check table schema")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchPosts()

    // Realtime subscription
    const channel = supabase
      .channel("blog-posts-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "blog_posts" }, (payload) => {
        if (!mounted) return

        if (payload.eventType === "INSERT") {
          setPosts(prev => [payload.new as BlogPost, ...prev])
          toast.info("New post added")
        } else if (payload.eventType === "UPDATE") {
          setPosts(prev => prev.map(p => p.id === payload.new.id ? payload.new as BlogPost : p))
          toast.info("Post updated")
        } else if (payload.eventType === "DELETE") {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id))
          toast.info("Post deleted")
        }
      })
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // ─────────────────────────────────────────────
  // Form Validation
  // ─────────────────────────────────────────────
  const validateForm = () => {
    const newErrors: typeof errors = {}
    if (!form.title.trim()) newErrors.title = "Title is required"
    if (!form.slug.trim()) newErrors.slug = "Slug is required"
    if (!form.excerpt.trim()) newErrors.excerpt = "Excerpt is required"
    if (!form.content.trim()) newErrors.content = "Content is required"
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
      excerpt: "",
      content: "",
      featured_image: "",
      category: "",
      author: "",
      status: "draft",
      featured: false,
      meta_title: "",
      meta_description: "",
      keywords: "",
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
  const handleEdit = (post: BlogPost) => {
    setMode("edit")
    setForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featured_image: post.featured_image || "",
      category: post.category || "",
      author: post.author || "",
      status: post.status || "draft",
      featured: post.featured,
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
      keywords: post.keywords?.join(", ") || "",
    })
    setOpenDialog(true)
  }

  // ─────────────────────────────────────────────
  // Save Post (Add or Update)
  // ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill required fields")
      return
    }

    setIsSubmitting(true)

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      featured_image: form.featured_image.trim() || null,
      category: form.category.trim() || null,
      author: form.author.trim() || null,
      status: form.status,
      featured: form.featured,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
      keywords: form.keywords.split(",").map(k => k.trim()).filter(Boolean),
      published_at: form.status === "published" ? new Date().toISOString() : null,
    }

    let result

    if (mode === "add") {
      result = await supabase.from("blog_posts").insert(payload).select().single()
    } else {
      result = await supabase
        .from("blog_posts")
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

    toast.success(mode === "add" ? "Post created!" : "Post updated!")
    setOpenDialog(false)
    resetForm()
  }

  // ─────────────────────────────────────────────
  // Delete Post
  // ─────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return

    const { error } = await supabase.from("blog_posts").delete().eq("id", deleteId)

    if (error) {
      toast.error("Delete failed: " + error.message)
    } else {
      toast.success("Post deleted")
    }

    setDeleteId(null)
  }

  // ─────────────────────────────────────────────
  // Filtered Posts (search + status)
  // ─────────────────────────────────────────────
  const filteredPosts = posts.filter(post => {
    const matchesSearch = search === "" ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === "all" || post.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and publish blog posts</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" /> New Post
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{filteredPosts.filter(p => p.status === "published").length}</p>
              </div>
              <Globe className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{filteredPosts.filter(p => p.status === "draft").length}</p>
              </div>
              <FileText className="h-8 w-8 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{filteredPosts.length}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-45">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No posts found. Add your first blog post!
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-4 text-left font-medium">Title</th>
                  <th className="p-4 text-left font-medium">Category</th>
                  <th className="p-4 text-center font-medium">Status</th>
                  <th className="p-4 text-center font-medium">Featured</th>
                  <th className="p-4 text-center font-medium">Published</th>
                  <th className="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map(post => (
                  <tr key={post.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{post.title}</td>
                    <td className="p-4">{post.category || "—"}</td>
                    <td className="p-4 text-center">
                      <Badge variant={post.status === "published" ? "default" : "secondary"}>
                        {post.status === "published" ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Switch
                        checked={post.featured}
                        onCheckedChange={() => {
                          supabase
                            .from("blog_posts")
                            .update({ featured: !post.featured })
                            .eq("id", post.id)
                            .then(() => {
                              setPosts(prev => prev.map(p => p.id === post.id ? { ...p, featured: !post.featured } : p))
                              toast.success("Featured updated")
                            })
                        }}
                      />
                    </td>
                    <td className="p-4 text-center text-sm text-muted-foreground">
                      {post.published_at ? format(new Date(post.published_at), "MMM dd, yyyy") : "—"}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}>
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
                            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The post will be permanently deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => setDeleteId(post.id)}
                              className="bg-destructive hover:bg-destructive/90"
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={(open) => {
        setOpenDialog(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{mode === "add" ? "Create New Post" : "Edit Post"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={e => {
                    setForm({ ...form, title: e.target.value })
                    // Auto generate slug on add mode
                    if (mode === "add") {
                      const slug = e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "")
                      setForm(prev => ({ ...prev, slug }))
                    }
                  }}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                  className={errors.slug ? "border-destructive" : ""}
                />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Excerpt *</Label>
              <Textarea
                value={form.excerpt}
                onChange={e => setForm({ ...form, excerpt: e.target.value })}
                rows={3}
                className={errors.excerpt ? "border-destructive" : ""}
              />
              {errors.excerpt && <p className="text-sm text-destructive">{errors.excerpt}</p>}
            </div>

            <div className="space-y-2">
              <Label>Content (Markdown/HTML) *</Label>
              <Textarea
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                rows={10}
                className={errors.content ? "border-destructive" : ""}
              />
              {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Featured Image URL</Label>
                <Input
                  value={form.featured_image}
                  onChange={e => setForm({ ...form, featured_image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="Technology, Business, AI..."
                />
              </div>

              <div className="space-y-2">
                <Label>Author</Label>
                <Input
                  value={form.author}
                  onChange={e => setForm({ ...form, author: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={form.status === "published"}
                    onCheckedChange={checked => setForm({ ...form, status: checked ? "published" : "draft" })}
                  />
                  <span>{form.status === "published" ? "Published" : "Draft"}</span>
                </div>
              </div>
            </div>

            <Tabs defaultValue="seo">
              <TabsList>
                <TabsTrigger value="seo">SEO Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="seo" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input
                    value={form.meta_title}
                    onChange={e => setForm({ ...form, meta_title: e.target.value })}
                    placeholder="SEO optimized title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    value={form.meta_description}
                    onChange={e => setForm({ ...form, meta_description: e.target.value })}
                    rows={3}
                    placeholder="150-160 characters for search results"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Keywords (comma separated)</Label>
                  <Input
                    value={form.keywords}
                    onChange={e => setForm({ ...form, keywords: e.target.value })}
                    placeholder="web development, AI, React, Next.js"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "add" ? "Publishing..." : "Updating..."}
                  </>
                ) : mode === "add" ? "Publish Post" : "Update Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}