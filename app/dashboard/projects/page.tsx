import Link from "next/link"
import { FileText, Plus } from "lucide-react"
import { getSession } from "@/lib/session"
import { getMyProjects } from "@/app/actions/projects"
import { getProjectMilestones } from "@/lib/queries"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/roles"
import { StatusBadge } from "@/components/status-badge"

export const dynamic = "force-dynamic"

export default async function OwnerDashboard() {
  const user = await getSession()
  if (!user) {
    return (
      <div className="flex min-h-svh flex-col bg-background">
        <SiteHeader user={null} />
        <main className="mx-auto w-full max-w-6xl px-4 py-16">
          <p className="text-muted-foreground">
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>{" "}
            to manage your projects.
          </p>
        </main>
      </div>
    )
  }

  const projects = await getMyProjects()
  const allMilestones = await Promise.all(
    projects.map((p) => getProjectMilestones(p.id)),
  )

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              My projects
            </h1>
            <p className="mt-1 text-muted-foreground">
              Submit new projects and track milestone progress.
            </p>
          </div>
          <a href="/dashboard/projects/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="size-4" />
            New project
          </a>
        </div>

        {projects.length > 0 ? (
          <div className="grid gap-6">
            {projects.map((project, i) => {
              const milestones = allMilestones[i] || []
              const completed = milestones.filter((m) =>
                ["approved", "released"].includes(m.status),
              ).length
              const total = milestones.length
              return (
                <Card key={project.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <a
                        href={`/projects/${project.id}`}
                        className="font-semibold text-lg text-foreground hover:underline"
                      >
                        {project.title}
                      </a>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {project.summary}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Raised:</span>
                      <span className="ml-1 font-medium text-foreground">
                        {formatCurrency(project.fundedAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Escrow:</span>
                      <span className="ml-1 font-medium text-primary">
                        {formatCurrency(project.escrowBalance)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Milestones:</span>
                      <span className="ml-1 font-medium text-foreground">
                        {completed}/{total} verified
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a
                      href={`/dashboard/projects/${project.id}`}
                      className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-1 text-sm font-medium hover:bg-muted"
                    >
                      Manage
                    </a>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <FileText className="size-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              You haven't submitted any projects yet.
            </p>
            <a
              href="/dashboard/projects/new"
              className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Submit your first project
            </a>
          </Card>
        )}
      </main>
    </div>
  )
}