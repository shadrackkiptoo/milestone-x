"use server"

import { db } from "@/lib/db"
import { projects, milestones, user, transactions } from "@/lib/db/schema"
import { requireRole, requireUser } from "@/lib/session"
import { notify } from "@/lib/notify"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

type MilestoneInput = {
  title: string
  description: string
  amount: number
}

export async function createProject(formData: FormData) {
  const u = await requireRole(["owner", "admin"])

  const parsedMilestones = [] as MilestoneInput[]

  for (let i = 0; i < 10; i++) {
    const title = formData.get(`milestones[${i}].title`) as string
    const desc = formData.get(`milestones[${i}].description`) as string
    const amount = formData.get(`milestones[${i}].amount`) as string
    if (title || desc || amount) {
      parsedMilestones.push({
        title: title || "",
        description: desc || "",
        amount: Number(amount) || 0,
      })
    }
  }

  const fundingGoal = parsedMilestones.reduce(
    (sum, m) => sum + (Number(m.amount) || 0),
    0,
  )

  const [project] = await db
    .insert(projects)
    .values({
      ownerId: u.id,
      title: formData.get("title") as string,
      summary: formData.get("summary") as string,
      description: formData.get("description") as string,
      category: (formData.get("category") as string) || "community",
      location: formData.get("location") as string,
      imageUrl: (formData.get("imageUrl") as string) || null,
      fundingGoal,
      status: "pending",
    })
    .returning()

  if (parsedMilestones.length > 0) {
    await db.insert(milestones).values(
      parsedMilestones.map((m, i) => ({
        projectId: project.id,
        title: m.title,
        description: m.description,
        amount: Number(m.amount) || 0,
        orderIndex: i,
        status: "pending" as const,
      })),
    )
  }

  await notify({
    userId: u.id,
    title: "Project submitted",
    body: `Your project "${formData.get("title")}" was submitted for review.`,
    type: "project",
  })

  revalidatePath("/dashboard/projects")
  revalidatePath("/dashboard/admin")
}

export async function getMyProjects() {
  const u = await requireUser()
  return db
    .select()
    .from(projects)
    .where(eq(projects.ownerId, u.id))
    .orderBy(desc(projects.createdAt))
}

export async function reviewProject(projectId: number, approve: boolean) {
  await requireRole(["admin"])

  const [project] = await db
    .update(projects)
    .set({
      status: approve ? "approved" : "rejected",
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning()

  if (project) {
    await notify({
      userId: project.ownerId,
      title: approve ? "Project approved" : "Project rejected",
      body: approve
        ? `"${project.title}" is now live and visible to donors.`
        : `"${project.title}" was not approved at this time.`,
      type: "project",
    })
  }

  revalidatePath("/dashboard/admin")
  revalidatePath("/projects")
  revalidatePath("/dashboard/projects")
}

export async function getOwnerName(ownerId: string) {
  const rows = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, ownerId))
  return rows[0]?.name ?? "Unknown"
}

// Release approved milestone funds from escrow (admin action)
export async function releaseMilestoneFunds(milestoneId: number) {
  const u = await requireRole(["admin"])

  const [m] = await db
    .select()
    .from(milestones)
    .where(eq(milestones.id, milestoneId))
  if (!m) throw new Error("Milestone not found")
  if (m.status !== "approved") {
    throw new Error("Only approved milestones can be released")
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, m.projectId))
  if (!project) throw new Error("Project not found")

  const releaseAmount = Math.min(m.amount, project.escrowBalance)

  await db
    .update(milestones)
    .set({ status: "released", updatedAt: new Date() })
    .where(eq(milestones.id, milestoneId))

  const remainingMilestones = await db
    .select()
    .from(milestones)
    .where(
      and(
        eq(milestones.projectId, m.projectId),
      ),
    )
  const allReleased = remainingMilestones.every(
    (ms) => ms.id === milestoneId || ms.status === "released",
  )

  await db
    .update(projects)
    .set({
      escrowBalance: project.escrowBalance - releaseAmount,
      releasedAmount: project.releasedAmount + releaseAmount,
      status: allReleased ? "completed" : project.status,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, m.projectId))

  await db.insert(transactions).values({
    projectId: m.projectId,
    milestoneId: m.id,
    type: "release",
    amount: releaseAmount,
    actorId: u.id,
    note: `Funds released for milestone "${m.title}"`,
  })

  await notify({
    userId: project.ownerId,
    title: "Funds released",
    body: `${releaseAmount} released from escrow for "${m.title}".`,
    type: "fund_release",
  })

  revalidatePath(`/projects/${m.projectId}`)
  revalidatePath("/dashboard/admin")
  revalidatePath("/dashboard/projects")
}