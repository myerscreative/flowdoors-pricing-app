'use client'

import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/firebaseClient'
import { signOut } from 'firebase/auth'
import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface PortalHeaderProps {
  email?: string
}

export function PortalHeader({ email }: PortalHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error('Sign out error', err)
    }
    router.push('/portal/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/portal"
          className="text-lg font-semibold tracking-tight hover:opacity-80"
        >
          FlowDoors
          <span className="ml-2 text-xs font-normal uppercase tracking-wider text-muted-foreground">
            Customer Portal
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {email ? (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {email}
            </span>
          ) : null}
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="rounded-lg"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
