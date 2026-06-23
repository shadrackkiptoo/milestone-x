import type { Role } from "@/lib/session"

export const ROLES: {
  value: Role
  label: string
  description: string
}[] = [
  {
    value: "donor",
    label: "Donor / Investor",
    description: "Fund projects, track progress, and vote on milestones.",
  },
  {
    value: "owner",
    label: "Project Owner",
    description: "Submit projects, define milestones, and request fund release.",
  },
  {
    value: "verifier",
    label: "Community Verifier",
    description: "Inspect progress and submit milestone verification reports.",
  },
  {
    value: "admin",
    label: "Administrator",
    description: "Approve projects, manage users, and resolve disputes.",
  },
  {
    value: "auditor",
    label: "Auditor / Partner",
    description: "Review financial records and accountability reports.",
  },
]

export const ROLE_LABELS: Record<Role, string> = {
  donor: "Donor / Investor",
  owner: "Project Owner",
  verifier: "Community Verifier",
  admin: "Administrator",
  auditor: "Auditor / Partner",
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}
