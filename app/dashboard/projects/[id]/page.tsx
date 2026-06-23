import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getSession } from "@/lib/session"
import { getMyProjects } from "@/app/actions/projects"
import { getProjectById, getProjectMilestones } from "@/lib/queries"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/roles"
import { StatusBadge } from "@/components/status-badge"
import { submitMilestoneEvidence } from "@/app/actions/milestones"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export const dynamic = "force-dynamic"

export default async function ProjectManagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const projectId = Number(id)
  const user = await getSession()

  if (!user) {
    return (
      <div className="flex min-h-svh flex-col bg-background">
        <SiteHeader user={user} />
        <main className="mx-auto w-full max-w-6xl px-4 py-16">
          <p className="text-muted-foreground">
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>{" "}
            to manage projects.
          </p>
        </main>
      </div>
    )
  }

  const [project, milestones] = await Promise.all([
    getProjectById(projectId),
    getProjectMilestones(projectId),
  ])

  if (!project || project.ownerId !== user.id) {
    return (
      <div className="flex min-h-svh flex-col bg-background">
        <SiteHeader user={user} />
        <main className="mx-auto w-full max-w-6xl px-4 py-16">
          <p className="text-muted-foreground">Project not found or access denied.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="mb-6">
          <a href="/dashboard/projects" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4">
            <ArrowLeft className="size-4" />
            My projects
          </a>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {project.title}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={project.status} />
            <span className="text-sm text-muted-foreground">
              {formatCurrency(project.fundedAmount)} raised
            </span>
          </div>
        </div>

        <div className="grid gap-6">
          <h2 className="text-lg font-semibold text-foreground">Milestones</h2>
          {milestones.length ? (
            <div className="space-y-4">
              {milestones.map((m) => (
                <Card key={m.id} className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{m.title}</p>
                      <p className="text-sm text-muted-foreground">{m.description}</p>
                      <p className="mt-1 text-sm font-medium text-primary">
                        {formatCurrency(m.amount)}
                      </p>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>

                  {m.status === "pending" && (
                    <form action={submitEvidenceForm} className="mt-4 space-y-3">
                      <input type="hidden" name="milestoneId" value={m.id} />
                      <div>
                        <Label htmlFor={`evidenceNote-${m.id}`}>Evidence note</Label>
                        <Textarea
                          id={`evidenceNote-${m.id}`}
                          name="evidenceNote"
                          rows={3}
                          placeholder="Describe what was accomplished, provide photo/video links"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`evidenceUrls-${m.id}`}>Evidence URLs</Label>
                        <Textarea
                          id={`evidenceUrls-${m.id}`}
                          name="evidenceUrls"
                          placeholder="https://drive.google.com/..."
                        />
                      </div>
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Submit for verification
                      </button>
                    </form>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6">
              <p className="text-muted-foreground">No milestones defined.</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

async function submitEvidenceForm(formData: FormData) {
  "use server"
  const milestoneId = Number(formData.get("milestoneId"))
  const evidenceNote = formData.get("evidenceNote") as string
  const evidenceUrls = formData.get("evidenceUrls") as string
  await submitMilestoneEvidence(milestoneId, evidenceNote, evidenceUrls)
}