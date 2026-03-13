"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Trash2,
  Edit,
  Plus,
  CheckCircle,
  Clock,
  Archive
} from "lucide-react"

type FAQ = {
  id: string
  question: string
  answer: string
  category: string | null
  order_index: number
  active: boolean
  created_at: string
}

type Submission = {
  id: string
  name: string
  email: string
  question: string
  status: "new" | "in_progress" | "answered" | "archived"
  answer?: string
  answered_at?: string
  created_at: string
}

export default function AdminFAQsPage() {
  const supabase = createClient()

  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    category: "",
    order_index: 0,
    active: true,
  })
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [faqDialogOpen, setFaqDialogOpen] = useState(false)

  // Load FAQs & Submissions
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // FAQs
        const { data: faqData } = await supabase
          .from("faqs")
          .select("*")
          .order("order_index")

        setFaqs(faqData || [])

        // Submissions
        const { data: subData } = await supabase
          .from("faq_submissions")
          .select("*")
          .order("created_at", { ascending: false })

        setSubmissions(subData || [])
      } catch (err) {
        console.error(err)
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Add / Update FAQ
  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!faqForm.question || !faqForm.answer) {
      toast.error("Question and Answer are required")
      return
    }

    try {
      if (editingFaq) {
        // Update
        const { error } = await supabase
          .from("faqs")
          .update({
            question: faqForm.question,
            answer: faqForm.answer,
            category: faqForm.category || null,
            order_index: faqForm.order_index,
            active: faqForm.active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingFaq.id)

        if (error) throw error
        toast.success("FAQ updated")
      } else {
        // Insert
        const { error } = await supabase
          .from("faqs")
          .insert({
            question: faqForm.question,
            answer: faqForm.answer,
            category: faqForm.category || null,
            order_index: faqForm.order_index,
            active: faqForm.active,
          })

        if (error) throw error
        toast.success("FAQ added")
      }

      // Refresh
      const { data } = await supabase.from("faqs").select("*").order("order_index")
      setFaqs(data || [])

      // Reset form
      setFaqForm({ question: "", answer: "", category: "", order_index: 0, active: true })
      setEditingFaq(null)
      setFaqDialogOpen(false)
    } catch (err) {
      toast.error("Failed to save FAQ")
    }
  }

  // Delete FAQ
  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return

    try {
      const { error } = await supabase.from("faqs").delete().eq("id", id)
      if (error) throw error

      setFaqs(faqs.filter(f => f.id !== id))
      toast.success("FAQ deleted")
    } catch (err) {
      toast.error("Failed to delete FAQ")
    }
  }

  // Mark submission as answered
  const markAnswered = async (id: string, answerText: string) => {
    try {
      const { error } = await supabase
        .from("faq_submissions")
        .update({
          status: "answered",
          answer: answerText,
          answered_at: new Date().toISOString()
        })
        .eq("id", id)

      if (error) throw error

      setSubmissions(subs =>
        subs.map(s => s.id === id ? { ...s, status: "answered", answer: answerText, answered_at: new Date().toISOString() } : s)
      )
      toast.success("Marked as answered")
    } catch (err) {
      toast.error("Failed to update")
    }
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">FAQs Management</h1>
        <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFaq ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFaqSubmit} className="space-y-6">
              <div>
                <Label>Question</Label>
                <Input
                  value={faqForm.question}
                  onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="Enter question"
                  required
                />
              </div>

              <div>
                <Label>Answer</Label>
                <Textarea
                  value={faqForm.answer}
                  onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="Enter detailed answer"
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Input
                    value={faqForm.category}
                    onChange={e => setFaqForm({ ...faqForm, category: e.target.value })}
                    placeholder="e.g. Pricing, Services"
                  />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={faqForm.order_index}
                    onChange={e => setFaqForm({ ...faqForm, order_index: Number(e.target.value) })}
                    min={0}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={faqForm.active}
                  onCheckedChange={checked => setFaqForm({ ...faqForm, active: checked })}
                />
                <Label>Active (show on public site)</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFaqDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingFaq ? "Update FAQ" : "Add FAQ"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="faqs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="faqs">Public FAQs</TabsTrigger>
          <TabsTrigger value="submissions">Incoming Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="faqs">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map(faq => (
                  <TableRow key={faq.id}>
                    <TableCell>{faq.order_index}</TableCell>
                    <TableCell className="font-medium">{faq.question}</TableCell>
                    <TableCell>
                      {faq.category ? <Badge variant="outline">{faq.category}</Badge> : "-"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={faq.active}
                        onCheckedChange={async checked => {
                          await supabase.from("faqs").update({ active: checked }).eq("id", faq.id)
                          setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, active: checked } : f))
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingFaq(faq)
                          setFaqForm({
                            question: faq.question,
                            answer: faq.answer,
                            category: faq.category || "",
                            order_index: faq.order_index,
                            active: faq.active,
                          })
                          setFaqDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteFaq(faq.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="submissions">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell>{sub.name}</TableCell>
                    <TableCell>{sub.email}</TableCell>
                    <TableCell className="max-w-xs truncate">{sub.question}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sub.status === "answered" ? "success" :
                          sub.status === "new" ? "secondary" :
                          sub.status === "in_progress" ? "outline" : "destructive"
                        }
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {sub.status !== "answered" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const answer = prompt("Enter your answer:")
                            if (answer) markAnswered(sub.id, answer)
                          }}
                        >
                          Answer
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={async () => {
                          if (confirm("Delete this submission?")) {
                            await supabase.from("faq_submissions").delete().eq("id", sub.id)
                            setSubmissions(prev => prev.filter(s => s.id !== sub.id))
                            toast.success("Submission deleted")
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}