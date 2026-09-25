import { beforeEach, describe, expect, it, vi } from "vitest"

const { post } = vi.hoisted(() => ({
  post: vi.fn(),
}))

vi.mock("@/lib/api-client", () => ({
  post,
}))

import { useWalletTransferStore, type TransferRequest } from "@/stores/wallet-transfer-store"

const request: TransferRequest = {
  recipient: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  amount: 25,
  currency: "USDC",
  memo: "",
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

describe("wallet transfer store", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useWalletTransferStore.setState({ isPending: false })
  })

  it("ignores a second submission while the first request is pending", async () => {
    const pendingRequest = deferred<{ txnHash: string }>()
    post.mockReturnValue(pendingRequest.promise)

    const first = useWalletTransferStore.getState().submitTransfer(request)
    const second = useWalletTransferStore.getState().submitTransfer(request)

    expect(post).toHaveBeenCalledTimes(1)
    expect(useWalletTransferStore.getState().isPending).toBe(true)
    await expect(second).resolves.toBeNull()

    pendingRequest.resolve({ txnHash: "tx-1" })
    await expect(first).resolves.toEqual({ txnHash: "tx-1" })
    expect(useWalletTransferStore.getState().isPending).toBe(false)
  })

  it("clears the pending lock when the request fails", async () => {
    const pendingRequest = deferred<{ txnHash: string }>()
    post.mockReturnValue(pendingRequest.promise)

    const submission = useWalletTransferStore.getState().submitTransfer(request)
    pendingRequest.reject(new Error("network error"))

    await expect(submission).rejects.toThrow("network error")
    expect(useWalletTransferStore.getState().isPending).toBe(false)
  })
})
