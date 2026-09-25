"use client"

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react"
import type { Circle } from "@/types"

interface CircleSearchNavigationOptions {
  circles: Circle[]
  searchValue: string
  onSelect?: (circleId: string) => void
}

export function useCircleSearchNavigation({ circles, searchValue, onSelect }: CircleSearchNavigationOptions) {
  const inputRef = useRef<HTMLInputElement>(null)
  const resultRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const resultKey = circles.map((circle) => circle.id).join("|")

  useEffect(() => setActiveIndex(-1), [searchValue, resultKey])

  const focusResult = useCallback(
    (index: number) => {
      if (circles.length === 0) return
      const nextIndex = (index + circles.length) % circles.length
      setActiveIndex(nextIndex)
      resultRefs.current[nextIndex]?.focus()
    },
    [circles.length],
  )

  const handleSearchKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (circles.length === 0) return
      if (event.key === "ArrowDown") {
        event.preventDefault()
        focusResult(activeIndex < 0 ? 0 : activeIndex + 1)
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        focusResult(activeIndex < 0 ? circles.length - 1 : activeIndex - 1)
      } else if (event.key === "Home") {
        event.preventDefault()
        focusResult(0)
      } else if (event.key === "End") {
        event.preventDefault()
        focusResult(circles.length - 1)
      } else if (event.key === "Enter") {
        event.preventDefault()
        const selectedIndex = activeIndex >= 0 && activeIndex < circles.length ? activeIndex : 0
        if (onSelect) onSelect(circles[selectedIndex].id)
        else resultRefs.current[selectedIndex]?.click()
      } else if (event.key === "Escape") {
        setActiveIndex(-1)
      }
    },
    [activeIndex, circles, focusResult, onSelect],
  )

  const handleResultKeyDown = useCallback(
    (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
      if (event.key === "ArrowDown") {
        event.preventDefault()
        focusResult(index + 1)
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        focusResult(index - 1)
      } else if (event.key === "Home") {
        event.preventDefault()
        focusResult(0)
      } else if (event.key === "End") {
        event.preventDefault()
        focusResult(circles.length - 1)
      } else if (event.key === "Escape") {
        event.preventDefault()
        setActiveIndex(-1)
        inputRef.current?.focus()
      } else if (event.key === "Enter") {
        event.preventDefault()
        if (onSelect) onSelect(circles[index].id)
        else event.currentTarget.click()
      }
    },
    [circles, focusResult, onSelect],
  )

  return { inputRef, resultRefs, activeIndex, setActiveIndex, handleSearchKeyDown, handleResultKeyDown }
}
