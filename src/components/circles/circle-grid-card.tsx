"use client"

import { motion } from "framer-motion"
import { Clock, Shield, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/formatters"
import { cn } from "@/lib/cn"
import type { Circle, CircleType } from "@/types"

const typeAccentColors: Record<CircleType, string> = {
  public: "from-emerald-500 to-aurora-cyan",
  private: "from-aurora-indigo to-aurora-violet",
  community: "from-aurora-amber to-aurora-violet",
  premium: "from-aurora-violet to-fuchsia-500",
}

const cardItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function CircleGridCard({ circle }: { circle: Circle }) {
  const freqLabel =
    circle.frequency.charAt(0).toUpperCase() + circle.frequency.slice(1)
  const memberCount = circle.memberCount ?? 0
  const progressPct = Math.min(
    100,
    Math.round((circle.currentRound / (circle.maxMembers || 1)) * 100),
  )
  const isPremium = circle.circleType === "premium"
  const accentGradient = typeAccentColors[circle.circleType] ?? typeAccentColors.public

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={cardItem}
      whileHover={{ y: -5, transition: { duration: 0.25 } }}
      className={cn(
        "glass-premium rounded-2xl overflow-hidden tilt-hover depth-3",
        isPremium && "holo-border",
      )}
    >
      <div className={cn("h-[3px] w-full bg-gradient-to-r", accentGradient)} />
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h4 className="font-heading text-lg font-semibold text-foreground dark:text-white truncate">
              {circle.name}
            </h4>
            <p className="text-2xs text-muted-foreground mt-0.5 capitalize">
              {circle.circleType}
            </p>
          </div>
          <Badge
            variant={circle.status === "active" ? "success" : circle.status === "pending" ? "warning" : "default"}
            size="sm"
            className="shrink-0 ml-2"
          >
            {circle.status}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="gradient-text font-bold font-heading">
            {formatCurrency(circle.contributionAmount, circle.currency)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {freqLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {memberCount}/{circle.maxMembers}
          </span>
          {circle.minMoiScore != null && circle.minMoiScore > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-400 text-xs">
              <Shield className="h-3 w-3" />
              {circle.minMoiScore}+
            </span>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-2xs text-muted-foreground">
            <span>Round Progress</span>
            <span>{circle.currentRound}/{circle.maxMembers}</span>
          </div>
          <Progress
            aria-label="Circle contribution progress"
            value={progressPct}
            size="sm"
            variant={progressPct >= 80 ? "success" : "primary"}
          />
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground hover:text-foreground transition-colors font-body">
            View Details &rarr;
          </span>
        </div>
      </div>
    </motion.div>
  )
}
