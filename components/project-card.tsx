import Link from "next/link"
import Image from "next/image"
import { MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { FundingProgress } from "@/components/funding-progress"

type ProjectCardProps = {
  project: {
    id: number
    title: string
    summary: string
    category: string
    location: string | null
    imageUrl: string | null
    fundingGoal: number
    fundedAmount: number
    releasedAmount: number
    status: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <Card className="overflow-hidden p-0 h-full transition-shadow hover:shadow-md">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <Image
            src={
              project.imageUrl ||
              "/hero-community.png"
            }
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3">
            <StatusBadge status={project.status} />
          </div>
        </div>
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{project.category}</span>
            {project.location && (
              <>
                <span aria-hidden>•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" />
                  {project.location}
                </span>
              </>
            )}
          </div>
          <h3 className="text-balance text-lg font-semibold leading-tight text-foreground">
            {project.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {project.summary}
          </p>
          <div className="mt-1">
            <FundingProgress
              funded={project.fundedAmount}
              goal={project.fundingGoal}
            />
          </div>
        </div>
      </Card>
    </Link>
  )
}
