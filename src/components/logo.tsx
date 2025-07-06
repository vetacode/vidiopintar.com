import { cn } from '@/lib/utils'

export const Logo = ({ className }: { className?: string }) => {
    return (
        <span className={cn('flex items-center space-x-2 tracking-tigh', className)}>
            Vidiopintar
        </span>
    )
}

