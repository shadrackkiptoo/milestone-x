import { db } from "@/lib/db"
import {
  projects,
  milestones,
  donations,
  transactions,
  verifications,
  disputes,
} from "@/lib/db/schema"
import { and, desc, eq, sql } from "drizzle-orm"

export async function getPublicProjects() {
  return db
    .select()
    .from(projects)
    .where(
      sql`${projects.status} in ('approved', 'funding', 'completed')`,
    )
    .orderBy(desc(projects.createdAt))
}

export async function getAllProjects() {
  return db.select().from(projects).orderBy(desc(projects.createdAt))
}

export async function getProjectById(id: number) {
  const rows = await db.select().from(projects).where(eq(projects.id, id))
  return rows[0] ?? null
}

export async function getProjectMilestones(projectId: number) {
  return db
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, projectId))
    .orderBy(milestones.orderIndex)
}

export async function getProjectDonations(projectId: number) {
  return db
    .select()
    .from(donations)
    .where(eq(donations.projectId, projectId))
    .orderBy(desc(donations.createdAt))
}

export async function getProjectTransactions(projectId: number) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.projectId, projectId))
    .orderBy(desc(transactions.createdAt))
}

export async function getMilestoneVerifications(milestoneId: number) {
  return db
    .select()
    .from(verifications)
    .where(eq(verifications.milestoneId, milestoneId))
    .orderBy(desc(verifications.createdAt))
}

export async function getPlatformStats() {
  const [agg] = await db
    .select({
      totalProjects: sql<number>`count(*)::int`,
      totalRaised: sql<number>`coalesce(sum(${projects.fundedAmount}), 0)::int`,
      totalEscrow: sql<number>`coalesce(sum(${projects.escrowBalance}), 0)::int`,
      totalReleased: sql<number>`coalesce(sum(${projects.releasedAmount}), 0)::int`,
    })
    .from(projects)
    .where(sql`${projects.status} in ('approved', 'funding', 'completed')`)

  const [milestoneAgg] = await db
    .select({
      verified: sql<number>`count(*) filter (where ${milestones.status} in ('approved','released'))::int`,
      total: sql<number>`count(*)::int`,
    })
    .from(milestones)

  return {
    totalProjects: agg?.totalProjects ?? 0,
    totalRaised: agg?.totalRaised ?? 0,
    totalEscrow: agg?.totalEscrow ?? 0,
    totalReleased: agg?.totalReleased ?? 0,
    verifiedMilestones: milestoneAgg?.verified ?? 0,
    totalMilestones: milestoneAgg?.total ?? 0,
  }
}

export async function getRecentActivity(limit = 8) {
  return db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.createdAt))
    .limit(limit)
}

export async function getOpenDisputes() {
  return db
    .select()
    .from(disputes)
    .where(and(eq(disputes.status, "open")))
    .orderBy(desc(disputes.createdAt))
}
