import type { Meta, StoryObj } from '@storybook/react'
import { btnCx } from '../lib/ui/btn'

const meta: Meta = {
  title: 'Components/Button',
  tags: ['autodocs']
}
export default meta

type Story = StoryObj

export const Primary: Story = {
  render: () => <button className={btnCx(undefined, { intent: 'primary' })}>Primary</button>
}

export const Secondary: Story = {
  render: () => <button className={btnCx(undefined, { intent: 'secondary' })}>Secondary</button>
}

export const Ghost: Story = {
  render: () => <button className={btnCx(undefined, { intent: 'ghost' })}>Ghost</button>
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <button className={btnCx(undefined, { intent: 'primary', size: 'sm' })}>Small</button>
      <button className={btnCx(undefined, { intent: 'primary', size: 'md' })}>Medium</button>
      <button className={btnCx(undefined, { intent: 'primary', size: 'lg' })}>Large</button>
    </div>
  )
}