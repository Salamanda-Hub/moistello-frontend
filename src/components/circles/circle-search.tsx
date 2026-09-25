"use client"

import { useId, type ReactNode } from "react"
import { Search } from "lucide-react"

import { CircleSearchResults } from "@/components/circles/circle-search-results"
import { useCircleSearchNavigation } from "@/components/circles/use-circle-search-navigation"
import { Input } from "@/components/ui/input"
import type { Circle } from "@/types"

export interface CircleSearchProps {
  value: string
  onChange: (value: string) => void
  circles: Circle[]
  isLoading: boolean
  isError: boolean
  placeholder?: string
  emptyTitle?: string
  emptyDescription?: string
  toolbar?: ReactNode
  onSelect?: (circleId: string) => void
}

export function CircleSearch({
  value,
  onChange,
  circles,
  isLoading,
  isError,
  placeholder = "Search circles",
  emptyTitle = "No circles found",
  emptyDescription = "Try a different search or filter.",
  toolbar,
  onSelect,
}: CircleSearchProps) {
  const inputId = useId()
  const hintId = `${inputId}-hint`
  const {
    inputRef,
    resultRefs,
    activeIndex,
    setActiveIndex,
    handleSearchKeyDown,
    handleResultKeyDown,
  } = useCircleSearchNavigation({ circles, searchValue: value, onSelect })

  return (
    <div className="space-y-6">
      <div role="search" aria-label="Circle search">
        <Input
          ref={inputRef}
          id={inputId}
          type="search"
          data-testid="circle-search-input"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-describedby={hintId}
          aria-keyshortcuts="ArrowDown ArrowUp Enter"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          leftIcon={<Search className="h-4 w-4" />}
        />
        <p id={hintId} className="mt-2 text-xs text-muted-foreground">
          Use ↑/↓ to move between results, Enter to open, and Escape to return to search.
        </p>
      </div>

      {toolbar}

      <CircleSearchResults
        circles={circles}
        isLoading={isLoading}
        isError={isError}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        activeIndex={activeIndex}
        resultRefs={resultRefs}
        onFocusResult={setActiveIndex}
        onResultKeyDown={handleResultKeyDown}
      />
    </div>
  )
}
