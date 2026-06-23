import Link from "next/link"
import { Lock, Banknote, TrendingUp, CheckCircle2 } from "lucide-react"
import { getSession } from "@/lib/session"
import {
  getPlatformStats,
  getPublicProjects,
  getRecentActivity,
} from "@/lib/queries"
import { formatCurrency } from "@/lib/roles"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { FundingProgress } from "@/components/funding-progress"
import { StatusBadge } from "@/components/status-badge"

export const dynamic = "force-dynamic"

export default async function TransparencyPage() {
  const [user, stats, projects, activity] = await Promise.all([
    getSession(),
    getPlatformStats(),
    getPublicProjects(),
    getRecentActivity(12),
  ])

  const cards = [
    {
      icon: TrendingUp,
      label: "Total raised",
      value: formatCurrency(stats.totalRaised),
    },
    {
      icon: Lock,
      label: "Held in escrow",
      value: formatCurrency(stats.totalEscrow),
    },
    {
      icon: Banknote,
      label: "Released to projects",
      value: formatCurrency(stats.totalReleased),
    },
    {
      icon: CheckCircle2,
      label: "Milestones verified",
      value: `${stats.verifiedMilestones} / ${stats.totalMilestones}`,
    },
  ]

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Transparency dashboard
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Every dollar is accounted for. Track funds across projects, escrow
            balances, and milestone-based releases in real time.
          </p>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.label} className="flex flex-col gap-3 p-6">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <c.icon className="size-5" />
              </span>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  {c.value}
                </p>
                <p className="text-sm text-muted-foreground">{c.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Project fund breakdown */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Fund accountability by project
            </h2>
            <div className="flex flex-col gap-4">
              {projects.length === 0 && (
                <Card className="p-8 text-center text-muted-foreground">
                  No public projects yet.
                </Card>
              )}
              {projects.map((p) => (
                <Card key={p.id} className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <Link
                      href={`/projects/${p.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {p.title}
                    </Link>
                    <StatusBadge status={p.status} />
                  </div>
                  <FundingProgress
                    funded={p.fundedAmount}
                    goal={p.fundingGoal}
                  />
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Escrow:{" "}
                      <span className="font-medium text-foreground">
                        {formatCurrency(p.escrowBalance)}
                      </span>
                    </span>
                    <span>
                      Released:{" "}
                      <span className="font-medium text-foreground">
                        {formatCurrency(p.releasedAmount)}
                      </span>
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Recent activity
            </h2>
            <Card className="p-2">
              {activity.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">
                  No activity recorded yet.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {activity.map((t) => (
                    <li key={t.id} className="flex flex-col gap-0.5 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium capitalize text-foreground">
                          {t.type.replace("_", " ")}
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            t.type === "release"
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {formatCurrency(t.amount)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {t.note ?? ""} •{" "}
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
