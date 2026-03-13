"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { AnimatedCounter } from "@/components/animated-counter"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { formatCurrency, getRelativeTime } from "@/lib/mock-api"
import { useAdminClients, useAdminProjects, useAdminInvoices, useAdminLeads } from "@/hooks/use-data"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

import {
  DollarSign,
  FolderKanban,
  Target,
  Headphones,
  TrendingUp,
  TrendingDown
} from "lucide-react"

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)"
]

export default function DashboardPage() {

  const { company } = useAuth()

  const { data: clients = [], isLoading: clientsLoading } = useAdminClients()
  const { data: projects = [], isLoading: projectsLoading } = useAdminProjects()
  const { data: invoices = [], isLoading: invoicesLoading } = useAdminInvoices()
  const { data: leads = [], isLoading: leadsLoading } = useAdminLeads()

  const loading =
    clientsLoading ||
    projectsLoading ||
    invoicesLoading ||
    leadsLoading

  /* ---------------- KPI CALCULATIONS ---------------- */

  const totalRevenue = invoices
    .filter((i:any) => i.status === "paid")
    .reduce((acc:number,i:any) => acc + (i.total || 0),0)

  const activeProjects =
    projects.filter((p:any)=>p.status==="in-progress").length

  const newLeads =
    leads.filter((l:any)=>l.status==="new"||l.status==="contacted").length

  const openTickets = 0

  /* ---------------- REVENUE CHART ---------------- */

  const revenueData = invoices.reduce((acc:any[],invoice:any)=>{

    if(!invoice.created_at) return acc

    const month = new Date(invoice.created_at)
      .toLocaleString("default",{month:"short"})

    const existing = acc.find((m)=>m.month===month)

    if(existing){
      existing.revenue += invoice.total || 0
    } else {
      acc.push({
        month,
        revenue:invoice.total || 0
      })
    }

    return acc

  },[])

  /* ---------------- CLIENT GROWTH ---------------- */

  const clientGrowthData = clients.reduce((acc:any[],client:any)=>{

    if(!client.created_at) return acc

    const month = new Date(client.created_at)
      .toLocaleString("default",{month:"short"})

    const existing = acc.find((m)=>m.month===month)

    if(existing){
      existing.new += 1
    } else {
      acc.push({
        month,
        new:1,
        returning:0
      })
    }

    return acc

  },[])

  /* ---------------- PROJECT STATUS PIE ---------------- */

  const projectStatusData = [
    {name:"Planning",value:projects.filter((p:any)=>p.status==="planning").length},
    {name:"In Progress",value:projects.filter((p:any)=>p.status==="in-progress").length},
    {name:"Completed",value:projects.filter((p:any)=>p.status==="completed").length},
  ].filter((d)=>d.value>0)

  /* ---------------- LEAD FUNNEL ---------------- */

  const leadFunnel = [
    {stage:"Leads",value:leads.length},
    {stage:"Contacted",value:leads.filter((l:any)=>l.status==="contacted").length},
    {stage:"Proposal",value:leads.filter((l:any)=>l.status==="proposal").length},
    {stage:"Closed",value:leads.filter((l:any)=>l.status==="won").length}
  ]

  /* ---------------- ACTIVITY ---------------- */

  const activities = [

    ...clients.map((c:any)=>({
      type:"client",
      name:c.name,
      created_at:c.created_at
    })),

    ...projects.map((p:any)=>({
      type:"project",
      name:p.name,
      created_at:p.created_at
    })),

    ...invoices.map((i:any)=>({
      type:"invoice",
      name:i.number,
      created_at:i.created_at
    }))

  ].sort((a,b)=>
    new Date(b.created_at).getTime() -
    new Date(a.created_at).getTime()
  )

  /* ---------------- KPI CARDS ---------------- */

  const kpis = [

    {
      title:"Total Revenue",
      value:totalRevenue,
      prefix:"$",
      icon:DollarSign,
      trend:"+12%",
      up:true,
      color:"from-blue-600 to-blue-400"
    },

    {
      title:"Active Projects",
      value:activeProjects,
      icon:FolderKanban,
      trend:"+3",
      up:true,
      color:"from-emerald-600 to-emerald-400"
    },

    {
      title:"New Leads",
      value:newLeads,
      icon:Target,
      trend:"+8",
      up:true,
      color:"from-amber-600 to-amber-400"
    },

    {
      title:"Open Tickets",
      value:openTickets,
      icon:Headphones,
      trend:"0",
      up:false,
      color:"from-rose-600 to-rose-400"
    }

  ]

  /* ---------------- LOADING ---------------- */

  if(loading){
    return(
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64"/>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({length:4}).map((_,i)=>(
            <Skeleton key={i} className="h-32 rounded-xl"/>
          ))}
        </div>
      </div>
    )
  }

  /* ---------------- UI ---------------- */

  return(

    <div className="flex flex-col gap-6">

      <PageHeader
        title="Dashboard"
        description={`Welcome back! Here is your ${company.name} overview.`}
        breadcrumbs={[{label:"Dashboard"}]}
      />

      {/* KPI CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {kpis.map((kpi)=>(
          <Card key={kpi.title} className="relative overflow-hidden border-0 shadow-sm">

            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-[0.06]`} />

            <CardContent className="relative p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-muted-foreground">
                    {kpi.title}
                  </p>

                  <p className="text-2xl font-bold">
                    <AnimatedCounter end={kpi.value} prefix={kpi.prefix}/>
                  </p>

                </div>

                <div className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.color} text-white`}>
                  <kpi.icon className="size-6"/>
                </div>

              </div>

              <div className="mt-2 flex items-center gap-1 text-xs">

                {kpi.up
                  ? <TrendingUp className="size-3 text-green-600"/>
                  : <TrendingDown className="size-3 text-red-600"/>
                }

                <span className="font-medium">
                  {kpi.trend}
                </span>

                <span className="text-muted-foreground">
                  vs last month
                </span>

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

              <CartesianGrid strokeDasharray="3 3"/>

              <XAxis dataKey="month"/>

              <YAxis tickFormatter={(v)=>`$${v/1000}k`}/>

              <Tooltip
                formatter={(v:number)=>[formatCurrency(v),"Revenue"]}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
              />

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

            <BarChart data={clientGrowthData}>

              <CartesianGrid strokeDasharray="3 3"/>

              <XAxis dataKey="month"/>

              <YAxis/>

              <Tooltip/>

              <Legend/>

              <Bar dataKey="new" fill="var(--color-chart-1)" name="New Clients"/>

              <Bar dataKey="returning" fill="var(--color-chart-2)" name="Returning"/>

            </BarChart>

          </ResponsiveContainer>

        </CardContent>

      </Card>

      {/* ACTIVITY */}

      <Card>

        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>

        <CardContent>

          <div className="flex flex-col gap-4">

            {activities.slice(0,6).map((a,i)=>(

              <div key={i} className="flex items-start gap-3">

                <Avatar className="size-8">
                  <AvatarFallback>
                    {a.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>

                <div>

                  <p className="text-sm">

                    <span className="font-medium">
                      {a.name}
                    </span>{" "}

                    {a.type==="client" && "client created"}
                    {a.type==="project" && "project created"}
                    {a.type==="invoice" && "invoice generated"}

                  </p>

                  <span className="text-xs text-muted-foreground">
                    {getRelativeTime(a.created_at)}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </CardContent>

      </Card>

    </div>

  )
}
