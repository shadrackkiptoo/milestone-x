import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/roles"

export function FundingProgress({
  funded,
  goal,
  released,
}: {
  funded: number
  goal: number
  released?: number
}) {
  const pct = goal > 0 ? Math.min(100, Math.round((funded / goal) * 100)) : 0

  return (
    <div className="flex flex-col gap-2">
      <Progress value={pct} className="h-2" />
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">
          {formatCurrency(funded)}
        </span>
        <span className="text-muted-foreground">
          of {formatCurrency(goal)} ({pct}%)
        </span>
      </div>
      {released !== undefined && (
        <p className="text-xs text-muted-foreground">
          {formatCurrency(released)} released from escrow
        </p>
      )}
    </div>
  )
}
