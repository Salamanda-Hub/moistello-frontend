import { expect, test } from "@playwright/test"

import { buildMockFixtures, createMockCalls, installMockApi, seedAuthCookie } from "../helpers/mock-app"

test.describe("Wallet transfer", () => {
  test("submits only once when confirm is double-clicked", async ({ page, context }) => {
    // Use a future-dated test JWT so the client can restore the mocked session
    // without making an unrelated external /auth/me request during the test.
    const token = [
      "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0",
      Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64"),
      "signature",
    ].join(".")
    const fixtures = buildMockFixtures({ token })
    const calls = createMockCalls()
    calls.transferDelayMs = 1000
    await seedAuthCookie(context, fixtures.token)
    await installMockApi(page, fixtures, calls)

    await page.goto(`/wallet/transfer?recipient=${fixtures.user.walletAddress}`)
    await page.getByTestId("amount-input").fill("50")
    await page.getByTestId("review-transfer-button").click()

    const confirmButton = page.getByTestId("confirm-transfer-button")
    await expect(confirmButton).toBeVisible()
    await confirmButton.dblclick()

    // The request is deliberately delayed by the mock. During that window the
    // button must expose its pending state and reject the second click.
    await expect(confirmButton).toBeDisabled()
    await expect(confirmButton).toHaveAttribute("aria-busy", "true")
    await expect(confirmButton).toHaveText("Sending...")

    await expect(page.getByText("Transfer Successful!")).toBeVisible()
    expect(calls.transferPosts).toHaveLength(1)
  })
})
