"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { DataTable, type Column } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-context"
import { fetchTickets, formatDateTime, getRelativeTime } from "@/lib/mock-api"
import clientsData from "@/mock-data/clients.json"
import usersData from "@/mock-data/users.json"
import type { Ticket } from "@/lib/types"
import { Plus, MessageSquare, AlertCircle, CheckCircle2, Clock, Send } from "lucide-react"
import { toast } from "sonner"

export default function TicketsPage() {
  const { company, user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    fetchTickets(company.id).then((data) => {
      setTickets(data)
      setLoading(false)
    })
  }, [company.id])

  const getClientName = (clientId: number) =>
    clientsData.find((c) => c.id === clientId)?.name ?? "Unknown"
  const getAssigneeName = (assigneeId: number) =>
    usersData.find((u) => u.id === assigneeId)?.name ?? "Unassigned"

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800 dark:text-red-400"
      case "medium":
        return "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800 dark:text-amber-400"
      default:
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400"
    }
  }

  const columns: Column<Ticket>[] = [
    {
      key: "title",
      label: "Ticket",
      sortable: true,
      render: (row: Ticket) => (
        <button
          onClick={() => setSelectedTicket(row)}
          className="flex items-start gap-3 text-left hover:underline"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <MessageSquare className="size-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{row.title}</p>
            <p className="text-xs text-muted-foreground">
              {getClientName(row.clientId)} &middot; #{row.id}
            </p>
          </div>
        </button>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (row: Ticket) => (
        <Badge variant="outline" className={`text-xs capitalize ${getPriorityColor(row.priority)}`}>
          {row.priority}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: Ticket) => <StatusBadge status={row.status} />,
    },
    {
      key: "assigneeId",
      label: "Assignee",
      render: (row: Ticket) => {
        const assignee = usersData.find((u) => u.id === row.assigneeId)
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {assignee?.avatar ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground">{getAssigneeName(row.assigneeId)}</span>
          </div>
        )
      },
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (row: Ticket) => (
        <span className="text-muted-foreground">{getRelativeTime(row.createdAt)}</span>
      ),
    },
  ]

  const openCount = tickets.filter((t) => t.status === "open").length
  const inProgressCount = tickets.filter((t) => t.status === "in-progress").length
  const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length
  // 1️⃣ Extend Ticket type with index signature
  interface TicketRecord extends Ticket {
    [key: string]: unknown
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return
    toast.success("Message sent")
    setNewMessage("")
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Support Tickets"
        description="Manage customer support requests."
        breadcrumbs={[{ label: "Tickets" }]}
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" /> New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
                <DialogDescription>Open a new support request.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  toast.success("Ticket created")
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label>Subject</Label>
                  <Input placeholder="Brief description of the issue" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Client</Label>
                  <Input placeholder="Select client" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Priority</Label>
                  <Input placeholder="low / medium / high" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Detailed description..." className="min-h-24" />
                </div>
                <Button type="submit">Create Ticket</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
              <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-2xl font-bold text-foreground">{openCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold text-foreground">{resolvedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">

// 2️⃣ Use DataTable with TicketRecord
          <DataTable<TicketRecord>
            columns={columns}
            data={tickets as TicketRecord[]}
            loading={loading}
            searchKey="title"
            searchPlaceholder="Search tickets..."
            filterOptions={[
              {
                key: "status",
                label: "Status",
                options: [
                  { value: "open", label: "Open" },
                  { value: "in-progress", label: "In Progress" },
                  { value: "resolved", label: "Resolved" },
                  { value: "closed", label: "Closed" },
                ],
              },
              {
                key: "priority",
                label: "Priority",
                options: [
                  { value: "high", label: "High" },
                  { value: "medium", label: "Medium" },
                  { value: "low", label: "Low" },
                ],
              },
            ]}
          />
        </CardContent>
      </Card>

      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTicket.title}
                <Badge
                  variant="outline"
                  className={`text-xs capitalize ${getPriorityColor(selectedTicket.priority)}`}
                >
                  {selectedTicket.priority}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Ticket #{selectedTicket.id} &middot; {getClientName(selectedTicket.clientId)}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <StatusBadge status={selectedTicket.status} />
              <span className="text-xs text-muted-foreground">
                Assigned to {getAssigneeName(selectedTicket.assigneeId)}
              </span>
            </div>

            <ScrollArea className="h-64 pr-4">
              <div className="flex flex-col gap-4 py-4">
                {selectedTicket.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col gap-1 ${msg.sender === "Support" ? "items-end" : "items-start"
                      }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.sender === "Support"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                        }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {msg.sender} &middot; {formatDateTime(msg.time)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-4 border-t border-border">
              <Input
                placeholder="Type a reply..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>
                <Send className="size-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
