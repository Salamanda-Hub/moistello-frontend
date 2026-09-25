import type { Meta, StoryObj } from "@storybook/react";

import { CircleSearch } from "./circle-search";
import type { Circle } from "@/types";

function sampleCircle(id: string, name: string, round: number): Circle {
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
    currentRound: round,
    totalContributions: round * 250,
    organizerId: "organizer-1",
    organizerName: "Amina Okafor",
    memberCount: 4,
    createdAt: "2026-08-01T00:00:00.000Z",
  };
}

const sampleCircles: Circle[] = [
  sampleCircle("circle-alpha", "Neighborhood Savings", 2),
  sampleCircle("circle-beta", "Women Builders Circle", 4),
  sampleCircle("circle-gamma", "Community Growers", 1),
];

const meta: Meta<typeof CircleSearch> = {
  title: "Circles/Search",
  component: CircleSearch,
  parameters: {
    docs: {
      description: {
        component:
          "Circle search debounces the query by 300ms before requesting results. Results are keyboard navigable: ArrowDown/ArrowUp move focus, Home/End jump to the first or last result, Enter opens the selected circle, and Escape returns focus to the search field. Focused results use a visible aurora focus ring.",
      },
    },
  },
  args: {
    value: "",
    onChange: () => undefined,
    circles: sampleCircles,
    isLoading: false,
    isError: false,
    placeholder: "Search circles",
    emptyTitle: "No circles found",
    emptyDescription: "Try a different search or filter.",
  },
};

export default meta;
type Story = StoryObj<typeof CircleSearch>;

export const Default: Story = {};

export const KeyboardNavigation: Story = {
  parameters: {
    docs: {
      description: {
        story: "Focus the search field, press ArrowDown to enter the result list, and use ArrowUp/ArrowDown plus Enter to open a circle.",
      },
    },
  },
};

export const Loading: Story = {
  args: {
    circles: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    circles: [],
  },
};
