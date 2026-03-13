"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Plus,
  Clock,
  Upload,
  GripVertical,
  DollarSign,
  BarChart3,
  Briefcase,
  TrendingUp,
  Edit,
  Trash,
  AlertTriangle,
} from "lucide-react"
import { format } from "date-fns"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const supabase = createClient()

type Project = {
  id: string
  name: string
  title: string
  description: string
  status: string
  start_date: string
  end_date: string | null
  budget: number
  spent: number
  progress: number
  priority: string
}

const kanbanColumns = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
  { id: "cancelled", label: "Cancelled" },
  { id: "on_hold", label: "On Hold" },
]
export default function ProjectsPage() {

  const supabase = createClient()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const [view, setView] = useState<"list" | "kanban">("list")

  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [newProject, setNewProject] = useState({
    name: "",
    title: "",
    description: "",
    status: "lead",
    start_date: "",
    end_date: "",
    budget: "",
    priority: "medium",
  })

  const [editProject, setEditProject] = useState<Project | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

  // Tasks list for kanban
  const allTasks = projects.flatMap((p) =>
    (p.tasks || []).map((t) => ({
      ...t,
      projectId: p.id,
      projectName: p.name,
    }))
  )

  const getTasksByStatus = (status: string) => {
    return allTasks.filter((task) => task.status === status)
  }

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      try {
        let query = supabase.from("projects").select("*").order("start_date", { ascending: false })

        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter)
        }

        const { data, error } = await query

        if (error) throw error

        setProjects(data || [])
      } catch (err) {
        console.error("Supabase Error:", err)
        toast.error((err as any)?.message || "Operation failed")
        toast.error("Projects load failed")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [statusFilter])

  // Stats
  const totalProjects = projects.length
  const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
  const activeProjects = projects.filter(p => ["in_progress", "review"].includes(p.status)).length
  const completionRate = totalProjects > 0
    ? Math.round((projects.filter(p => p.status === "done").length / totalProjects) * 100)
    : 0

  const revenueData = [
    { month: "Jan", revenue: 450000 },
    { month: "Feb", revenue: 620000 },
    { month: "Mar", revenue: 380000 },
    { month: "Apr", revenue: 800000 },
    { month: "May", revenue: 1200000 },
    { month: "Jun", revenue: 950000 },
  ]

  const handleCreateOrUpdate = async (e: React.FormEvent, isEdit = false) => {
    e.preventDefault()

    const projectData = {
      name: newProject.name || editProject?.name,
      title: newProject.title || editProject?.title,
      description: newProject.description || editProject?.description,
      status: newProject.status || editProject?.status,
      start_date: newProject.start_date || editProject?.start_date,
      end_date: newProject.end_date || editProject?.end_date || null,
      budget: parseFloat(newProject.budget) || editProject?.budget || 0,
      priority: newProject.priority || editProject?.priority,
      progress: editProject?.progress || 0,
      spent: editProject?.spent || 0,
    }

    try {
      if (isEdit && editProject) {
        const { error } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", editProject.id)

        if (error) throw error
        toast.success("Project updated!")
      } else {
        const { error } = await supabase.from("projects").insert(projectData)
        if (error) throw error
        toast.success("Project created!")
      }

      // Refresh
      const { data } = await supabase.from("projects").select("*").order("start_date", { ascending: false })
      setProjects(data || [])

      // Reset form
      setNewProject({
        name: "",
        title: "",
        description: "",
        status: "lead",
        start_date: "",
        end_date: "",
        budget: "",
        priority: "medium",
      })
      setEditProject(null)
    } catch (err) {
      console.error("Supabase Error:", err)
      toast.error((err as any)?.message || "Operation failed")
      toast.error("Operation failed")
    }
  }

  const handleDelete = async () => {
    if (!projectToDelete) return

    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectToDelete)
      if (error) throw error

      toast.success("Project deleted")
      setProjects(projects.filter(p => p.id !== projectToDelete))
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
    } catch (err) {
      toast.error("Delete failed")
    }
  }

  const openEdit = (project: Project) => {
    setEditProject(project)
    setNewProject({
      name: project.name,
      title: project.title,
      description: project.description,
      status: project.status,
      start_date: project.start_date,
      end_date: project.end_date || "",
      budget: project.budget.toString(),
      priority: project.priority || "medium",
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading Projects...</div>
  }

  const filteredProjects = statusFilter === "all"
    ? projects
    : projects.filter(p => p.status === statusFilter)

  return (
    <div className="p-6 space-y-8">
      {/* Dashboard Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-400">Total Projects</p>
                <p className="text-3xl font-bold text-white mt-2">{totalProjects}</p>
              </div>
              <Briefcase className="h-10 w-10 text-primary/70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-400">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-400 mt-2">
                  PKR {totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-emerald-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-400">Active Projects</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{activeProjects}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-400">Completion Rate</p>
                <p className="text-3xl font-bold text-purple-400 mt-2">{completionRate}%</p>
              </div>
              <BarChart3 className="h-10 w-10 text-purple-500/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Graph */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  itemStyle={{ color: '#c084fc' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#c084fc" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Tabs value={view} onValueChange={(v) => setView(v as "list" | "kanban")}>
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="kanban">Kanban View</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editProject ? "Edit Project" : "Create New Project"}</DialogTitle>
              <DialogDescription>
                {editProject ? "Update project details." : "Add a new project to your agency."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => handleCreateOrUpdate(e, !!editProject)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Project name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="Project title"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Brief description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newProject.status}
                    onValueChange={(v) => setNewProject({ ...newProject, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newProject.priority}
                    onValueChange={(v) => setNewProject({ ...newProject, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={newProject.start_date}
                    onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={newProject.end_date}
                    onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Budget (PKR)</Label>
                <Input
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setNewProject({ name: "", title: "", description: "", status: "lead", start_date: "", end_date: "", budget: "", priority: "medium" })
                  setEditProject(null)
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editProject ? "Update Project" : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects List / Kanban */}
      {view === "list" ? (
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No projects found {statusFilter !== "all" ? `with status "${statusFilter}"` : ""}.
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Card key={project.id} className="bg-slate-900/60 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                        <Badge variant={
                          project.status === "completed" ? "default" :
                            project.status === "in_progress" ? "secondary" :
                              project.status === "cancelled" ? "destructive" : "outline"
                        }>
                          {project.status.replace("_", " ")}
                        </Badge>
                        <Badge variant={
                          project.priority === "high" ? "destructive" :
                            project.priority === "medium" ? "secondary" : "outline"
                        }>
                          {project.priority}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{project.description}</p>
                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                        <span>Budget: PKR {(project.budget ?? 0).toLocaleString()}</span>
                        <span>Spent: PKR {(project.spent ?? 0).toLocaleString()}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {project.end_date ? format(new Date(project.end_date), "MMM dd, yyyy") : "Ongoing"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="w-40">
                        <div className="flex justify-between text-xs mb-1 text-slate-300">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(project)}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setProjectToDelete(project.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        // Kanban View (same as before - working drag-drop)
        <div className="flex gap-6 overflow-x-auto pb-6">
          {kanbanColumns.map((col) => (
            <div key={col.id} className="flex min-w-[320px] flex-col gap-4">
              <div className="flex items-center justify-between rounded-lg bg-slate-800/50 px-4 py-3 backdrop-blur-sm border border-slate-700">
                <span className="font-medium text-white">{col.label}</span>
                <Badge variant="secondary">{getTasksByStatus(col.id).length}</Badge>
              </div>

              {getTasksByStatus(col.id).map((task) => (
                <Card key={task.id} className="bg-slate-900/80 border-slate-700 hover:border-slate-500 transition-colors cursor-grab">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <GripVertical className="h-5 w-5 text-slate-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-white">{task.title}</p>
                        <p className="text-sm text-slate-400 mt-1">{task.projectName}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {task.assigneeId?.slice(0, 2) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => moveTask(task.id, task.projectId, col.id === "todo" ? "in-progress" : col.id === "in-progress" ? "done" : "todo")}
                          >
                            Move
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {getTasksByStatus(col.id).length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500 backdrop-blur-sm">
                  Drop tasks here
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" /> Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Upload Section */}
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Upload className="h-5 w-5" /> File Uploads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center">
            <Upload className="mx-auto h-12 w-12 text-slate-500" />
            <p className="mt-4 text-slate-200">Drag & drop files here or click to browse</p>
            <p className="text-sm text-slate-400 mt-1">PDF, DOC, images up to 10MB</p>
            <Button variant="outline" className="mt-6">
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}