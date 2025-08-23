import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Foundation/Design Tokens',
  tags: ['autodocs']
}
export default meta

type Story = StoryObj

export const Colors: Story = {
  render: () => (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-ink-100 mb-4">Spiralogic Color Tokens</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-ink-100 mb-2">Backgrounds</h3>
          <div className="flex gap-4">
            <div className="p-4 rounded-lg bg-bg-900 border border-edge-700">
              <div className="text-ink-100 text-sm">bg-900</div>
            </div>
            <div className="p-4 rounded-lg bg-bg-800 border border-edge-700">
              <div className="text-ink-100 text-sm">bg-800</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-ink-100 mb-2">Text & Borders</h3>
          <div className="flex gap-4">
            <div className="p-4 rounded-lg bg-bg-800 border border-edge-700">
              <div className="text-ink-100 text-sm">ink-100</div>
            </div>
            <div className="p-4 rounded-lg bg-bg-800 border border-edge-700">
              <div className="text-ink-300 text-sm">ink-300</div>
            </div>
            <div className="p-4 rounded-lg bg-edge-700 border border-edge-700">
              <div className="text-ink-100 text-sm">edge-700</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-ink-100 mb-2">Gold Accents</h3>
          <div className="flex gap-4">
            <div className="p-4 rounded-lg bg-gold-400 text-bg-900">
              <div className="text-sm font-medium">gold-400</div>
            </div>
            <div className="p-4 rounded-lg bg-gold-500 text-bg-900">
              <div className="text-sm font-medium">gold-500</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-ink-100 mb-2">State Colors</h3>
          <div className="flex gap-4">
            <div className="p-4 rounded-lg bg-state-green text-white">
              <div className="text-sm">success</div>
            </div>
            <div className="p-4 rounded-lg bg-state-amber text-bg-900">
              <div className="text-sm">warning</div>
            </div>
            <div className="p-4 rounded-lg bg-state-red text-white">
              <div className="text-sm">danger</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Shadows: Story = {
  render: () => (
    <div className="p-6 space-y-6 bg-bg-800">
      <h2 className="text-2xl font-bold text-ink-100 mb-4">Shadow System</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-bg-800 border border-edge-700 shadow-soft">
          <h3 className="text-lg font-semibold text-ink-100">Soft Shadow</h3>
          <p className="text-ink-300 text-sm">shadow-soft</p>
        </div>
        
        <div className="p-6 rounded-xl bg-bg-800 border border-edge-600 shadow-lift">
          <h3 className="text-lg font-semibold text-ink-100">Lift Shadow</h3>
          <p className="text-ink-300 text-sm">shadow-lift</p>
        </div>
      </div>
    </div>
  )
}