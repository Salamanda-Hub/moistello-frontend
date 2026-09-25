import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { get } from "@/lib/api-client"
import { useCircleSearch, CIRCLE_SEARCH_DEBOUNCE_MS } from "@/hooks/use-circle-search"
import { createQueryWrapper } from "./test-utils"

vi.mock("@/lib/api-client", () => ({
  get: vi.fn(),
}))

describe("useCircleSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(get).mockResolvedValue({
      data: { circles: [] },
      meta: { page: 1, limit: 12, total: 0, totalPages: 0 },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("issues one request after rapid typing settles", async () => {
    const { QueryWrapper } = createQueryWrapper()
    const { rerender } = renderHook(
      ({ search }) => useCircleSearch(search, { limit: 12 }),
      {
        initialProps: { search: "" },
        wrapper: QueryWrapper,
      },
    )

    expect(get).toHaveBeenCalledTimes(1)

    rerender({ search: "n" })
    rerender({ search: "ne" })
    rerender({ search: "neighborhood" })

    act(() => {
      vi.advanceTimersByTime(CIRCLE_SEARCH_DEBOUNCE_MS - 1)
    })
    expect(get).toHaveBeenCalledTimes(1)

    await act(async () => {
      vi.advanceTimersByTime(1)
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(get).toHaveBeenCalledTimes(2)
    expect(get).toHaveBeenLastCalledWith("/circles?search=neighborhood&limit=12")
  })
})
