import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'gold' | 'success' | 'warning' | 'danger'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        {
          'bg-purple-800/60 text-purple-200 border border-purple-600/40': variant === 'default',
          'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40': variant === 'gold',
          'bg-green-500/20 text-green-300 border border-green-500/40': variant === 'success',
          'bg-orange-500/20 text-orange-300 border border-orange-500/40': variant === 'warning',
          'bg-red-500/20 text-red-300 border border-red-500/40': variant === 'danger',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
