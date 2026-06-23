import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { getSession } from "@/lib/session"
import { getVerificationQueue } from "@/app/actions/milestones"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/roles"
import { StatusBadge } from "@/components/status-badge"

export const dynamic = "force-dynamic"

export default async function VerifierDashboard() {
  const user = await getSession()
  const queue = await getVerificationQueue()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="mb-6">
          <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4">
            <ArrowLeft className="size-4" />
            Dashboard
          </a>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Verification queue
          </h1>
          <p className="mt-1 text-muted-foreground">
            Milestone submissions awaiting community verification.
          </p>
        </div>

        {queue.length > 0 ? (
          <div className="grid gap-4">
            {queue.map((m) => (
              <Card key={m.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <a
                      href={`/projects/${m.projectId}`}
                      className="font-medium text-muted-foreground hover:underline"
                    >
                      {m.projectTitle}
                    </a>
                    <p className="font-semibold text-lg text-foreground mt-1">
                      {m.title}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                      {m.evidenceNote || m.description}
                    </p>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
                <div className="mt-4">
                  <a
                    href={`/dashboard/verify/${m.id}`}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Review
                  </a>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <CheckCircle2 className="size-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">No milestones pending verification.</p>
          </Card>
        )}
      </main>
    </div>
  )
}