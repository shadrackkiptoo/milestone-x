import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { getSession } from "@/lib/session"
import { getAllDisputes, updateDispute } from "@/app/actions/disputes"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Disputes
          </h1>
        </div>

        {disputes.length > 0 ? (
          <div className="grid gap-4">
            {disputes.map((d) => (
              <Card key={d.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{d.subject}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {d.details}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Raised by: {d.raisedByName} •{" "}
                      {new Date(d.createdAt).toLocaleDateString()}
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
                      <Button
                        type="submit"
                        name="status"
                        value="investigating"
                        size="sm"
                      >
                        Investigate
                      </Button>
                      <Button
                        type="submit"
                        name="status"
                        value="resolved"
                        size="sm"
                        variant="outline"
                      >
                        Resolve
                      </Button>
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