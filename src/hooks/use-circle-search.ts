"use client"

import { useDebounce } from "@/hooks/use-debounce"
import { useCircles, type CircleFilters } from "@/hooks/use-circles"

export const CIRCLE_SEARCH_DEBOUNCE_MS = 300

export type CircleSearchFilters = Omit<CircleFilters, "search">

/**
 * Queries circles with a stable search value so rapid typing produces one
 * request per debounce window instead of a request for every keystroke.
 */
export function useCircleSearch(search: string, filters?: CircleSearchFilters) {
  const debouncedSearch = useDebounce(search.trim(), CIRCLE_SEARCH_DEBOUNCE_MS)

  return useCircles({
    ...filters,
    search: debouncedSearch || undefined,
  })
}
