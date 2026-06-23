"use server"

import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getMyNotifications() {
  const u = await requireUser()
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, u.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50)
}

export async function markNotificationRead(id: number) {
  const u = await requireUser()
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, u.id)))
  revalidatePath("/dashboard/notifications")
}

export async function markAllNotificationsRead() {
  const u = await requireUser()
  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, u.id))
  revalidatePath("/dashboard/notifications")
}
