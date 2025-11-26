import Link from 'next/link'

interface LogoProps {
  variant?: 'full' | 'icon' | 'text'
  href?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Logo({ 
  variant = 'full', 
  href,
  className = '',
  size = 'md'
}: LogoProps) {
  // Logo aspect ratio is ~229:285 (width:height), so it's taller than wide
  const sizeConfig = {
    sm: { height: '40px' },
    md: { height: '56px' },
    lg: { height: '80px' }
  }

  const content = (
    <div 
      className={`inline-flex items-center ${className}`} 
      style={{
        ...sizeConfig[size],
        background: 'transparent'
      }}
    >
      {variant === 'full' && (
        <img
          src="/logo.svg"
          alt="Vibepoint"
          className="h-full w-auto block"
          style={{ 
            height: '100%', 
            width: 'auto',
            display: 'block',
            background: 'transparent'
          }}
          onError={(e) => {
            console.error('Logo failed to load:', e)
          }}
        />
      )}
      {variant === 'icon' && (
        <img
          src="/logo-icon.svg"
          alt="Vibepoint"
          className="h-full w-auto block"
          style={{ 
            height: '100%', 
            width: 'auto',
            display: 'block'
          }}
          onError={(e) => {
            console.error('Logo icon failed to load:', e)
          }}
        />
      )}
      {variant === 'text' && (
        <span className="text-2xl font-bold text-gray-900">Vibepoint</span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    )
  }

  return content
}

