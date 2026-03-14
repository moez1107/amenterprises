"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { DataTable, type Column } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { fetchUsers, formatDateTime } from "@/lib/mock-api"
import type { User, Role } from "@/lib/types"
import { Plus, Shield } from "lucide-react"
import { toast } from "sonner"

const permissions = ["Dashboard", "Users", "Clients", "Projects", "Invoices", "Leads", "Tickets", "Settings"]
const roles: Role[] = ["Admin", "Manager", "Dev", "Client"]

const permissionMatrix: Record<Role, string[]> = {
  Admin: permissions,
  Manager: ["Dashboard", "Clients", "Projects", "Invoices", "Leads", "Tickets"],
  Dev: ["Dashboard", "Projects", "Tickets"],
  Client: ["Dashboard", "Invoices", "Tickets"],
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchUsers().then((data) => { setUsers(data); setLoading(false) })
  }, [])
  // 1️⃣ Extend User type with index signature
  interface UserRecord extends User {
    [key: string]: unknown
  }


  const columns: Column<User>[] = [
    {
      key: "name", label: "User", sortable: true,
      render: (row: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{row.avatar}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role", label: "Role", sortable: true,
      render: (row: User) => <Badge variant="secondary" className="text-xs">{row.role}</Badge>,
    },
    {
      key: "status", label: "Status",
      render: (row: User) => <StatusBadge status={row.status} />,
    },
    {
      key: "lastLogin", label: "Last Login", sortable: true,
      render: (row: User) => <span className="text-muted-foreground">{formatDateTime(row.lastLogin)}</span>,
    },
    {
      key: "actions", label: "Active",
      render: (row: User) => (
        <Switch
          checked={row.status === "active"}
          onCheckedChange={() => toast.success(`User ${row.name} status toggled`)}
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users & Role Management"
        description="Manage user accounts and permissions."
        breadcrumbs={[{ label: "Users & Roles" }]}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 size-4" /> Add User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account with role-based access.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => { e.preventDefault(); toast.success("User created successfully"); setDialogOpen(false) }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label>Full Name</Label>
                  <Input placeholder="John Doe" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="john@example.com" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Role</Label>
                  <Select defaultValue="Dev">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder="Set password" required />
                </div>
                <Button type="submit" className="mt-2">Create User</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">

// 2️⃣ Use DataTable with UserRecord
          <DataTable<UserRecord>
            columns={columns}
            data={users as UserRecord[]}
            loading={loading}
            searchKey="name"
            searchPlaceholder="Search users..."
            filterOptions={[
              { key: "role", label: "Role", options: roles.map((r) => ({ value: r, label: r })) },
              {
                key: "status", label: "Status", options: [
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" }
                ]
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-4" /> Permission Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 text-left text-xs font-medium text-muted-foreground">Module</th>
                  {roles.map((role) => (
                    <th key={role} className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
                  <tr key={perm} className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">{perm}</td>
                    {roles.map((role) => (
                      <td key={role} className="px-4 py-3 text-center">
                        <Checkbox checked={permissionMatrix[role].includes(perm)} disabled />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
