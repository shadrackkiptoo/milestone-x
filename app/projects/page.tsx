import { getSession } from "@/lib/session"
import { getPublicProjects } from "@/lib/queries"
import { SiteHeader } from "@/components/site-header"
import { ProjectCard } from "@/components/project-card"
import { Card } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  const [user, projects] = await Promise.all([
    getSession(),
    getPublicProjects(),
  ])

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Community projects
          </h1>
          <p className="mt-1 text-muted-foreground">
            Browse vetted projects and fund the milestones that matter.
          </p>
        </div>

        {projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center text-muted-foreground">
            No projects are live yet. Check back soon.
          </Card>
        )}
      </main>
    </div>
  )
}
