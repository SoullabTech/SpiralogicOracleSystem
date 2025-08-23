import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = { title: "Spiralogic/Card" };
export default meta;

export const Base: StoryObj = {
  render: () => (
    <div className="m-8 max-w-md rounded-lg border border-edge-700 bg-bg-800 p-6 shadow-soft">
      <div className="mb-1 text-xl font-semibold tracking-tight">A Dream Come True</div>
      <div className="text-ink-300">Blocks out ambient noise. Intelligently adapts to your environment.</div>
    </div>
  ),
};