"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { AnimatedCounter } from "@/components/animated-counter"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { useAuth } from "@/lib/auth-context"
import { formatCurrency, getRelativeTime } from "@/lib/mock-api"

import {
  useAdminClients,
  useAdminProjects,
  useAdminInvoices,
  useAdminLeads
} from "@/hooks/use-data"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

import {
  DollarSign,
  FolderKanban,
  Target,
  Headphones,
  TrendingUp,
  TrendingDown
} from "lucide-react"

import { useMemo } from "react"

/* --------------------- SAFE TYPES --------------------- */
type SafeClient = { id: string; name: string; createdAt?: string }
type SafeProject = { id: string; name: string; status?: string; createdAt?: string }
type SafeInvoice = { id: string; total?: number; status?: string; createdAt?: string }
type SafeLead = { id: string; status?: string }

type Activity = {
  type: "client" | "project" | "invoice"
  name: string
  createdAt?: string
}

/* -------------------- DASHBOARD PAGE -------------------- */
export default function DashboardPage() {

  const { company } = useAuth()

  // ✅ Cast unknown to proper types
  const { data: clientsRaw = [], isLoading: clientsLoading } = useAdminClients() as { data?: SafeClient[]; isLoading: boolean }
  const { data: projectsRaw = [], isLoading: projectsLoading } = useAdminProjects() as { data?: SafeProject[]; isLoading: boolean }
  const { data: invoicesRaw = [], isLoading: invoicesLoading } = useAdminInvoices() as { data?: SafeInvoice[]; isLoading: boolean }
  const { data: leadsRaw = [], isLoading: leadsLoading } = useAdminLeads() as { data?: SafeLead[]; isLoading: boolean }

  const loading = clientsLoading || projectsLoading || invoicesLoading || leadsLoading

  /* ---------------- MAP SAFE DATA ---------------- */
  const safeClients: SafeClient[] = clientsRaw.map(c => ({
    id: c.id,
    name: c.name,
    createdAt: c.createdAt || (c as any).created_at
  }))

  const safeProjects: SafeProject[] = projectsRaw.map(p => ({
    id: p.id,
    name: p.name,
    status: p.status,
    createdAt: p.createdAt || (p as any).created_at
  }))

  const safeInvoices: SafeInvoice[] = invoicesRaw.map(i => ({
    id: i.id,
    total: i.total,
    status: i.status,
    createdAt: i.createdAt || (i as any).created_at
  }))

  const safeLeads: SafeLead[] = leadsRaw.map(l => ({
    id: l.id,
    status: l.status
  }))

  /* ---------------- KPI ---------------- */
  const totalRevenue = safeInvoices.filter(i => i.status === "paid").reduce((acc, i) => acc + (i.total || 0), 0)
  const activeProjects = safeProjects.filter(p => p.status === "in-progress").length
  const newLeads = safeLeads.filter(l => l.status === "new" || l.status === "contacted").length
  const openTickets = 0

  /* ---------------- REVENUE CHART ---------------- */
  const revenueData = useMemo(() => {
    const map: Record<string, number> = {}
    safeInvoices.forEach(inv => {
      if (!inv.createdAt) return
      const month = new Date(inv.createdAt).toLocaleString("default", { month: "short" })
      map[month] = (map[month] || 0) + (inv.total || 0)
    })
    return Object.entries(map).map(([month, revenue]) => ({ month, revenue }))
  }, [safeInvoices])

  /* ---------------- CLIENT GROWTH ---------------- */
  const clientGrowth = useMemo(() => {
    const map: Record<string, number> = {}
    safeClients.forEach(client => {
      if (!client.createdAt) return
      const month = new Date(client.createdAt).toLocaleString("default", { month: "short" })
      map[month] = (map[month] || 0) + 1
    })
    return Object.entries(map).map(([month, value]) => ({ month, new: value }))
  }, [safeClients])

  /* ---------------- RECENT ACTIVITY ---------------- */
  const activities: Activity[] = [
    ...safeClients.map(c => ({ type: "client" as const, name: c.name, createdAt: c.createdAt })),
    ...safeProjects.map(p => ({ type: "project" as const, name: p.name, createdAt: p.createdAt })),
    ...safeInvoices.map(i => ({ type: "invoice" as const, name: `Invoice ${i.id}`, createdAt: i.createdAt })),
  ].sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())

  /* ---------------- KPI CARDS ---------------- */
  const kpis = [
    { title: "Total Revenue", value: totalRevenue, prefix: "$", icon: DollarSign, trend: "+12%", up: true, color: "from-blue-600 to-blue-400" },
    { title: "Active Projects", value: activeProjects, icon: FolderKanban, trend: "+3", up: true, color: "from-emerald-600 to-emerald-400" },
    { title: "New Leads", value: newLeads, icon: Target, trend: "+8", up: true, color: "from-amber-600 to-amber-400" },
    { title: "Open Tickets", value: openTickets, icon: Headphones, trend: "0", up: false, color: "from-rose-600 to-rose-400" }
  ]

  if (loading) return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-60" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">

      <PageHeader
        title="Dashboard"
        description={`Welcome back! Here is your ${company?.name || ""} overview.`}
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      {/* KPI CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(kpi => (
          <Card key={kpi.title} className="relative overflow-hidden border-0 shadow-sm">
            <div className={`absolute inset-0 bg-linear-to-br ${kpi.color} opacity-10`} />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold"><AnimatedCounter end={kpi.value} prefix={kpi.prefix} /></p>
                </div>
                <div className={`flex size-12 items-center justify-center rounded-xl bg-linear-to-br ${kpi.color} text-white`}>
                  <kpi.icon className="size-6" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs">
                {kpi.up ? <TrendingUp className="size-3 text-green-600" /> : <TrendingDown className="size-3 text-red-600" />}
                <span>{kpi.trend}</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* REVENUE CHART */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Paid invoices revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v: number) => [formatCurrency(v), "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-chart-1)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* CLIENT GROWTH */}
      <Card>
        <CardHeader>
          <CardTitle>Client Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clientGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="new" fill="var(--color-chart-1)" name="New Clients" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* RECENT ACTIVITY */}
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {activities.slice(0, 6).map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <Avatar className="size-8"><AvatarFallback>{a.name.charAt(0)}</AvatarFallback></Avatar>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{a.name}</span>{" "}
                    {a.type === "client" && "client created"}
                    {a.type === "project" && "project created"}
                    {a.type === "invoice" && "invoice generated"}
                  </p>
                  <span className="text-xs text-muted-foreground">{getRelativeTime(a.createdAt || "")}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}