import Link from "next/link"
import Image from "next/image"
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Users,
  FileSearch,
  Banknote,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getSession } from "@/lib/session"
import { getPlatformStats, getPublicProjects } from "@/lib/queries"
import { formatCurrency } from "@/lib/roles"
import { SiteHeader } from "@/components/site-header"
import { ProjectCard } from "@/components/project-card"

export default async function HomePage() {
  const [user, stats, projects] = await Promise.all([
    getSession(),
    getPlatformStats(),
    getPublicProjects(),
  ])

  const featured = projects.slice(0, 3)

  const steps = [
    {
      icon: FileSearch,
      title: "Projects are vetted",
      body: "Owners submit proposals with budgets and milestones. Administrators review and approve before they go live.",
    },
    {
      icon: Lock,
      title: "Funds held in escrow",
      body: "Every donation and investment is secured in an escrow account — never released until work is verified.",
    },
    {
      icon: Users,
      title: "Community verifies",
      body: "Independent community verifiers inspect progress on the ground and submit verification reports.",
    },
    {
      icon: Banknote,
      title: "Funds release per milestone",
      body: "Only approved milestones unlock their portion of funds. Failed milestones keep money secured.",
    },
  ]

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader user={user} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <ShieldCheck className="size-3.5" />
              Escrow-backed, milestone-verified funding
            </span>
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
              Fund community projects you can actually trust
            </h1>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
              Milestone X holds every contribution in escrow and releases it
              only when community verifiers confirm real progress. Full
              transparency, from donation to delivery.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/projects">
                  Browse projects
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-up">Start a project</Link>
              </Button>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border">
            <Image
              src="/hero-community.png"
              alt="A community collaborating on a local development project"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
          <Stat label="Active projects" value={String(stats.totalProjects)} />
          <Stat label="Total raised" value={formatCurrency(stats.totalRaised)} />
          <Stat
            label="Secured in escrow"
            value={formatCurrency(stats.totalEscrow)}
          />
          <Stat
            label="Milestones verified"
            value={`${stats.verifiedMilestones}/${stats.totalMilestones}`}
          />
        </div>
      </section>

      {/* Featured projects */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Featured projects
            </h2>
            <p className="mt-1 text-muted-foreground">
              Transparent funding for real community impact.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link href="/projects">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {featured.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center gap-3 p-12 text-center">
            <p className="text-muted-foreground">
              No live projects yet. Be the first to launch one.
            </p>
            <Button asChild>
              <Link href="/sign-up">Start a project</Link>
            </Button>
          </Card>
        )}
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-border bg-card py-16"
      >
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            How accountability works
          </h2>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Money moves in steps, not all at once. Each step is checked by the
            people the project serves.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Card key={s.title} className="flex flex-col gap-3 p-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <s.icon className="size-5" />
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <Card className="flex flex-col items-center gap-4 bg-primary p-10 text-center text-primary-foreground">
          <CheckCircle2 className="size-10" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            Build trust into every dollar
          </h2>
          <p className="max-w-xl text-primary-foreground/80">
            Whether you give, build, or verify — join a funding platform where
            accountability is the default.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/sign-up">Create your account</Link>
          </Button>
        </Card>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span>Milestone X — Transparent community funding</span>
          </div>
          <div className="flex gap-6">
            <Link href="/projects" className="hover:text-foreground">
              Projects
            </Link>
            <Link href="/transparency" className="hover:text-foreground">
              Transparency
            </Link>
            <Link href="/sign-in" className="hover:text-foreground">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 text-center md:text-left">
      <span className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
