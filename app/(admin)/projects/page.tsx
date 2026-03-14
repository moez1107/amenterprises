"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { fetchProjects, formatCurrency, formatDate } from "@/lib/mock-api"
import type { Project, ProjectTask } from "@/lib/types"
import usersData from "@/mock-data/users.json"
import { Plus, Clock, Upload, GripVertical } from "lucide-react"
import { toast } from "sonner"

const kanbanColumns = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "done", label: "Done" },
]

export default function ProjectsPage() {
  const { company } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"kanban" | "list">("kanban")

  useEffect(() => {
    fetchProjects(company.id).then((data) => { setProjects(data); setLoading(false) })
  }, [company.id])

  const allTasks = projects.flatMap((p) =>
    p.tasks.map((t) => ({ ...t, projectName: p.name, projectId: p.id }))
  )

  const getTasksByStatus = (status: string) => allTasks.filter((t) => t.status === status)

  const moveTask = (taskId: number, newStatus: ProjectTask["status"]) => {
    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      }))
    )
    toast.success("Task moved")
  }

  const getDeadlineCountdown = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return "Overdue"
    if (days === 0) return "Due today"
    return `${days} days left`
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Project Management"
        description="Track projects with Kanban boards and milestones."
        breadcrumbs={[{ label: "Projects" }]}
        actions={
          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "list")}>
              <TabsList className="h-9"><TabsTrigger value="kanban">Kanban</TabsTrigger><TabsTrigger value="list">List</TabsTrigger></TabsList>
            </Tabs>
            <Dialog>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 size-4" /> New Project</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Project</DialogTitle>
                  <DialogDescription>Add a new project to your workspace.</DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); toast.success("Project created") }} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2"><Label>Name</Label><Input placeholder="Project name" required /></div>
                  <div className="flex flex-col gap-2"><Label>Client</Label><Input placeholder="Client name" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2"><Label>Start Date</Label><Input type="date" /></div>
                    <div className="flex flex-col gap-2"><Label>Deadline</Label><Input type="date" /></div>
                  </div>
                  <div className="flex flex-col gap-2"><Label>Budget</Label><Input type="number" placeholder="0" /></div>
                  <Button type="submit">Create</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {view === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => (
            <div key={col.id} className="flex min-w-72 flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-sm font-medium text-foreground">{col.label}</span>
                <Badge variant="secondary" className="text-xs">{getTasksByStatus(col.id).length}</Badge>
              </div>
              {getTasksByStatus(col.id).map((task) => {
                const assignee = usersData.find((u) => u.id === task.assigneeId)
                return (
                  <Card key={task.id} className="border shadow-sm hover:shadow-md transition-shadow cursor-grab">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <GripVertical className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{task.projectName}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <Avatar className="size-6">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {assignee?.avatar ?? "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex gap-1">
                              {col.id !== "done" && (
                                <Button size="sm" variant="ghost" className="h-6 text-xs px-2"
                                  onClick={() => moveTask(task.id, col.id === "todo" ? "in-progress" : "done")}>
                                  Move &rarr;
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              {getTasksByStatus(col.id).length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                  Drop tasks here
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                      <StatusBadge status={project.status} />
                      <Badge variant={project.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                        {project.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>Budget: {formatCurrency(project.budget)}</span>
                      <span>Spent: {formatCurrency(project.spent)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {getDeadlineCountdown(project.deadline)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full sm:w-48">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="mt-3 flex -space-x-2">
                      {[...new Set(project.tasks.map((t) => t.assigneeId))].slice(0, 3).map((aid) => {
                        const u = usersData.find((usr) => usr.id === aid)
                        return (
                          <Avatar key={aid} className="size-6 border-2 border-background">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{u?.avatar ?? "?"}</AvatarFallback>
                          </Avatar>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
                  <span>{project.tasks.filter((t) => t.status === "done").length}/{project.tasks.length} tasks done</span>
                  <span>Deadline: {formatDate(project.deadline)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="size-4" /> File Uploads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
            <div>
              <Upload className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">Drag files here or click to upload</p>
              <p className="text-xs text-muted-foreground">Supports PDF, DOC, images up to 10MB</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => toast.success("File upload initiated")}>
                Browse Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
