import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { AuthForm } from "@/components/auth-form"

export default async function SignUpPage() {
  const user = await getSession()
  if (user) redirect("/dashboard")
  return <AuthForm mode="sign-up" />
}
