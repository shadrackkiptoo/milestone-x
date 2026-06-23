import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getSession } from "@/lib/session"
import { createProject } from "@/app/actions/projects"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"

export const dynamic = "force-dynamic"

export default async function NewProjectPage() {
  const user = await getSession()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="mb-4">
          <a href="/dashboard/projects" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="size-4" />
            My projects
          </a>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
          Submit a new project
        </h1>
        <p className="text-muted-foreground mb-8">
          Describe your project, set milestones, and request funding.
        </p>

        <form action={createProject} className="space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <Label htmlFor="title">Project title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="e.g., Clean Water Initiative"
              />
            </div>

            <div>
              <Label htmlFor="summary">Summary</Label>
              <Input
                id="summary"
                name="summary"
                required
                placeholder="One sentence describing the project impact"
              />
            </div>

            <div>
              <Label htmlFor="description">Full description</Label>
              <Textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Describe goals, timeline, budget, and expected outcomes"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue="community">
                  <option value="community">Community Development</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="environment">Environment</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Nairobi, Kenya"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label>Milestones</Label>
              <MilestoneInputs />
            </div>
          </Card>

          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Submit for review
          </button>
        </form>
      </main>
    </div>
  )
}

function MilestoneInputs() {
  return (
    <div className="mt-2 space-y-3" id="milestones">
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-3">
          <Input
            name={`milestones[${i}].title`}
            placeholder={`Milestone ${i + 1} title`}
          />
          <Input
            name={`milestones[${i}].amount`}
            type="number"
            placeholder="Amount (USD)"
          />
          <Input
            name={`milestones[${i}].description`}
            placeholder="Description"
          />
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        Leave blank any milestones you don't need.
      </p>
    </div>
  )
}