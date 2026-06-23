"use server"

import { db } from "@/lib/db"
import { milestones, projects, verifications } from "@/lib/db/schema"
import { requireRole, requireUser } from "@/lib/session"
import { notify } from "@/lib/notify"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// Project owner submits milestone completion + evidence
export async function submitMilestoneEvidence(
  milestoneId: number,
  evidenceNote: string,
  evidenceUrls: string,
) {
  const u = await requireUser()

  const [m] = await db
    .select()
    .from(milestones)
    .where(eq(milestones.id, milestoneId))
  if (!m) throw new Error("Milestone not found")

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, m.projectId))
  if (!project) throw new Error("Project not found")
  if (project.ownerId !== u.id && u.role !== "admin") {
    throw new Error("Only the project owner can submit evidence")
  }

  await db
    .update(milestones)
    .set({
      status: "submitted",
      evidenceNote,
      evidenceUrls,
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(milestones.id, milestoneId))

  await notify({
    userId: u.id,
    title: "Milestone submitted",
    body: `"${m.title}" is awaiting community verification.`,
    type: "verification",
  })

  revalidatePath(`/projects/${m.projectId}`)
  revalidatePath("/dashboard/projects")
  revalidatePath("/dashboard/verify")
}

// Community verifier submits an inspection report
export async function submitVerification(
  milestoneId: number,
  decision: "approve" | "reject",
  report: string,
) {
  const u = await requireRole(["verifier", "admin"])

  const [m] = await db
    .select()
    .from(milestones)
    .where(eq(milestones.id, milestoneId))
  if (!m) throw new Error("Milestone not found")

  await db.insert(verifications).values({
    milestoneId,
    projectId: m.projectId,
    verifierId: u.id,
    verifierName: u.name,
    decision,
    report,
  })

  await db
    .update(milestones)
    .set({ status: "verifying", updatedAt: new Date() })
    .where(eq(milestones.id, milestoneId))

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, m.projectId))
  if (project) {
    await notify({
      userId: project.ownerId,
      title: "Verification report submitted",
      body: `A verifier ${decision === "approve" ? "recommended approval" : "raised concerns"} for "${m.title}".`,
      type: "verification",
    })
  }

  revalidatePath(`/projects/${m.projectId}`)
  revalidatePath("/dashboard/verify")
  revalidatePath("/dashboard/admin")
}

// Admin reviews verification reports and approves/rejects the milestone
export async function decideMilestone(
  milestoneId: number,
  approve: boolean,
) {
  await requireRole(["admin"])

  const [m] = await db
    .select()
    .from(milestones)
    .where(eq(milestones.id, milestoneId))
  if (!m) throw new Error("Milestone not found")

  await db
    .update(milestones)
    .set({
      status: approve ? "approved" : "rejected",
      updatedAt: new Date(),
    })
    .where(eq(milestones.id, milestoneId))

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, m.projectId))
  if (project) {
    await notify({
      userId: project.ownerId,
      title: approve ? "Milestone approved" : "Milestone rejected",
      body: approve
        ? `"${m.title}" was approved. Funds can now be released from escrow.`
        : `"${m.title}" was rejected. Payment is on hold.`,
      type: "milestone",
    })
  }

  revalidatePath(`/projects/${m.projectId}`)
  revalidatePath("/dashboard/admin")
  revalidatePath("/dashboard/projects")
}

// Milestones awaiting verification (for verifier queue)
export async function getVerificationQueue() {
  await requireRole(["verifier", "admin"])
  return db
    .select({
      id: milestones.id,
      title: milestones.title,
      description: milestones.description,
      amount: milestones.amount,
      status: milestones.status,
      evidenceNote: milestones.evidenceNote,
      evidenceUrls: milestones.evidenceUrls,
      submittedAt: milestones.submittedAt,
      projectId: milestones.projectId,
      projectTitle: projects.title,
    })
    .from(milestones)
    .innerJoin(projects, eq(projects.id, milestones.projectId))
    .where(eq(milestones.status, "submitted"))
}
