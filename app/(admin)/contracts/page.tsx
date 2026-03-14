"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { DataTable, type Column } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"
import { fetchContracts, formatCurrency, formatDate } from "@/lib/mock-api"
import clientsData from "@/mock-data/clients.json"
import type { Contract } from "@/lib/types"
import { Plus, ScrollText, FileCheck, FileClock, FileX, Download, Send } from "lucide-react"
import { toast } from "sonner"

const contractTemplates = [
  { id: "standard", name: "Standard Service Agreement" },
  { id: "enterprise", name: "Enterprise Agreement" },
  { id: "nda", name: "Non-Disclosure Agreement" },
  { id: "maintenance", name: "Maintenance & Support" },
]

export default function ContractsPage() {
  const { company } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    fetchContracts(company.id).then((data) => {
      setContracts(data)
      setLoading(false)
    })
  }, [company.id])

  const getClientName = (clientId: number) =>
    clientsData.find((c) => c.id === clientId)?.name ?? "Unknown"

  const columns: Column<Contract>[] = [
    {
      key: "title",
      label: "Contract",
      sortable: true,
      render: (row: Contract) => (
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <ScrollText className="size-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{row.title}</p>
            <p className="text-xs text-muted-foreground">{getClientName(row.clientId)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "value",
      label: "Value",
      sortable: true,
      render: (row: Contract) => (
        <span className="font-medium text-foreground">{formatCurrency(row.value)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: Contract) => <StatusBadge status={row.status} />,
    },
    {
      key: "signed",
      label: "Signed",
      render: (row: Contract) => (
        <Badge
          variant={row.signed ? "default" : "secondary"}
          className={`text-xs ${row.signed ? "bg-emerald-600" : ""}`}
        >
          {row.signed ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "startDate",
      label: "Period",
      render: (row: Contract) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.startDate)} - {formatDate(row.endDate)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row: Contract) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8">
            <Download className="size-4" />
          </Button>
          {!row.signed && (
            <Button variant="ghost" size="icon" className="size-8">
              <Send className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const activeCount = contracts.filter((c) => c.status === "active").length
  const pendingCount = contracts.filter((c) => c.status === "pending").length
  const expiredCount = contracts.filter((c) => c.status === "expired").length
  const totalValue = contracts.filter((c) => c.status === "active").reduce((a, c) => a + c.value, 0)
interface ContractRecord extends Contract {
  [key: string]: unknown
}

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Contracts"
        description="Manage client contracts and agreements."
        breadcrumbs={[{ label: "Contracts" }]}
        actions={
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" /> New Contract
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Create Contract</DialogTitle>
                <DialogDescription>Generate a new contract from a template.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  toast.success("Contract created")
                  setShowCreate(false)
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label>Title</Label>
                  <Input placeholder="Contract title" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Client</Label>
                  <Input placeholder="Select client" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Start Date</Label>
                    <Input type="date" required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>End Date</Label>
                    <Input type="date" required />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Contract Value ($)</Label>
                  <Input type="number" placeholder="0" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Template</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {contractTemplates.map((t) => (
                      <label
                        key={t.id}
                        className="flex items-center gap-2 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50"
                      >
                        <Checkbox />
                        <span className="text-sm text-foreground">{t.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Additional Terms</Label>
                  <Textarea placeholder="Any additional terms..." className="min-h-20" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Create Contract</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => toast.info("Sending for signature...")}
                  >
                    <Send className="mr-2 size-4" /> Send for Signature
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <FileCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
              <FileClock className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
              <FileX className="size-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expired</p>
              <p className="text-2xl font-bold text-foreground">{expiredCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <ScrollText className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Value</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <DataTable<ContractRecord>
            columns={columns}
            data={contracts as ContractRecord[]}
            loading={loading}
            searchKey="title"
            searchPlaceholder="Search contracts..."
            filterOptions={[
              {
                key: "status",
                label: "Status",
                options: [
                  { value: "active", label: "Active" },
                  { value: "pending", label: "Pending" },
                  { value: "expired", label: "Expired" },
                ],
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
