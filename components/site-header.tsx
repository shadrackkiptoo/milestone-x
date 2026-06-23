import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import type { SessionUser } from "@/lib/session"

export function SiteHeader({ user }: { user: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <span className="text-base font-semibold tracking-tight text-foreground">
            Milestone X
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a
            href="/projects"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Projects
          </a>
          <a
            href="/transparency"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Transparency
          </a>
          <a
            href="/#how-it-works"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Dashboard
            </a>
          ) : (
            <>
              <a
                href="/sign-in"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sign in
              </a>
              <a
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Get started
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
