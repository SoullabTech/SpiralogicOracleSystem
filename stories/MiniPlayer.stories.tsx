import type { Meta, StoryObj } from "@storybook/react";
import { Play } from "lucide-react";

const meta: Meta = { title: "Spiralogic/MiniPlayer" };
export default meta;

export const Base: StoryObj = {
  render: () => (
    <div className="m-8 max-w-lg rounded-lg border border-edge-700 bg-bg-800 p-3 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-md bg-edge-700" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-ink-100">Blue Friday</div>
          <div className="truncate text-sm text-ink-300">Kenny Dorham</div>
        </div>
        <button className="rounded-md border border-gold-400 px-3 py-1.5 text-gold-400 transition-colors hover:border-gold-500 hover:text-gold-500">
          <Play size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  ),
};