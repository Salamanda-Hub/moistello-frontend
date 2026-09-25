"use client"

import { create } from "zustand"
import { post } from "@/lib/api-client"

export type TransferCurrency = "USDC" | "XLM"

export interface TransferRequest {
  recipient: string
  amount: number
  currency: TransferCurrency
  memo?: string
}

export interface TransferResponse {
  txnHash?: string
}

export interface WalletTransferState {
  /** True from the first accepted submission until its request settles. */
  isPending: boolean
  /**
   * Submit a transfer once. Concurrent callers receive null while the first
   * request is still pending; the request itself is never sent twice.
   */
  submitTransfer: (request: TransferRequest) => Promise<TransferResponse | null>
}

export const useWalletTransferStore = create<WalletTransferState>()((set, get) => ({
  isPending: false,

  submitTransfer: async (request) => {
    // Check and set synchronously. React state is not involved here, so two
    // clicks in the same event turn cannot both observe an idle store.
    if (get().isPending) return null

    set({ isPending: true })

    try {
      return await post<TransferResponse>("/api/wallet/transfer", request)
    } finally {
      // A failed request must be retryable; successful requests also clear
      // the lock so a later, intentional transfer can be submitted.
      set({ isPending: false })
    }
  },
}))
