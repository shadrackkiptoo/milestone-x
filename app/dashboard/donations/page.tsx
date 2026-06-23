import Link from "next/link"
import { ArrowLeft, Lock, Banknote, TrendingUp } from "lucide-react"
import { getSession } from "@/lib/session"
import { getMyDonations } from "@/app/actions/donations"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { formatCurrency } from "@/lib/roles"

export const dynamic = "force-dynamic"

export default async function DonorDashboard() {
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
            to view your contributions.
          </p>
        </main>
      </div>
    )
  }

  const donations = await getMyDonations()
  const totalGiven = donations.reduce((sum, d) => sum + d.amount, 0)
  const donationsCount = donations.filter((d) => d.kind === "donation").length
  const investmentsCount = donations.filter((d) => d.kind === "investment").length

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="mb-6">
          <div className="mb-4">
            <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft className="size-4" />
              Dashboard
            </a>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            My contributions
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track your donations and investments across community projects.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="size-4" />
              <span>Total contributed</span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatCurrency(totalGiven)}
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Banknote className="size-4" />
              <span>Donations</span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {donationsCount}
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="size-4" />
              <span>Currently in escrow</span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-primary">
              {formatCurrency(totalGiven)}
            </p>
          </Card>
        </div>

        {donations.length > 0 ? (
          <div className="grid gap-4">
            {donations.map((d) => (
              <Card key={d.id} className="p-4">
                <div className="flex items-center justify-between">
                  <a
                    href={`/projects/${d.projectId}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {d.projectTitle}
                  </a>
                  <span className="font-semibold text-primary">
                    {formatCurrency(d.amount)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <span className="capitalize text-muted-foreground">
                    {d.kind}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <StatusBadge status={d.projectStatus} />
                  <span className="text-muted-foreground">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't contributed to any projects yet.
            </p>
            <a href="/projects" className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Browse projects
            </a>
          </Card>
        )}
      </main>
    </div>
  )
}