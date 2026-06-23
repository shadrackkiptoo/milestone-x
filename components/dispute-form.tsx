"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { raiseDispute } from "@/app/actions/disputes"
import { toast } from "sonner"

export function DisputeForm({
  projectId,
  isAuthed,
}: {
  projectId: number
  isAuthed: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [details, setDetails] = useState("")
  const [isPending, startTransition] = useTransition()

  function submit() {
    if (!isAuthed) {
      router.push("/sign-in")
      return
    }
    if (!subject.trim() || !details.trim()) {
      toast.error("Please complete all fields")
      return
    }
    startTransition(async () => {
      try {
        await raiseDispute(projectId, subject, details)
        toast.success("Complaint submitted to administrators")
        setOpen(false)
        setSubject("")
        setDetails("")
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Something went wrong")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-1 text-sm font-medium hover:bg-muted">
            Raise a concern
          </button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise a concern</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe what happened and what you've observed"
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={submit}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Submitting..." : "Submit complaint"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}