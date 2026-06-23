"use server"

import { db } from "@/lib/db"
import { disputes, projects } from "@/lib/db/schema"
import { requireRole, requireUser } from "@/lib/session"
import { notify } from "@/lib/notify"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function raiseDispute(
  projectId: number,
  subject: string,
  details: string,
) {
  const u = await requireUser()

  await db.insert(disputes).values({
    projectId,
    raisedById: u.id,
    raisedByName: u.name,
    subject,
    details,
    status: "open",
  })

  revalidatePath(`/projects/${projectId}`)
  revalidatePath("/dashboard/admin")
  revalidatePath("/dashboard/disputes")
}

export async function getAllDisputes() {
  await requireRole(["admin", "auditor"])
  return db
    .select({
      id: disputes.id,
      subject: disputes.subject,
      details: disputes.details,
      status: disputes.status,
      resolution: disputes.resolution,
      raisedByName: disputes.raisedByName,
      createdAt: disputes.createdAt,
      projectId: disputes.projectId,
      projectTitle: projects.title,
    })
    .from(disputes)
    .innerJoin(projects, eq(projects.id, disputes.projectId))
    .orderBy(desc(disputes.createdAt))
}

export async function updateDispute(
  disputeId: number,
  status: "investigating" | "resolved",
  resolution: string,
) {
  await requireRole(["admin"])

  const [d] = await db
    .update(disputes)
    .set({ status, resolution, updatedAt: new Date() })
    .where(eq(disputes.id, disputeId))
    .returning()

  if (d) {
    await notify({
      userId: d.raisedById,
      title:
        status === "resolved"
          ? "Dispute resolved"
          : "Dispute under investigation",
      body: `Your complaint "${d.subject}" is now ${status}.`,
      type: "dispute",
    })
  }

  revalidatePath("/dashboard/admin")
  revalidatePath("/dashboard/disputes")
}
