import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { getSession } from "@/lib/session"
import { getAllDisputes, updateDispute } from "@/app/actions/disputes"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/status-badge"

export const dynamic = "force-dynamic"

export default async function DisputesPage() {
  const user = await getSession()
  const disputes = await getAllDisputes()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="mb-6">
          <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4">
            <ArrowLeft className="size-4" />
            Dashboard
          </a>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Disputes
          </h1>
        </div>

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

                {d.status === "open" && (
                  <form action={updateDisputeForm} className="mt-4 space-y-3">
                    <input type="hidden" name="disputeId" value={d.id} />
                    <div>
                      <Label htmlFor={`resolution-${d.id}`}>Resolution note</Label>
                      <Textarea
                        id={`resolution-${d.id}`}
                        name="resolution"
                        rows={3}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        name="status"
                        value="investigating"
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Investigate
                      </button>
                      <button
                        type="submit"
                        name="status"
                        value="resolved"
                        className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-1 text-sm font-medium hover:bg-muted"
                      >
                        Resolve
                      </button>
                    </div>
                  </form>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <AlertCircle className="size-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">No disputes to review.</p>
          </Card>
        )}
      </main>
    </div>
  )
}

async function updateDisputeForm(formData: FormData) {
  "use server"
  const disputeId = Number(formData.get("disputeId"))
  const status = formData.get("status") as "investigating" | "resolved"
  const resolution = formData.get("resolution") as string
  await updateDispute(disputeId, status, resolution)
}