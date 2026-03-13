"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  Plus,
  Download,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { format } from "date-fns"

// ─────────────────────────────────────────────
// Types – Deep & Real (all fields from consultation_requests table)
// ─────────────────────────────────────────────
type Lead = {
  id: string
  name: string
  email: string
  phone?: string
  project_type?: string
  budget?: string
  timeline?: string
  message: string
  source: string
  status: "new" | "contacted" | "qualified" | "proposal" | "closed-won" | "closed-lost"
  notes?: string
  created_at: string
  updated_at?: string
}

// ─────────────────────────────────────────────
// Pipeline Stages (Kanban columns)
// ─────────────────────────────────────────────
const PIPELINE_STAGES = [
  { id: "new", label: "New", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { id: "contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { id: "qualified", label: "Qualified", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  { id: "proposal", label: "Proposal Sent", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
  { id: "closed-won", label: "Closed Won", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  { id: "closed-lost", label: "Closed Lost", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
]

// ─────────────────────────────────────────────
// Pagination Constants
// ─────────────────────────────────────────────
const ITEMS_PER_PAGE = 10

export default function AdminLeadsPage() {
  const supabase = createClient()

  // ─────────────────────────────────────────────
  // State Management
  // ─────────────────────────────────────────────
  const [leads, setLeads] = useState<Lead[]>([])               // All loaded leads from DB
  const [loading, setLoading] = useState(true)                 // Loading state
  const [view, setView] = useState<"table" | "pipeline">("table") // Table or Kanban view
  const [searchTerm, setSearchTerm] = useState("")             // Search input
  const [statusFilter, setStatusFilter] = useState("all")      // Status filter
  const [currentPage, setCurrentPage] = useState(1)            // Pagination: current page
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null) // For notes/details modal
  const [notesModalOpen, setNotesModalOpen] = useState(false)  // Notes dialog visibility
  const [newNote, setNewNote] = useState("")                   // New note text
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false) // Status change loader

  // ─────────────────────────────────────────────
  // Fetch All Leads + Realtime Subscription
  // ─────────────────────────────────────────────
  useEffect(() => {
    async function fetchLeads() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("consultation_requests")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Leads fetch error:", error.message, error.details, error.hint)
          toast.error("Failed to load leads from database")
          return
        }

        setLeads(data || [])
      } catch (err: any) {
        console.error("Unexpected fetch error:", err)
        toast.error("Network error while loading leads")
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()

    // Realtime: Auto-update when new lead is inserted
    const channel = supabase
      .channel("leads-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "consultation_requests" },
        (payload) => {
          setLeads((prev) => [payload.new as Lead, ...prev])
          toast.info("New consultation request received!")
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // ─────────────────────────────────────────────
  // Filtered & Paginated Leads (for table view)
  // ─────────────────────────────────────────────
  const filteredLeads = leads.filter((lead) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      searchTerm === "" ||
      lead.name.toLowerCase().includes(searchLower) ||
      lead.email.toLowerCase().includes(searchLower) ||
      (lead.phone && lead.phone.includes(searchLower)) ||
      (lead.message && lead.message.toLowerCase().includes(searchLower))

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Pagination logic
  const totalItems = filteredLeads.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  // ─────────────────────────────────────────────
  // Update Lead Status (used in both table & pipeline)
  // ─────────────────────────────────────────────
  const updateLeadStatus = async (leadId: string, newStatus: Lead["status"]) => {
    setStatusUpdateLoading(true)
    try {
      const { error } = await supabase
        .from("consultation_requests")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", leadId)

      if (error) throw error

      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      )
      toast.success(`Status updated to "${newStatus.replace("-", " ")}"`)
    } catch (err: any) {
      console.error("Status update failed:", err.message)
      toast.error("Failed to update status")
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  // Add Internal Note to Lead
  // ─────────────────────────────────────────────
  const addNote = async () => {
    if (!selectedLead || !newNote.trim()) return

    try {
      const updatedNotes = (selectedLead.notes || "") + `\n[${new Date().toLocaleString()}] ${newNote.trim()}`

      const { error } = await supabase
        .from("consultation_requests")
        .update({
          notes: updatedNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedLead.id)

      if (error) throw error

      setLeads((prev) =>
        prev.map((l) =>
          l.id === selectedLead.id ? { ...l, notes: updatedNotes } : l
        )
      )
      setNewNote("")
      toast.success("Note added successfully")
    } catch (err: any) {
      console.error("Add note failed:", err)
      toast.error("Failed to add note")
    }
  }

  // ─────────────────────────────────────────────
  // Export Filtered Leads to CSV
  // ─────────────────────────────────────────────
  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      toast.warning("No leads to export")
      return
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Project Type",
      "Budget",
      "Timeline",
      "Message",
      "Source",
      "Status",
      "Created At",
      "Notes",
    ].join(",")

    const rows = filteredLeads.map((lead) => [
      `"${lead.name.replace(/"/g, '""')}"`,
      `"${lead.email.replace(/"/g, '""')}"`,
      `"${lead.phone || ""}"`,
      `"${lead.project_type || ""}"`,
      `"${lead.budget || ""}"`,
      `"${lead.timeline || ""}"`,
      `"${lead.message.replace(/"/g, '""')}"`,
      `"${lead.source}"`,
      `"${lead.status}"`,
      `"${format(new Date(lead.created_at), "yyyy-MM-dd HH:mm:ss")}"`,
      `"${(lead.notes || "").replace(/"/g, '""')}"`,
    ].join(","))

    const csvContent = [headers, ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast.success(`Exported ${filteredLeads.length} leads to CSV`)
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads & Proposals</h1>
          <p className="text-muted-foreground mt-1">
            View, manage, and track all incoming consultation requests and proposals.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>

          <Tabs value={view} onValueChange={(v) => setView(v as "table" | "pipeline")}>
            <TabsList>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {PIPELINE_STAGES.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading / Empty State */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No leads found matching your filters. Try adjusting search or status.
          </CardContent>
        </Card>
      ) : view === "table" ? (
        /* ─────────────────────────────────────────────
           Table View – Detailed List with Pagination
           ───────────────────────────────────────────── */
        <Card className="border shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-muted/60 sticky top-0">
                  <tr>
                    <th className="p-4 text-left font-medium">Name</th>
                    <th className="p-4 text-left font-medium">Email</th>
                    <th className="p-4 text-left font-medium">Phone</th>
                    <th className="p-4 text-left font-medium">Project Type</th>
                    <th className="p-4 text-left font-medium">Budget</th>
                    <th className="p-4 text-left font-medium">Timeline</th>
                    <th className="p-4 text-left font-medium">Source</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-left font-medium">Created</th>
                    <th className="p-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeads.map((lead) => (
                    <tr key={lead.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{lead.name}</td>
                      <td className="p-4 text-muted-foreground truncate max-w-[180px]">{lead.email}</td>
                      <td className="p-4 text-muted-foreground">{lead.phone || "—"}</td>
                      <td className="p-4">{lead.project_type || "—"}</td>
                      <td className="p-4">{lead.budget || "—"}</td>
                      <td className="p-4">{lead.timeline || "—"}</td>
                      <td className="p-4">
                        <Badge variant="secondary" className="text-xs">
                          {lead.source}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          className={
                            lead.status === "new"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40"
                              : lead.status === "contacted"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40"
                              : lead.status === "qualified"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40"
                              : lead.status === "proposal"
                              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40"
                              : lead.status === "closed-won"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/40"
                              : "bg-red-100 text-red-800 dark:bg-red-900/40"
                          }
                        >
                          {lead.status.replace("-", " ").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {format(new Date(lead.created_at), "dd MMM yyyy")}
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedLead(lead)}>
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Lead Details: {lead.name}</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-medium">Email</Label>
                                  <p className="text-sm break-all">{lead.email}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Phone</Label>
                                  <p className="text-sm">{lead.phone || "Not provided"}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Project Type</Label>
                                  <p className="text-sm">{lead.project_type || "Not specified"}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Budget Range</Label>
                                  <p className="text-sm">{lead.budget || "Not specified"}</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-medium">Timeline</Label>
                                  <p className="text-sm">{lead.timeline || "Not specified"}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Source</Label>
                                  <p className="text-sm">{lead.source}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Created</Label>
                                  <p className="text-sm">{format(new Date(lead.created_at), "dd MMM yyyy, hh:mm a")}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <p className="text-sm font-semibold">
                                    {lead.status.replace("-", " ").toUpperCase()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="border-t pt-4">
                              <Label className="text-sm font-medium">Message</Label>
                              <p className="text-sm mt-1 whitespace-pre-wrap">{lead.message}</p>
                            </div>
                            {lead.notes && (
                              <div className="border-t pt-4">
                                <Label className="text-sm font-medium">Internal Notes</Label>
                                <p className="text-sm mt-1 whitespace-pre-wrap text-muted-foreground">
                                  {lead.notes}
                                </p>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Select
                          value={lead.status}
                          onValueChange={(value) => updateLeadStatus(lead.id, value as Lead["status"])}
                          disabled={statusUpdateLoading}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PIPELINE_STAGES.map((stage) => (
                              <SelectItem key={stage.id} value={stage.id}>
                                {stage.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedLead(lead)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add / View Notes – {lead.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <Textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add internal note, follow-up details, or comments..."
                                rows={5}
                              />
                              {lead.notes && (
                                <div className="border rounded-md p-3 bg-muted/30 text-sm whitespace-pre-wrap">
                                  {lead.notes}
                                </div>
                              )}
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setNewNote("")}>
                                Clear
                              </Button>
                              <Button onClick={addNote} disabled={!newNote.trim()}>
                                Add Note
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages} ({totalItems} total leads)
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* ─────────────────────────────────────────────
           Pipeline / Kanban View (Drag & Drop ready structure)
           ───────────────────────────────────────────── */
        <div className="flex gap-6 overflow-x-auto pb-8">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage.id)
            return (
              <div key={stage.id} className="flex min-w-[340px] flex-col gap-4 bg-muted/20 rounded-lg p-4">
                <div className={`rounded-lg p-4 ${stage.color}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold capitalize text-base">{stage.label}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {stageLeads.length}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-h-[400px]">
                  {stageLeads.map((lead) => (
                    <Card key={lead.id} className="shadow-sm hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <p className="font-medium text-base">{lead.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{lead.email}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {lead.source}
                          </Badge>
                          {lead.project_type && (
                            <Badge variant="secondary" className="text-xs">
                              {lead.project_type}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground">
                          {format(new Date(lead.created_at), "dd MMM yyyy, hh:mm a")}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="flex-1 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground flex items-center justify-center">
                      Drag leads here or no leads in this stage
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}