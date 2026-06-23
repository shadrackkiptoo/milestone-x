import { getSession } from "@/lib/session"
import { getMyDonations } from "@/app/actions/donations"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatCurrency } from "@/lib/roles"
import { Users, FileText, CheckCircle2, AlertCircle, FileSearch } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
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
            to access your dashboard.
          </p>
        </main>
      </div>
    )
  }

  const donations = await getMyDonations()

  const roleCards = [
    {
      role: "donor",
      label: "Support projects",
      href: "/dashboard/donations",
      icon: Users,
      desc: "Browse and fund community projects",
    },
    {
      role: "owner",
      label: "My projects",
      href: "/dashboard/projects",
      icon: FileText,
      desc: "Submit and manage your projects",
    },
    {
      role: "verifier",
      label: "Verify milestones",
      href: "/dashboard/verify",
      icon: CheckCircle2,
      desc: "Review and verify submitted evidence",
    },
    {
      role: "admin",
      label: "Admin panel",
      href: "/dashboard/admin",
      icon: AlertCircle,
      desc: "Approve projects, manage disputes",
    },
    {
      role: "auditor",
      label: "Auditor view",
      href: "/dashboard/auditor",
      icon: FileSearch,
      desc: "Review financial and audit reports",
    },
  ]

  const availableLinks = roleCards.filter(
    (c) => c.role === user.role || user.role === "admin",
  )

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Welcome back, {user.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Role:{" "}
            <Badge variant="secondary" className="capitalize">
              {user.role}
            </Badge>
          </p>
        </div>

        <div className="mb-8 grid gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            Your contributions
          </h2>
          {donations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {donations.slice(0, 6).map((d) => (
                <Card key={d.id} className="p-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">
                      {d.projectTitle}
                    </span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(d.amount)}
                    </span>
                  </div>
                  <div className="mt-1 flex gap-2 text-xs">
                    <Badge variant="outline" className="capitalize">
                      {d.kind}
                    </Badge>
                    <StatusBadge status={d.projectStatus} />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No contributions yet.</p>
              <a href="/projects" className="inline-block mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Browse projects
              </a>
            </Card>
          )}
        </div>

        <div className="grid gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            Quick actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableLinks.map((c) => (
              <a
                key={c.role}
                href={c.href}
                className="flex h-auto justify-start gap-3 rounded-lg border border-border p-4 hover:bg-muted"
              >
                <c.icon className="size-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}