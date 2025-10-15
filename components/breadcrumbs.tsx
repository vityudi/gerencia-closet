"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Breadcrumbs() {
  const pathname = usePathname()
  const parts = pathname.split('/').filter(Boolean)
  const items = parts.map((part, idx) => {
    const href = '/' + parts.slice(0, idx + 1).join('/')
    return { label: decodeURIComponent(part), href }
  })
  if (items.length === 0) return null
  return (
    <div className="text-sm text-muted-foreground">
      <nav className="flex items-center gap-1">
        <Link className="hover:underline" href="/">Home</Link>
        {items.map((item, idx) => (
          <span key={item.href} className="flex items-center gap-1">
            <span>/</span>
            {idx === items.length - 1 ? (
              <span className="text-foreground">{item.label}</span>
            ) : (
              <Link className="hover:underline" href={item.href}>{item.label}</Link>
            )}
          </span>
        ))}
      </nav>
    </div>
  )
}


