'use client'

import { useState } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

export default function TestResetPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleReset = async () => {
    setLoading(true)
    try {
      const functions = getFunctions()
      const resetUserPassword = httpsCallable(functions, 'resetUserPassword')
      const result = await resetUserPassword({ email })
      const link = (result.data as { link?: string })?.link

      if (link) {
        console.warn('Reset link:', link)
        toast({
          title: 'Reset link generated',
          description: (
            <div className="flex flex-col gap-2">
              <span>Click below to copy the link:</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(link)
                  toast({
                    title: 'Copied!',
                    description: 'Reset link copied to clipboard.',
                  })
                }}
              >
                Copy Link
              </Button>
            </div>
          ),
        })
      } else {
        toast({
          title: 'Error',
          description: 'No link returned from function.',
          variant: 'destructive',
        })
      }
    } catch (error: unknown) {
      console.error('Reset failed:', error)
      const msg = error instanceof Error ? error.message : 'Reset failed'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Test Reset Function</h1>
      <Input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="max-w-md"
      />
      <Button onClick={handleReset} disabled={loading || !email}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </main>
  )
}
