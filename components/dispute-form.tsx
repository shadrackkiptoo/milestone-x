"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Raise a concern
        </Button>
      </DialogTrigger>
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
        <DialogFooter>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? "Submitting..." : "Submit complaint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
