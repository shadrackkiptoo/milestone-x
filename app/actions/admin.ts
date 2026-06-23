"use server"

import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { requireRole } from "@/lib/session"
import type { Role } from "@/lib/session"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getAllUsers() {
  await requireRole(["admin", "auditor"])
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
}

export async function updateUserRole(userId: string, role: Role) {
  await requireRole(["admin"])
  await db
    .update(user)
    .set({ role, updatedAt: new Date() })
    .where(eq(user.id, userId))
  revalidatePath("/dashboard/admin")
  revalidatePath("/dashboard/users")
}

export async function suspendUser(userId: string) {
  await requireRole(["admin"])
  // Mark account as suspended by setting role to a restricted value.
  await db
    .update(user)
    .set({ role: "suspended", updatedAt: new Date() })
    .where(eq(user.id, userId))
  revalidatePath("/dashboard/users")
}
