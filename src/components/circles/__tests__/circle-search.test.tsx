import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CircleSearch } from "@/components/circles/circle-search";
import type { Circle } from "@/types";

function makeCircle(id: string, name: string): Circle {
  return {
    id,
    contractId: `contract-${id}`,
    name,
    description: "A community savings circle.",
    circleType: "public",
    payoutType: "fixed",
    contributionAmount: 250,
    currency: "XLM",
    frequency: "monthly",
    maxMembers: 12,
    minMoiScore: 0,
    collateralPercent: 10,
    lateFeePercent: 5,
    gracePeriodHours: 24,
    maxStrikes: 3,
    startDate: "2026-09-01T00:00:00.000Z",
    status: "active",
    currentRound: 2,
    totalContributions: 500,
    organizerId: "organizer-1",
    organizerName: "Amina Okafor",
    memberCount: 4,
    createdAt: "2026-08-01T00:00:00.000Z",
  };
}

const circles = [
  makeCircle("circle-alpha", "Neighborhood Savings"),
  makeCircle("circle-beta", "Women Builders Circle"),
  makeCircle("circle-gamma", "Community Growers"),
];

function renderSearch(onSelect = vi.fn()) {
  render(
    <CircleSearch
      value=""
      onChange={vi.fn()}
      circles={circles}
      isLoading={false}
      isError={false}
      onSelect={onSelect}
    />,
  );

  return {
    onSelect,
    input: screen.getByRole("searchbox", { name: "Search circles" }),
    links: screen.getAllByRole("link"),
  };
}

describe("CircleSearch keyboard navigation", () => {
  it("moves through results with arrow keys and opens the focused result with Enter", () => {
    const { input, links, onSelect } = renderSearch();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(links[0]).toHaveFocus();
    expect(links[0]).toHaveAttribute("data-active", "true");

    fireEvent.keyDown(links[0], { key: "ArrowDown" });
    expect(links[1]).toHaveFocus();
    expect(links[1]).toHaveAttribute("data-active", "true");

    fireEvent.keyDown(links[1], { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("circle-beta");
  });

  it("supports wraparound, Home/End, and Escape", () => {
    const { input, links } = renderSearch();

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(links[2]).toHaveFocus();

    fireEvent.keyDown(links[2], { key: "Home" });
    expect(links[0]).toHaveFocus();

    fireEvent.keyDown(links[0], { key: "End" });
    expect(links[2]).toHaveFocus();

    fireEvent.keyDown(links[2], { key: "Escape" });
    expect(input).toHaveFocus();
  });

  it("exposes keyboard instructions and an accessible search label", () => {
    const { input } = renderSearch();

    expect(input).toHaveAttribute("aria-keyshortcuts", "ArrowDown ArrowUp Enter");
    expect(screen.getByText(/use ↑\/↓ to move between results/i)).toBeInTheDocument();
    expect(screen.getByRole("search", { name: "Circle search" })).toBeInTheDocument();
  });
});
