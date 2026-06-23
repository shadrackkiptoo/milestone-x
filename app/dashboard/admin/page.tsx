import Link from "next/link"
import { ArrowLeft, FileText, Users, AlertCircle } from "lucide-react"
import { getSession } from "@/lib/session"
import { getAllProjects } from "@/lib/queries"
import { getAllUsers } from "@/app/actions/admin"
import { getAllDisputes } from "@/app/actions/disputes"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/roles"
import { StatusBadge } from "@/components/status-badge"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const user = await getSession()
  const [projects, allUsers, disputes] = await Promise.all([
    getAllProjects(),
    getAllUsers(),
    getAllDisputes(),
  ])

  const pendingProjects = projects.filter((p) => p.status === "pending")
  const openDisputes = disputes.filter((d) => d.status === "open")

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Admin panel
            </h1>
          </div>
          <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4 inline" />
            Dashboard
          </a>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="size-4" />
              <span>Pending projects</span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {pendingProjects.length}
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="size-4" />
              <span>Open disputes</span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {openDisputes.length}
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-4" />
              <span>Total users</span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {allUsers.length}
            </p>
          </Card>
        </div>

        {/* Project approvals */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Project approvals
          </h2>
          {pendingProjects.length > 0 ? (
            <div className="grid gap-4">
              {pendingProjects.map((p) => (
                <Card key={p.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <a
                        href={`/dashboard/projects/${p.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {p.title}
                      </a>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {p.summary}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Goal: {formatCurrency(p.fundingGoal)}</span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6">
              <p className="text-muted-foreground">No pending projects.</p>
            </Card>
          )}
        </div>

        {/* Users */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            User management
          </h2>
          {allUsers.length > 0 ? (
            <Card className="p-2">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-left p-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="p-2 font-medium text-foreground">{u.name}</td>
                      <td className="p-2 text-muted-foreground">{u.email}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="capitalize">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-2 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : (
            <Card className="p-6">
              <p className="text-muted-foreground">No users found.</p>
            </Card>
          )}
        </div>

        {/* Disputes */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Disputes
          </h2>
          {disputes.length > 0 ? (
            <div className="grid gap-4">
              {disputes.map((d) => (
                <Card key={d.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{d.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {d.details}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Raised by: {d.raisedByName}
                      </p>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6">
              <p className="text-muted-foreground">No disputes recorded.</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}