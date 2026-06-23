import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { formatCurrency } from "@/lib/roles"

type Milestone = {
  id: number
  title: string
  description: string
  amount: number
  status: string
  orderIndex: number
}

function StepIcon({ status }: { status: string }) {
  if (status === "released" || status === "approved")
    return <CheckCircle2 className="size-5 text-primary" />
  if (status === "rejected")
    return <XCircle className="size-5 text-destructive" />
  if (status === "submitted" || status === "verifying")
    return <Clock className="size-5 text-accent-foreground" />
  return <Circle className="size-5 text-muted-foreground" />
}

export function MilestoneTimeline({
  milestones,
}: {
  milestones: Milestone[]
}) {
  if (milestones.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No milestones defined for this project.
      </p>
    )
  }

  return (
    <ol className="flex flex-col">
      {milestones.map((m, i) => (
        <li key={m.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <StepIcon status={m.status} />
            {i < milestones.length - 1 && (
              <span className="my-1 w-px flex-1 bg-border" aria-hidden />
            )}
          </div>
          <div className="flex-1 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-medium text-foreground">
                {m.title}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(m.amount)}
                </span>
                <StatusBadge status={m.status} />
              </div>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {m.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
