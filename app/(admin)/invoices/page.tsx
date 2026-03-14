"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { DataTable, type Column } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { fetchInvoices, formatCurrency, formatDate } from "@/lib/mock-api"
import clientsData from "@/mock-data/clients.json"
import type { Invoice } from "@/lib/types"
import { Plus, Download, DollarSign, FileText, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const monthlyRevenue = [
  { month: "Sep", amount: 42000 }, { month: "Oct", amount: 55000 },
  { month: "Nov", amount: 48000 }, { month: "Dec", amount: 62000 },
  { month: "Jan", amount: 71000 }, { month: "Feb", amount: 85000 },
]

export default function InvoicesPage() {
  const { company } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [items, setItems] = useState([{ description: "", quantity: 1, rate: 0 }])
  const [taxRate, setTaxRate] = useState(9)
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    fetchInvoices(company.id).then((data) => { setInvoices(data); setLoading(false) })
  }, [company.id])

  const getClientName = (clientId: number) => clientsData.find((c) => c.id === clientId)?.name ?? "Unknown"

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax - discount

  const columns: Column<Invoice>[] = [
    { key: "invoiceNumber", label: "Invoice #", sortable: true, render: (row: Invoice) => <span className="font-mono font-medium text-foreground">{row.invoiceNumber}</span> },
    { key: "clientId", label: "Client", render: (row: Invoice) => <span className="text-foreground">{getClientName(row.clientId)}</span> },
    { key: "total", label: "Amount", sortable: true, render: (row: Invoice) => <span className="font-medium text-foreground">{formatCurrency(row.total)}</span> },
    { key: "status", label: "Status", render: (row: Invoice) => <StatusBadge status={row.status} /> },
    { key: "issueDate", label: "Issued", sortable: true, render: (row: Invoice) => <span className="text-muted-foreground">{formatDate(row.issueDate)}</span> },
    { key: "dueDate", label: "Due", sortable: true, render: (row: Invoice) => <span className="text-muted-foreground">{formatDate(row.dueDate)}</span> },
    {
      key: "actions", label: "",
      render: () => (
        <Button variant="ghost" size="sm" onClick={() => toast.info("Exporting PDF...")}>
          <Download className="size-4" />
        </Button>
      ),
    },
  ]

  const paidTotal = invoices.filter((i) => i.status === "paid").reduce((a, i) => a + i.total, 0)
  const pendingTotal = invoices.filter((i) => i.status === "pending").reduce((a, i) => a + i.total, 0)
  const overdueTotal = invoices.filter((i) => i.status === "overdue").reduce((a, i) => a + i.total, 0)
// 1️⃣ Create a Record type for Invoice
interface InvoiceRecord extends Invoice {
  [key: string]: unknown
}
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoice & Billing"
        description="Manage invoices and track payments."
        breadcrumbs={[{ label: "Invoices" }]}
        actions={
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 size-4" /> Create Invoice</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Invoice</DialogTitle>
                <DialogDescription>Generate a new invoice with line items.</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); toast.success("Invoice created"); setShowCreate(false) }} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2"><Label>Client</Label><Input placeholder="Select client" required /></div>
                  <div className="flex flex-col gap-2"><Label>Due Date</Label><Input type="date" required /></div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Line Items</Label>
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2">
                      <Input className="col-span-5" placeholder="Description" value={item.description} onChange={(e) => { const n = [...items]; n[idx].description = e.target.value; setItems(n) }} />
                      <Input className="col-span-2" type="number" placeholder="Qty" value={item.quantity} onChange={(e) => { const n = [...items]; n[idx].quantity = Number(e.target.value); setItems(n) }} />
                      <Input className="col-span-3" type="number" placeholder="Rate" value={item.rate} onChange={(e) => { const n = [...items]; n[idx].rate = Number(e.target.value); setItems(n) }} />
                      <div className="col-span-2 flex items-center text-sm font-medium text-foreground">{formatCurrency(item.quantity * item.rate)}</div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, { description: "", quantity: 1, rate: 0 }])}>
                    Add Item
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2"><Label>Tax Rate (%)</Label><Input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} /></div>
                  <div className="flex flex-col gap-2"><Label>Discount ($)</Label><Input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} /></div>
                </div>
                <div className="rounded-lg bg-muted p-4 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium text-foreground">{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between mt-1"><span className="text-muted-foreground">Tax ({taxRate}%)</span><span className="text-foreground">{formatCurrency(tax)}</span></div>
                  <div className="flex justify-between mt-1"><span className="text-muted-foreground">Discount</span><span className="text-foreground">-{formatCurrency(discount)}</span></div>
                  <div className="flex justify-between mt-2 border-t border-border pt-2"><span className="font-semibold text-foreground">Total</span><span className="text-lg font-bold text-foreground">{formatCurrency(total)}</span></div>
                </div>
                <Button type="submit">Create Invoice</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Paid", value: formatCurrency(paidTotal), icon: DollarSign, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Pending", value: formatCurrency(pendingTotal), icon: FileText, color: "text-amber-600 dark:text-amber-400" },
          { label: "Overdue", value: formatCurrency(overdueTotal), icon: AlertCircle, color: "text-red-600 dark:text-red-400" },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10"><s.icon className={`size-5 ${s.color}`} /></div>
              <div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-xl font-bold text-foreground">{s.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">


// 2️⃣ Use InvoiceRecord in DataTable
          <DataTable<InvoiceRecord>
            columns={columns}
            data={invoices as InvoiceRecord[]}
            loading={loading}
            searchKey="invoiceNumber"
            searchPlaceholder="Search invoices..."
            filterOptions={[
              {
                key: "status",
                label: "Status",
                options: [
                  { value: "paid", label: "Paid" },
                  { value: "pending", label: "Pending" },
                  { value: "overdue", label: "Overdue" },
                  { value: "draft", label: "Draft" },
                ],
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base">Revenue Summary</CardTitle><CardDescription>Monthly revenue breakdown</CardDescription></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", color: "var(--color-card-foreground)" }} />
              <Bar dataKey="amount" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
