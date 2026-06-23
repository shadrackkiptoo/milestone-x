"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { contribute } from "@/app/actions/donations"
import { toast } from "sonner"

const PRESETS = [25, 50, 100, 250]

export function DonateWidget({
  projectId,
  isAuthed,
}: {
  projectId: number
  isAuthed: boolean
}) {
  const router = useRouter()
  const [amount, setAmount] = useState<number>(50)
  const [kind, setKind] = useState<"donation" | "investment">("donation")
  const [isPending, startTransition] = useTransition()

  function handleContribute() {
    if (!isAuthed) {
      router.push("/sign-in")
      return
    }
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount")
      return
    }
    startTransition(async () => {
      try {
        await contribute(projectId, amount, kind)
        toast.success("Contribution secured in escrow")
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Something went wrong")
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setKind("donation")}
          className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
            kind === "donation"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          Donate
        </button>
        <button
          type="button"
          onClick={() => setKind("investment")}
          className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
            kind === "investment"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          Invest
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setAmount(p)}
            className={`rounded-md border px-2 py-2 text-sm transition-colors ${
              amount === p
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            ${p}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="amount">Amount (USD)</Label>
        <Input
          id="amount"
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>

      <Button onClick={handleContribute} disabled={isPending} size="lg">
        {isPending
          ? "Processing..."
          : isAuthed
            ? `Contribute $${amount || 0}`
            : "Sign in to contribute"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Funds are held in escrow and released only as milestones are verified.
      </p>
    </div>
  )
}
