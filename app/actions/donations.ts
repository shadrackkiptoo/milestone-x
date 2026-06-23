"use server"

import { db } from "@/lib/db"
import { projects, donations, transactions } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { notify } from "@/lib/notify"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function contribute(
  projectId: number,
  amount: number,
  kind: "donation" | "investment",
) {
  const u = await requireUser()
  if (!amount || amount <= 0) throw new Error("Enter a valid amount")

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
  if (!project) throw new Error("Project not found")
  if (!["approved", "funding"].includes(project.status)) {
    throw new Error("This project is not currently accepting funds")
  }

  await db.insert(donations).values({
    projectId,
    donorId: u.id,
    donorName: u.name,
    amount,
    kind,
  })

  // Funds enter the escrow account, held until milestones are verified.
  await db
    .update(projects)
    .set({
      fundedAmount: project.fundedAmount + amount,
      escrowBalance: project.escrowBalance + amount,
      status: "funding",
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))

  await db.insert(transactions).values([
    {
      projectId,
      type: "contribution",
      amount,
      actorId: u.id,
      note: `${kind === "investment" ? "Investment" : "Donation"} from ${u.name}`,
    },
    {
      projectId,
      type: "escrow_in",
      amount,
      actorId: u.id,
      note: "Funds secured in escrow",
    },
  ])

  await notify({
    userId: u.id,
    title: "Contribution confirmed",
    body: `Your ${kind} of ${amount} to "${project.title}" is secured in escrow.`,
    type: "donation",
  })
  await notify({
    userId: project.ownerId,
    title: "New contribution received",
    body: `${u.name} contributed ${amount} to "${project.title}".`,
    type: "donation",
  })

  revalidatePath(`/projects/${projectId}`)
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/donations")
}

export async function getMyDonations() {
  const u = await requireUser()
  return db
    .select({
      id: donations.id,
      amount: donations.amount,
      kind: donations.kind,
      createdAt: donations.createdAt,
      projectId: donations.projectId,
      projectTitle: projects.title,
      projectStatus: projects.status,
    })
    .from(donations)
    .innerJoin(projects, eq(projects.id, donations.projectId))
    .where(eq(donations.donorId, u.id))
    .orderBy(desc(donations.createdAt))
}
