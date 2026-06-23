import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, MapPin, Lock, Banknote, Receipt } from "lucide-react"
import { getSession } from "@/lib/session"
import {
  getProjectById,
  getProjectMilestones,
  getProjectDonations,
  getProjectTransactions,
} from "@/lib/queries"
import { getOwnerName } from "@/app/actions/projects"
import { formatCurrency } from "@/lib/roles"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { FundingProgress } from "@/components/funding-progress"
import { MilestoneTimeline } from "@/components/milestone-timeline"
import { DonateWidget } from "@/components/donate-widget"
import { DisputeForm } from "@/components/dispute-form"

export const dynamic = "force-dynamic"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const projectId = Number(id)
  if (Number.isNaN(projectId)) notFound()

  const project = await getProjectById(projectId)
  if (!project) notFound()

  const [user, milestones, donations, transactions, ownerName] =
    await Promise.all([
      getSession(),
      getProjectMilestones(projectId),
      getProjectDonations(projectId),
      getProjectTransactions(projectId),
      getOwnerName(project.ownerId),
    ])

  const canFund = ["approved", "funding"].includes(project.status)

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Link
          href="/projects"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to projects
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border">
              <Image
                src={project.imageUrl || "/hero-community.png"}
                alt={project.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
              <div className="absolute left-4 top-4">
                <StatusBadge status={project.status} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="capitalize">{project.category}</span>
                {project.location && (
                  <>
                    <span aria-hidden>•</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {project.location}
                    </span>
                  </>
                )}
              </div>
              <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground">
                {project.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                by {ownerName}
              </p>
            </div>

            <Card className="p-6">
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                About this project
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                {project.description}
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Milestones
              </h2>
              <MilestoneTimeline milestones={milestones} />
            </Card>

            {/* Transparency / audit trail */}
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Receipt className="size-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Audit trail
                </h2>
              </div>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No transactions recorded yet.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {transactions.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {t.note ?? t.type}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {t.type.replace("_", " ")} •{" "}
                          {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          t.type === "release"
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {t.type === "release" ? "-" : "+"}
                        {formatCurrency(t.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <Card className="p-6">
              <FundingProgress
                funded={project.fundedAmount}
                goal={project.fundingGoal}
                released={project.releasedAmount}
              />
              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm">
                <div className="flex flex-col gap-1">
                  <dt className="flex items-center gap-1 text-muted-foreground">
                    <Lock className="size-3.5" /> In escrow
                  </dt>
                  <dd className="font-semibold text-foreground">
                    {formatCurrency(project.escrowBalance)}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="flex items-center gap-1 text-muted-foreground">
                    <Banknote className="size-3.5" /> Released
                  </dt>
                  <dd className="font-semibold text-foreground">
                    {formatCurrency(project.releasedAmount)}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Contributors</dt>
                  <dd className="font-semibold text-foreground">
                    {donations.length}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Milestones</dt>
                  <dd className="font-semibold text-foreground">
                    {milestones.length}
                  </dd>
                </div>
              </dl>
            </Card>

            {canFund ? (
              <Card className="p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Support this project
                </h2>
                <DonateWidget projectId={project.id} isAuthed={!!user} />
              </Card>
            ) : (
              <Card className="p-6 text-sm text-muted-foreground">
                This project is not currently accepting contributions.
              </Card>
            )}

            <Card className="flex items-center justify-between gap-3 p-6">
              <div>
                <p className="text-sm font-medium text-foreground">
                  See something wrong?
                </p>
                <p className="text-xs text-muted-foreground">
                  Report it to administrators.
                </p>
              </div>
              <DisputeForm projectId={project.id} isAuthed={!!user} />
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
