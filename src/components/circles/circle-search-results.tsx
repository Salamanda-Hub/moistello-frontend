"use client"

import type { KeyboardEvent, MutableRefObject } from "react"
import Link from "next/link"
import { Inbox, Search } from "lucide-react"
import { motion } from "framer-motion"

import { CircleGridCard } from "@/components/circles/circle-grid-card"
import { EmptyState } from "@/components/shared/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/cn"
import type { Circle } from "@/types"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

export interface CircleSearchResultsProps {
  circles: Circle[]
  isLoading: boolean
  isError: boolean
  emptyTitle: string
  emptyDescription: string
  activeIndex: number
  resultRefs: MutableRefObject<Array<HTMLAnchorElement | null>>
  onFocusResult: (index: number) => void
  onResultKeyDown: (event: KeyboardEvent<HTMLAnchorElement>, index: number) => void
}

export function CircleSearchResults({
  circles,
  isLoading,
  isError,
  emptyTitle,
  emptyDescription,
  activeIndex,
  resultRefs,
  onFocusResult,
  onResultKeyDown,
}: CircleSearchResultsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading circles">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} variant="card" className="h-56 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={<Inbox className="h-6 w-6" />}
        title="Failed to load circles"
        description="Something went wrong. Please try again later."
      />
    )
  }

  if (circles.length === 0) {
    return <EmptyState icon={<Search className="h-6 w-6" />} title={emptyTitle} description={emptyDescription} />
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {circles.map((circle, index) => (
        <Link
          key={circle.id}
          ref={(element) => {
            resultRefs.current[index] = element
          }}
          href={`/circles/${circle.id}`}
          aria-label={`Open ${circle.name}`}
          data-active={activeIndex === index ? "true" : undefined}
          onFocus={() => onFocusResult(index)}
          onKeyDown={(event) => onResultKeyDown(event, index)}
          className={cn(
            "block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            activeIndex === index && "ring-2 ring-aurora-violet ring-offset-2 ring-offset-background",
          )}
        >
          <CircleGridCard circle={circle} />
        </Link>
      ))}
    </motion.div>
  )
}
