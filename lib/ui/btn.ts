import { cva, type VariantProps } from 'class-variance-authority'
import clsx from 'clsx'

export const btn = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gold-500 focus-visible:ring-offset-bg-900 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      intent: {
        primary: 'bg-gold-400 text-bg-900 hover:bg-gold-500 shadow-lift',
        secondary: 'bg-edge-700 text-ink-100 hover:bg-edge-600 shadow-soft',
        ghost: 'bg-transparent text-ink-100 hover:bg-edge-700',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-5 text-base'
      }
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md'
    }
  }
)

export type BtnProps = VariantProps<typeof btn> & {
  className?: string
}

export function btnCx(className?: string, variants?: BtnProps) {
  return clsx(btn(variants), className)
}