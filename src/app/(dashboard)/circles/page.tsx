"use client"

import { useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, ChevronLeft, ChevronRight, ArrowUpDown, Check } from "lucide-react"
import { useCircleSearch } from "@/hooks/use-circle-search"
import { CircleSearch } from "@/components/circles/circle-search"
import { PageHeader } from "@/components/shared/page-header"
import { Button, ButtonLink } from "@/components/ui/button"
import { Dropdown, DropdownItem } from "@/components/ui/dropdown"
import { cn } from "@/lib/cn"
import type { Currency } from "@/types"
import { useTranslate } from "@/lib/locale/context"

const TYPE_TABS = [
  { value: "all", label: "All" },
  { value: "my-circles", label: "My Circles" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "community", label: "Community" },
  { value: "premium", label: "Premium" },
]

const SORT_OPTIONS = [
  { value: "date-desc", label: "Creation Date (Newest)", sortBy: "date", sortOrder: "desc" as const },
  { value: "date-asc", label: "Creation Date (Oldest)", sortBy: "date", sortOrder: "asc" as const },
  { value: "name-asc", label: "Name (A-Z)", sortBy: "name", sortOrder: "asc" as const },
  { value: "name-desc", label: "Name (Z-A)", sortBy: "name", sortOrder: "desc" as const },
  { value: "amount-asc", label: "Amount (Low to High)", sortBy: "amount", sortOrder: "asc" as const },
  { value: "amount-desc", label: "Amount (High to Low)", sortBy: "amount", sortOrder: "desc" as const },
  { value: "members-asc", label: "Members (Fewest)", sortBy: "members", sortOrder: "asc" as const },
  { value: "members-desc", label: "Members (Most)", sortBy: "members", sortOrder: "desc" as const },
]

const CURRENCIES: Currency[] = ["USDC", "XLM"]

export default function CirclesBrowsePage() {
  const { t } = useTranslate()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initialType = searchParams.get("tab") || "all"

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState(initialType)
  const [currencyFilter, setCurrencyFilter] = useState<Currency | null>(null)
  const [sortValue, setSortValue] = useState("date-desc")
  const [page, setPage] = useState(1)
  const limit = 12

  // Sync tab with URL
  const updateTypeFilter = (newType: string) => {
    setTypeFilter(newType)
    setPage(1)
    const params = new URLSearchParams(searchParams)
    if (newType === "all") {
      params.delete("tab")
    } else {
      params.set("tab", newType)
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  const selectedSort = SORT_OPTIONS.find((s) => s.value === sortValue) ?? SORT_OPTIONS[0]

  const filters = {
    type: typeFilter !== "all" ? typeFilter : undefined,
    currency: currencyFilter ?? undefined,
    sort: selectedSort.value,
    sortBy: selectedSort.sortBy,
    sortOrder: selectedSort.sortOrder,
    page,
    limit,
  }

  const { data, isLoading, isError } = useCircleSearch(search, filters)
  const circles = data?.circles ?? []
  const meta = data?.meta

  const hasNext = meta ? meta.page < meta.totalPages : false
  const hasPrev = page > 1

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("circles.title")}
        description="Browse and join savings circles on the Stellar network."
        action={
          <ButtonLink href="/circles/create" variant="premium" size="md" leftIcon={<Plus className="h-4 w-4" />}>
            {t("circles.create")}
          </ButtonLink>
        }
      />

      <CircleSearch
        value={search}
        onChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        circles={circles}
        isLoading={isLoading}
        isError={isError}
        placeholder={t("circles.search")}
        emptyTitle={t("circles.noCircles")}
        emptyDescription={t("circles.tryDifferent")}
        onSelect={(circleId) => router.push(`/circles/${circleId}`)}
        toolbar={
          <div className="p-4 rounded-xl border-l-4 border-l-aurora-violet bg-card/60 backdrop-blur-md space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {TYPE_TABS.map((f) => (
              <motion.button
                key={f.value}
                type="button"
                aria-pressed={typeFilter === f.value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => updateTypeFilter(f.value)}
                className={cn(
                  "inline-flex items-center rounded-full px-4 py-1.5 text-xs font-body font-medium transition-all duration-300",
                  typeFilter === f.value
                    ? "gradient-bg-extended text-white shadow-lg holo-glow"
                    : "glass-whisper text-muted-foreground hover:text-foreground dark:hover:text-white",
                )}
              >
                {t("circles." + f.value)}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xs text-muted-foreground font-body">Currency:</span>
              {CURRENCIES.map((c) => (
                <motion.button
                  key={c}
                  type="button"
                  aria-pressed={currencyFilter === c}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCurrencyFilter((prev) => (prev === c ? null : c))}
                  className={cn(
                    "inline-flex items-center rounded-full px-3.5 py-1 text-xs font-body font-medium transition-all duration-300",
                    currencyFilter === c
                      ? "gradient-bg-extended text-white"
                      : "glass-whisper text-muted-foreground hover:text-foreground dark:hover:text-white",
                  )}
                >
                  {c}
                </motion.button>
              ))}
            </div>

            <Dropdown
              align="right"
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<ArrowUpDown className="h-3.5 w-3.5" />}
                  className="font-body text-xs border-aurora-violet/30 hover:border-aurora-violet"
                >
                  <span className="hidden sm:inline">Sort: </span>
                  <span className="font-semibold text-aurora-violet dark:text-emerald-400">
                    {selectedSort.label}
                  </span>
                </Button>
              }
            >
              <div className="py-1">
                <p className="px-3 py-1.5 text-[10px] tracking-wider uppercase text-muted-foreground font-heading border-b border-border/40">
                  Sort Circles By
                </p>
                {SORT_OPTIONS.map((option) => {
                  const isSelected = option.value === sortValue
                  return (
                    <DropdownItem
                      key={option.value}
                      role="menuitemradio"
                      aria-checked={isSelected}
                      onClick={() => {
                        setSortValue(option.value)
                        setPage(1)
                      }}
                      className={cn(
                        "justify-between text-xs transition-colors",
                        isSelected
                          ? "bg-aurora-violet/15 text-aurora-violet font-semibold dark:text-emerald-400"
                          : "text-foreground/80 hover:bg-white/5",
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-aurora-violet dark:text-emerald-400" />}
                    </DropdownItem>
                  )
                })}
              </div>
            </Dropdown>
          </div>
        </div>
          </div>
        }
      />

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground font-body">
            Page {meta.page} of {meta.totalPages} ({meta.total} circles)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(meta.totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1
                return (
                  <motion.button
                    key={pageNum}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      "w-8 h-8 rounded-full text-xs font-body font-medium transition-all",
                      meta.page === pageNum
                        ? "gradient-bg-extended text-white"
                        : "glass-whisper text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {pageNum}
                  </motion.button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
