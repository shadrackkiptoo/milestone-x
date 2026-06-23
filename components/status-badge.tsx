import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  approved: "bg-primary/10 text-primary",
  funding: "bg-primary/10 text-primary",
  completed: "bg-primary text-primary-foreground",
  rejected: "bg-destructive/10 text-destructive",
  submitted: "bg-accent/30 text-accent-foreground",
  verifying: "bg-accent/30 text-accent-foreground",
  released: "bg-primary text-primary-foreground",
  open: "bg-destructive/10 text-destructive",
  investigating: "bg-accent/30 text-accent-foreground",
  resolved: "bg-primary/10 text-primary",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending review",
  approved: "Approved",
  funding: "Funding",
  completed: "Completed",
  rejected: "Rejected",
  submitted: "Awaiting verification",
  verifying: "Under review",
  released: "Funds released",
  open: "Open",
  investigating: "Investigating",
  resolved: "Resolved",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn("font-medium border-transparent", STATUS_STYLES[status])}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
