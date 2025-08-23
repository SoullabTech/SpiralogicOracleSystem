import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = { title: "Spiralogic/Tabs" };
export default meta;

export const BottomTabs: StoryObj = {
  render: () => (
    <nav className="fixed bottom-0 inset-x-0 border-t border-edge-700 bg-bg-900">
      <div className="mx-auto grid max-w-lg grid-cols-4 py-2 text-sm">
        {["Home","Library","Search","Settings"].map((t, i) => (
          <button key={t} className={`flex flex-col items-center gap-1 px-3 py-2 ${i===0 ? "text-gold-400" : "text-ink-300 hover:text-ink-100"}`}>
            <span className="h-5 w-5 rounded bg-edge-700" /> {/* placeholder icon */}
            <span>{t}</span>
            <span className={`h-0.5 w-6 rounded-full ${i===0 ? "bg-gold-400" : "bg-transparent"}`} />
          </button>
        ))}
      </div>
    </nav>
  ),
};