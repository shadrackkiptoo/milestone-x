import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"

export async function notify(params: {
  userId: string
  title: string
  body: string
  type?: string
}) {
  await db.insert(notifications).values({
    userId: params.userId,
    title: params.title,
    body: params.body,
    type: params.type ?? "info",
  })
}
