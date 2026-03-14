"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { DataTable, type Column } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { fetchClients, fetchInvoices, fetchProjects, formatCurrency, formatDate } from "@/lib/mock-api"
import type { Client, Invoice, Project } from "@/lib/types"
import { Plus, Building2, DollarSign, FileText } from "lucide-react"
import { toast } from "sonner"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Add index signature to Client type for TS generic compatibility
interface ClientRecord extends Client {
  [key: string]: unknown
}

const paymentHistory = [
  { month: "Sep", amount: 12000 }, { month: "Oct", amount: 18000 },
  { month: "Nov", amount: 15000 }, { month: "Dec", amount: 22000 },
  { month: "Jan", amount: 28000 }, { month: "Feb", amount: 25000 },
]

export default function ClientsPage() {
  const { company } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Client | null>(null)

  useEffect(() => {
    Promise.all([
      fetchClients(company.id),
      fetchInvoices(company.id),
      fetchProjects(company.id),
    ]).then(([c, i, p]) => {
      setClients(c)
      setInvoices(i)
      setProjects(p)
      setLoading(false)
    })
  }, [company.id])

  const columns: Column<ClientRecord>[] = [
    {
      key: "name",
      label: "Client",
      sortable: true,
      render: (row) => (
        <button onClick={() => setSelected(row as Client)} className="flex items-center gap-3 hover:underline text-left">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
            {(row.name as string).charAt(0)}
          </div>
          <div>
            <p className="font-medium text-foreground">{row.name as string}</p>
            <p className="text-xs text-muted-foreground">{row.industry as string}</p>
          </div>
        </button>
      ),
    },
    { key: "email", label: "Email", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status as string} />,
    },
    {
      key: "totalRevenue",
      label: "Revenue",
      sortable: true,
      render: (row) => <span className="font-medium text-foreground">{formatCurrency(row.totalRevenue as number)}</span>,
    },
    {
      key: "joinDate",
      label: "Joined",
      sortable: true,
      render: (row) => <span className="text-muted-foreground">{formatDate(row.joinDate as string)}</span>,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <PageHeader
        title="Client Management"
        description="Manage your client relationships and profiles."
        breadcrumbs={[{ label: "Clients" }]}
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 size-4" /> Add Client</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>Add a new client to your account.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => { e.preventDefault(); toast.success("Client added") }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2"><Label>Company Name</Label><Input placeholder="Company name" required /></div>
                <div className="flex flex-col gap-2"><Label>Email</Label><Input type="email" placeholder="contact@company.com" required /></div>
                <div className="flex flex-col gap-2"><Label>Phone</Label><Input placeholder="+1-555-0000" /></div>
                <div className="flex flex-col gap-2"><Label>Industry</Label><Input placeholder="Technology" /></div>
                <Button type="submit">Add Client</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Clients", value: clients.length, icon: Building2 },
          { label: "Total Revenue", value: formatCurrency(clients.reduce((a, c) => a + c.totalRevenue, 0)), icon: DollarSign },
          { label: "Active Invoices", value: invoices.filter(i => i.status === "pending").length, icon: FileText },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <s.icon className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client Details or Table */}
      {selected ? (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-lg">{selected.name}</CardTitle>
                  <CardDescription>{selected.industry} &middot; {selected.email}</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>Back to list</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="projects">
              <TabsList>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="payments">Payment History</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              {/* Projects */}
              <TabsContent value="projects" className="mt-4">
                {projects.filter(p => p.clientId === selected.id).length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No projects yet for this client.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {projects.filter(p => p.clientId === selected.id).map(p => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div>
                          <p className="font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.description}</p>
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Invoices */}
              <TabsContent value="invoices" className="mt-4">
                {invoices.filter(i => i.clientId === selected.id).length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No invoices yet.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {invoices.filter(i => i.clientId === selected.id).map(inv => (
                      <div key={inv.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div>
                          <p className="font-medium text-foreground">{inv.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground">Due: {formatDate(inv.dueDate)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-foreground">{formatCurrency(inv.total)}</span>
                          <StatusBadge status={inv.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Payment History */}
              <TabsContent value="payments" className="mt-4">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={paymentHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} tickFormatter={v => `$${v / 1000}k`} />
                    <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", color: "var(--color-card-foreground)" }} />
                    <Area type="monotone" dataKey="amount" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>

              {/* Notes */}
              <TabsContent value="notes" className="mt-4">
                <Textarea placeholder="Add notes about this client..." className="min-h-32" />
                <Button className="mt-3" onClick={() => toast.success("Notes saved")}>Save Notes</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <DataTable<ClientRecord>
              columns={columns}
              data={clients as ClientRecord[]}
              loading={loading}
              searchKey="name"
              searchPlaceholder="Search clients..."
              filterOptions={[
                {
                  key: "status",
                  label: "Status",
                  options: [
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                    { value: "overdue", label: "Overdue" },
                  ],
                },
              ]}
              emptyMessage="No clients yet -- add one!"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}