"use client"

import { useState, useMemo } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from "lucide-react"

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
}

interface FilterOption {
  key: string
  label: string
  options: { value: string; label: string }[]
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  searchKey?: keyof T
  searchPlaceholder?: string
  pageSize?: number
  emptyMessage?: string
  filterOptions?: FilterOption[]
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  searchKey,
  searchPlaceholder = "Search...",
  pageSize = 10,
  emptyMessage = "No data found",
  filterOptions = [],
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [filters, setFilters] = useState<Record<string, string>>({})

  const filteredData = useMemo(() => {
    let result = [...data]

    // Search
    if (search && searchKey) {
      result = result.filter((row) =>
        String(row[searchKey] ?? "")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    }

    // Filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((row) => String(row[key]) === value)
      }
    })

    // Sorting
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey] ?? ""
        const bVal = b[sortKey] ?? ""
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
        return sortDir === "asc" ? cmp : -cmp
      })
    }

    return result
  }, [data, search, searchKey, filters, sortKey, sortDir])

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const pagedData = filteredData.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: keyof T) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc")
    else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {searchKey && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              className="pl-10 h-9"
            />
          </div>
        )}
        {filterOptions.map((filter) => (
          <Select
            key={filter.key}
            value={filters[filter.key] ?? "all"}
            onValueChange={(v) => { setFilters(prev => ({ ...prev, [filter.key]: v })); setPage(0) }}
          >
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((col) => (
                <TableHead key={col.key}>
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key as keyof T)}
                      className="flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors"
                    >
                      {col.label}
                      <ArrowUpDown className="size-3" />
                    </button>
                  ) : (
                    <span className="text-xs font-medium">{col.label}</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {pagedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              pagedData.map((row, i) => (
                <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                  {columns.map((col) => (
                    <TableCell key={col.key} className="text-sm">
                      {col.render ? col.render(row) : String(row[col.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {page * pageSize + 1}--{Math.min((page + 1) * pageSize, filteredData.length)} of {filteredData.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2">Page {page + 1} of {totalPages}</span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}