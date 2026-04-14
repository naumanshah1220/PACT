interface AvatarProps {
  initials: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Avatar({ initials, size = 'md', className = '' }: AvatarProps) {
  const sizes = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
  }
  return (
    <div
      className={`rounded-full bg-[#f0ede6] border border-[#d8d4cc] flex items-center justify-center font-mono font-medium shrink-0 ${sizes[size]} ${className}`}
    >
      {initials.toUpperCase()}
    </div>
  )
}
