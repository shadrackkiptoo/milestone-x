import Link from "next/link"
import { ArrowLeft, Bell } from "lucide-react"
import { getSession } from "@/lib/session"
import { getMyNotifications } from "@/app/actions/notifications"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
  const user = await getSession()
  const notifications = await getMyNotifications()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-4xl px-4 py-12">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Notifications
          </h1>
        </div>

        {notifications.length > 0 ? (
          <div className="flex flex-col divide-y divide-border">
            {notifications.map((n) => (
              <div key={n.id} className="flex gap-3 p-4">
                <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary flex-shrink-0">
                  <Bell className="size-4" />
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <span className="flex-shrink-0">
                    <span className="inline-block size-2 rounded-full bg-primary" />
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Bell className="size-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications yet.</p>
          </Card>
        )}
      </main>
    </div>
  )
}