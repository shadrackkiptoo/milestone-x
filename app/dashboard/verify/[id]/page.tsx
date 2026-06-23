import Link from "next/link"
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import { getSession } from "@/lib/session"
import { getProjectById, getProjectMilestones } from "@/lib/queries"
import { submitVerification } from "@/app/actions/milestones"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/roles"
import { StatusBadge } from "@/components/status-badge"

export const dynamic = "force-dynamic"

export default async function VerifyMilestonePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const milestoneId = Number(id)
  const user = await getSession()

  if (!user || !["verifier", "admin"].includes(user.role)) {
    return (
      <div className="flex min-h-svh flex-col bg-background">
        <SiteHeader user={user} />
        <main className="mx-auto w-full max-w-6xl px-4 py-16">
          <p className="text-muted-foreground">
            Access denied. Verifier or admin role required.
          </p>
        </main>
      </div>
    )
  }

  const { db } = await import("@/lib/db")
  const { milestones: ms } = await import("@/lib/db/schema")
  const { eq } = await import("drizzle-orm")

  const rows = await db.select().from(ms).where(eq(ms.id, milestoneId))
  const milestone = rows[0]
  if (!milestone) {
    return (
      <div className="flex min-h-svh flex-col bg-background">
        <SiteHeader user={user} />
        <main className="mx-auto w-full max-w-6xl px-4 py-16">
          <p className="text-muted-foreground">Milestone not found.</p>
        </main>
      </div>
    )
  }

  const project = await getProjectById(milestone.projectId)
  if (!project) {
    return (
      <div className="flex min-h-svh flex-col bg-background">
        <SiteHeader user={user} />
        <main className="mx-auto w-full max-w-6xl px-4 py-16">
          <p className="text-muted-foreground">Project not found.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="mb-6">
          <a href="/dashboard/verify" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4">
            <ArrowLeft className="size-4" />
            Verification queue
          </a>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
            Milestone verification
          </h1>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex justify-between">
            <div>
              <a
                href={`/projects/${project.id}`}
                className="font-medium text-foreground hover:underline"
              >
                {project.title}
              </a>
              <p className="font-semibold text-lg text-foreground mt-1">
                {milestone.title}
              </p>
            </div>
            <StatusBadge status={milestone.status} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {milestone.description}
          </p>
          <p className="mt-2 text-sm font-medium text-primary">
            {formatCurrency(milestone.amount)}
          </p>
        </Card>

        {milestone.evidenceNote && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">Evidence submitted</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {milestone.evidenceNote}
            </p>
            {milestone.evidenceUrls && (
              <p className="mt-2 text-xs text-muted-foreground">
                URLs: {milestone.evidenceUrls}
              </p>
            )}
          </Card>
        )}

        <form action={submitVerificationForm} className="space-y-4">
          <input type="hidden" name="milestoneId" value={milestoneId} />

          <div>
            <Label htmlFor="report">Verification report</Label>
            <Textarea
              id="report"
              name="report"
              required
              rows={4}
              placeholder="Describe your inspection findings, evidence observed, and recommendation."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              name="decision"
              value="approve"
              className="flex-1 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <CheckCircle2 className="size-4 mr-2" />
              Recommend approval
            </button>
            <button
              type="submit"
              name="decision"
              value="reject"
              className="flex-1 inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <XCircle className="size-4 mr-2" />
              Raise concerns
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

async function submitVerificationForm(formData: FormData) {
  "use server"
  const milestoneId = Number(formData.get("milestoneId"))
  const decision = formData.get("decision") as "approve" | "reject"
  const report = formData.get("report") as string

  await submitVerification(milestoneId, decision, report)
}