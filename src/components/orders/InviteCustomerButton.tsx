'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Copy, Loader2, UserPlus } from 'lucide-react'
import { useState } from 'react'

interface InviteCustomerButtonProps {
  orderId: string
  defaultEmail?: string
  defaultName?: string
  className?: string
}

export function InviteCustomerButton({
  orderId,
  defaultEmail = '',
  defaultName = '',
  className,
}: InviteCustomerButtonProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState(defaultEmail)
  const [name, setName] = useState(defaultName)
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState<string | null>(null)

  const reset = () => {
    setEmail(defaultEmail)
    setName(defaultName)
    setLink(null)
    setLoading(false)
  }

  const invite = async () => {
    if (!email.includes('@')) {
      toast({ title: 'Enter a valid email', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/customer-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, email, name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Invite failed')
      setLink(data.link as string)
      toast({
        title: 'Invite link generated',
        description: 'Copy and send it to the customer.',
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Could not create invite',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      toast({ title: 'Link copied' })
    } catch {
      toast({ title: 'Could not copy', variant: 'destructive' })
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={className}
        onClick={() => {
          reset()
          setOpen(true)
        }}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Invite Customer
      </Button>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) reset()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Customer to Portal</DialogTitle>
            <DialogDescription>
              Create a portal account for this customer. A secure link will be
              generated for you to send.
            </DialogDescription>
          </DialogHeader>

          {link ? (
            <div className="space-y-3">
              <Label>Invite link</Label>
              <div className="flex gap-2">
                <Input readOnly value={link} className="font-mono text-xs" />
                <Button onClick={copy} variant="outline" className="shrink-0">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Send this to the customer. They&apos;ll set a password and land
                in their portal.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="cx-email">Customer email</Label>
                <Input
                  id="cx-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cx-name">Customer name (optional)</Label>
                <Input
                  id="cx-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {link ? (
              <Button onClick={() => setOpen(false)}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={invite} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    'Generate invite'
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
