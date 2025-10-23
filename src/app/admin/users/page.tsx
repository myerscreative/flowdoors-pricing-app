// src/app/admin/users/page.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from 'firebase/functions'
import { app } from '@/lib/firebaseClient'
import { Label } from '@/components/ui/label'
import {
  getSalespeople,
  updateSalesperson,
  deleteSalesperson,
  forceDeleteSalesperson,
  getSalespersonAssociatedRecords,
  reassignSalespersonRecords,
  type Salesperson,
} from '@/services/salesService'
import {
  Trash2,
  AlertTriangle,
  FileText,
  ShoppingCart,
  UserPlus,
  Crown,
  User,
  Shield,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Local role union used for filters/sorting and UI.
 */
type Role = 'admin' | 'manager' | 'salesperson' | 'marketing'

/**
 * Extend the upstream Salesperson shape with optional fields
 * that this page reads/updates. This avoids `any` while not
 * forcing changes to the shared service type.
 */
type SalespersonExtended = Salesperson & {
  prefix?: string
  referralCodes?: string[]
  zipcodes?: string[]
  phone?: string
  homeZip?: string
  startDate?: string | Date | null
  location_code?: string
  status?: 'active' | 'inactive'
}

/**
 * Narrow the surface of what we send to update calls.
 */
type Updatable = Partial<
  Omit<SalespersonExtended, 'id' | 'createdAt' | 'updatedAt'>
>

type FormState = {
  name: string
  email: string
  phone: string
  homeZip: string
  startDate: string
  location_code: string
  role: Role
  prefix: string
  referralCodes: string
  zipcodes: string
}

export default function ManageUsersPage() {
  const [reps, setReps] = useState<SalespersonExtended[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    homeZip: '',
    startDate: new Date().toISOString().split('T')[0], // Default to today's date
    location_code: 'SD',
    role: 'salesperson',
    prefix: '',
    referralCodes: '',
    zipcodes: '',
  })
  const handleResetPassword = async (email: string) => {
    try {
      const functions = getFunctions()
      const resetUserPassword = httpsCallable(functions, 'resetUserPassword')
      const result = await resetUserPassword({ email })
      const link = (result.data as { link?: string })?.link
      toast({
        title: 'Password Reset Link',
        description: link || 'Reset link generated.',
      })
      console.warn('Reset link:', link)
    } catch (error: unknown) {
      console.error('Failed to reset password:', error)
      const msg = error instanceof Error ? error.message : 'Reset failed'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    }
  }

  const handleAssignPassword = async (email: string, password: string) => {
    setAssigningPassword(email)
    try {
      const response = await fetch('/api/users/assign-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Password Assigned',
          description: `Password set for ${email}. User can now log in.`,
        })
        setPasswordDialog(null)
        // Reload the list to update status
        await load()
      } else {
        throw new Error(result.error || 'Failed to assign password')
      }
    } catch (error: unknown) {
      console.error('Failed to assign password:', error)
      const msg = error instanceof Error ? error.message : 'Assignment failed'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setAssigningPassword(null)
    }
  }

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [reassigning, setReassigning] = useState<string | null>(null)
  const [associatedRecords, setAssociatedRecords] = useState<
    Record<string, { quotes: number; orders: number }>
  >({})
  const [selectedReassignTo, setSelectedReassignTo] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<
    'all' | 'salesperson' | 'manager' | 'admin' | 'marketing'
  >('all')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all')
  const [assigningPassword, setAssigningPassword] = useState<string | null>(
    null
  )
  const [passwordDialog, setPasswordDialog] = useState<{
    email: string
    password: string
  } | null>(null)
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const data = await getSalespeople()
      // widen to our extended type locally
      setReps(data as SalespersonExtended[])

      // Load associated records for each user
      const recordsData: Record<string, { quotes: number; orders: number }> = {}
      for (const rep of data) {
        recordsData[rep.id] = await getSalespersonAssociatedRecords(rep.id)
      }
      setAssociatedRecords(recordsData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleCreate = async () => {
    setSaving(true)
    try {
      // Try Firebase Cloud Function first, fallback to API route if it fails
      let data: {
        success: boolean
        uid: string
        resetLink: string
        message: string
      }

      try {
        console.warn('Attempting Firebase Cloud Function...')
        const functions = getFunctions(app, 'us-central1')

        // Connect to emulator in development
        if (process.env.NODE_ENV === 'development') {
          try {
            connectFunctionsEmulator(functions, 'localhost', 5001)
            console.warn('Connected to Functions emulator')
          } catch {
            console.warn(
              'Functions emulator already connected or not available'
            )
          }
        }

        const createUserWithRole = httpsCallable(
          functions,
          'createUserWithRole'
        )
        const result = await createUserWithRole({
          email: form.email.trim(),
          role: form.role,
          // Additional user data for the user record
          name: form.name.trim(),
          phone: form.phone.trim(),
          homeZip: form.homeZip.trim(),
          startDate: form.startDate || undefined,
          location_code: form.location_code.trim(),
          referralCodes: form.referralCodes.split(/[,\s]+/).filter(Boolean),
          prefix: form.prefix.trim(),
          zipcodes: form.zipcodes.split(/[,\s]+/).filter(Boolean),
        })

        data = result.data as {
          success: boolean
          uid: string
          resetLink: string
          message: string
        }
        console.warn('Firebase function succeeded:', data)
      } catch (firebaseError) {
        console.warn(
          'Firebase function failed, falling back to API route:',
          firebaseError
        )

        // Fallback to API route
        const response = await fetch('/api/users/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            homeZip: form.homeZip.trim(),
            startDate: form.startDate || undefined,
            location_code: form.location_code.trim(),
            role: form.role,
            referralCodes: form.referralCodes.split(/[,\s]+/).filter(Boolean),
            prefix: form.prefix.trim(),
            zipcodes: form.zipcodes.split(/[,\s]+/).filter(Boolean),
          }),
        })

        if (!response.ok) {
          const contentType = response.headers.get('content-type')
          if (contentType?.includes('application/json')) {
            const errorData: { error?: string } = await response.json()
            throw new Error(
              errorData.error ||
                `HTTP ${response.status}: ${response.statusText}`
            )
          } else {
            const errorText = await response.text()
            console.error('Non-JSON response:', errorText)
            throw new Error(
              `Server error: ${response.status} ${response.statusText}`
            )
          }
        }

        const apiData = await response.json()

        // For API route, we need to generate a manual activation link
        // since the API route doesn't create Firebase Auth users
        const activationLink = `${window.location.origin}/activate-account?token=${apiData.activation_token || 'manual'}&email=${encodeURIComponent(form.email.trim())}`

        data = {
          success: true,
          uid: apiData.id || 'unknown',
          resetLink: activationLink, // Generate manual activation link
          message:
            apiData.message ||
            'User created successfully. Use the activation link below to set up the account.',
        }
        console.warn('API route succeeded:', data)
      }

      // Check if resetLink exists and create appropriate toast description
      const toastDescription = data.resetLink ? (
        <div className="space-y-2">
          <div>
            {data.message || 'User created successfully. Welcome email sent.'}
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">Password Reset Link:</div>
            <a
              href={data.resetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
              onClick={(e) => {
                e.preventDefault()
                navigator.clipboard.writeText(data.resetLink!)
                toast({
                  title: 'Link Copied',
                  description: 'Reset link copied to clipboard',
                })
              }}
            >
              {data.resetLink}
            </a>
            <div className="text-xs text-muted-foreground">
              Click to copy link to clipboard
            </div>
          </div>
        </div>
      ) : (
        data.message || 'User created successfully. Welcome email sent.'
      )

      toast({
        title: 'Success',
        description: toastDescription,
      })
      setForm({
        name: '',
        email: '',
        phone: '',
        homeZip: '',
        startDate: new Date().toISOString().split('T')[0], // Reset to today's date
        location_code: 'SD',
        role: 'salesperson',
        prefix: '',
        referralCodes: '',
        zipcodes: '',
      })
      await load()
    } catch (error: unknown) {
      console.error('Failed to create user:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create user'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateRep = async (id: string, data: Updatable) => {
    await updateSalesperson(id, data)
    await load()
  }

  const deleteRep = async (id: string) => {
    setDeleting(id)
    try {
      // First get the user data to check for firebase_uid
      const salesperson = reps.find((rep) => rep.id === id)
      const firebaseUid = salesperson?.firebase_uid

      // Delete from Firestore
      await deleteSalesperson(id)

      // Delete Firebase Auth user if firebase_uid exists
      if (firebaseUid) {
        try {
          const response = await fetch('/api/delete-firebase-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firebaseUid }),
          })

          if (!response.ok) {
            console.warn(
              'Failed to delete Firebase Auth user, but Firestore deletion succeeded'
            )
          }
        } catch (authError) {
          console.warn('Failed to delete Firebase Auth user:', authError)
          // Don't fail the entire operation if Auth deletion fails
        }
      }

      await load()
      toast({
        title: 'Success',
        description: 'User deleted successfully.',
      })
    } catch (error: unknown) {
      console.error('Failed to delete user:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete user'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setDeleting(null)
    }
  }

  const forceDeleteRep = async (id: string, email: string) => {
    setDeleting(id)
    try {
      // First get the user data to check for firebase_uid
      const salesperson = reps.find((rep) => rep.id === id)
      const firebaseUid = salesperson?.firebase_uid

      // Force delete from Firestore (bypasses associated records check)
      await forceDeleteSalesperson(id, email)

      // Delete Firebase Auth user if firebase_uid exists
      if (firebaseUid) {
        try {
          const response = await fetch('/api/delete-firebase-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firebaseUid }),
          })

          if (!response.ok) {
            console.warn(
              'Failed to delete Firebase Auth user, but Firestore deletion succeeded'
            )
          }
        } catch (authError) {
          console.warn('Failed to delete Firebase Auth user:', authError)
          // Don't fail the entire operation if Auth deletion fails
        }
      }

      await load()
      toast({
        title: 'Success',
        description:
          'User force deleted successfully (bypassed associated records check).',
      })
    } catch (error: unknown) {
      console.error('Failed to force delete user:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to force delete user'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setDeleting(null)
    }
  }

  const reassignAndDelete = async (fromId: string, toId: string) => {
    setReassigning(fromId)
    try {
      const result = await reassignSalespersonRecords(fromId, toId)
      await deleteRep(fromId)
      toast({
        title: 'Success',
        description: `Reassigned ${result.quotesReassigned} quotes and ${result.ordersReassigned} orders, then deleted user.`,
      })
      setSelectedReassignTo('')
    } catch (error: unknown) {
      console.error('Failed to reassign and delete:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to reassign and delete'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setReassigning(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />
      case 'manager':
        return <Crown className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'manager':
        return 'default'
      default:
        return 'secondary'
    }
  }

  // Filter and sort salespeople
  const filteredAndSortedReps = useMemo(() => {
    let filtered = reps

    if (roleFilter !== 'all') {
      filtered = filtered.filter((rep) => rep.role === roleFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((rep) => rep.status === statusFilter)
    }

    const roleOrder: Record<Role, number> = {
      admin: 0,
      manager: 1,
      salesperson: 2,
      marketing: 3,
    }

    return filtered.sort((a, b) => {
      const roleDiff = roleOrder[a.role as Role] - roleOrder[b.role as Role]
      if (roleDiff !== 0) return roleDiff
      return a.name.localeCompare(b.name)
    })
  }, [reps, roleFilter, statusFilter])

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* First line */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Prefix (2–4 letters)</Label>
              <Input
                value={form.prefix}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({
                    ...form,
                    prefix: e.target.value.toUpperCase().slice(0, 4),
                  })
                }
              />
            </div>
            <div>
              <Label>Zipcodes (comma or space separated)</Label>
              <Input
                value={form.zipcodes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, zipcodes: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Referral Codes (comma or space separated)</Label>
              <Input
                value={form.referralCodes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, referralCodes: e.target.value })
                }
              />
            </div>
          </div>
          {/* Second line */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Home Zipcode</Label>
              <Input
                value={form.homeZip}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, homeZip: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(value: Role) =>
                  setForm({ ...form, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salesperson">Sales Person</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Third line */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Location Code</Label>
              <Input
                value={form.location_code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, location_code: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">{/* spacer */}</div>
          </div>
          <div className="flex justify-end">
            <Button
              disabled={saving || !form.name || !form.email}
              onClick={handleCreate}
            >
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label htmlFor="role-filter">Filter by Role:</Label>
              <Select
                value={roleFilter}
                onValueChange={(
                  value:
                    | 'all'
                    | 'salesperson'
                    | 'manager'
                    | 'admin'
                    | 'marketing'
                ) => setRoleFilter(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="salesperson">Sales Person</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter">Filter by Status:</Label>
              <Select
                value={statusFilter}
                onValueChange={(value: 'all' | 'active' | 'inactive') =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedReps.length} of {reps.length}{' '}
              salespeople
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary section */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {reps.filter((r) => r.role === 'admin').length}
              </div>
              <div className="text-sm text-muted-foreground">Admin</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {reps.filter((r) => r.role === 'manager').length}
              </div>
              <div className="text-sm text-muted-foreground">Managers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {reps.filter((r) => r.role === 'salesperson').length}
              </div>
              <div className="text-sm text-muted-foreground">Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">
                {reps.filter((r) => r.role === 'marketing').length}
              </div>
              <div className="text-sm text-muted-foreground">Marketing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {reps.filter((r) => r.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : filteredAndSortedReps.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {reps.length === 0
                ? 'No salespeople yet.'
                : 'No salespeople match the current filters.'}
            </div>
          ) : (
            filteredAndSortedReps.map((rep) => (
              <div key={rep.id} className="rounded-lg border p-3 space-y-3">
                {/* Header with name and role */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{rep.name}</h3>
                    <Badge
                      variant={getRoleBadgeVariant(rep.role)}
                      className="flex items-center gap-1"
                    >
                      {getRoleIcon(rep.role)}
                      {rep.role === 'salesperson'
                        ? 'Sales Person'
                        : rep.role.charAt(0).toUpperCase() + rep.role.slice(1)}
                    </Badge>
                    <Badge
                      variant={
                        rep.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {rep.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                {/* First line */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      defaultValue={rep.name}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                        updateRep(rep.id, { name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Prefix</Label>
                    <Input
                      defaultValue={rep.prefix ?? ''}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                        updateRep(rep.id, {
                          prefix: e.target.value.toUpperCase().slice(0, 4),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Zipcodes</Label>
                    <Input
                      defaultValue={(rep.zipcodes ?? []).join(', ')}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                        updateRep(rep.id, {
                          zipcodes: e.target.value
                            .split(/[,\s]+/)
                            .filter(Boolean),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Referral Codes</Label>
                    <Input
                      defaultValue={(rep.referralCodes ?? []).join(', ')}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                        updateRep(rep.id, {
                          referralCodes: e.target.value
                            .split(/[,\s]+/)
                            .filter(Boolean),
                        })
                      }
                    />
                  </div>
                </div>

                {/* Second line */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      defaultValue={rep.email}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                        updateRep(rep.id, { email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      defaultValue={rep.phone ?? ''}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                        updateRep(rep.id, { phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Home Zipcode</Label>
                    <Input
                      defaultValue={rep.homeZip ?? ''}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                        updateRep(rep.id, { homeZip: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select
                      defaultValue={rep.role}
                      onValueChange={(value: Role) =>
                        updateRep(rep.id, { role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salesperson">
                          Sales Person
                        </SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Third line */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      defaultValue={
                        rep.startDate
                          ? new Date(rep.startDate).toISOString().slice(0, 10)
                          : ''
                      }
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                        updateRep(rep.id, {
                          startDate: e.target.value
                            ? new Date(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Location Code</Label>
                    <Input
                      defaultValue={rep.location_code ?? ''}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                        updateRep(rep.id, { location_code: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2">{/* spacer */}</div>
                </div>

                <div className="flex gap-2 justify-end items-center">
                  {/* associated records */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mr-4">
                    {associatedRecords[rep.id] && (
                      <>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{associatedRecords[rep.id].quotes} quotes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="h-4 w-4" />
                          <span>{associatedRecords[rep.id].orders} orders</span>
                        </div>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() =>
                      updateRep(rep.id, {
                        status: rep.status === 'active' ? 'inactive' : 'active',
                      })
                    }
                  >
                    {rep.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>

                  <AlertDialog>
                    <div className="flex gap-2">
                      {/* Assign Password button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPasswordDialog({ email: rep.email, password: '' })
                        }
                        disabled={assigningPassword === rep.email}
                      >
                        {assigningPassword === rep.email
                          ? 'Assigning...'
                          : 'Assign Password'}
                      </Button>

                      {/* Reset Password button – only for non-admin users */}
                      {rep.role !== 'admin' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleResetPassword(rep.email)}
                        >
                          Reset Password
                        </Button>
                      )}

                      {/* Delete button wrapped in AlertDialogTrigger */}
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={
                            deleting === rep.id ||
                            rep.role === 'admin' ||
                            (associatedRecords[rep.id] &&
                              (associatedRecords[rep.id].quotes > 0 ||
                                associatedRecords[rep.id].orders > 0))
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deleting === rep.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </AlertDialogTrigger>
                    </div>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Delete Salesperson
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {rep.role === 'admin' ? (
                            <span className="block space-y-2">
                              <span className="block text-destructive font-semibold">
                                Cannot delete <strong>{rep.name}</strong>{' '}
                                because they have Admin role.
                              </span>
                              <span className="block text-sm text-muted-foreground">
                                Admin users cannot be deleted for security
                                reasons. Consider deactivating them instead.
                              </span>
                            </span>
                          ) : associatedRecords[rep.id] &&
                            (associatedRecords[rep.id].quotes > 0 ||
                              associatedRecords[rep.id].orders > 0) ? (
                            <span className="block space-y-4">
                              <span className="block">
                                Cannot delete <strong>{rep.name}</strong>{' '}
                                because they have associated records:
                              </span>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {associatedRecords[rep.id].quotes > 0 && (
                                  <li>
                                    {associatedRecords[rep.id].quotes} quote(s)
                                  </li>
                                )}
                                {associatedRecords[rep.id].orders > 0 && (
                                  <li>
                                    {associatedRecords[rep.id].orders} order(s)
                                  </li>
                                )}
                              </ul>

                              <span className="block space-y-3">
                                <span className="block text-sm text-muted-foreground">
                                  You can reassign these records to another user
                                  and then delete:
                                </span>
                                <span className="block space-y-2">
                                  <Label htmlFor="reassign-to">
                                    Reassign to:
                                  </Label>
                                  <Select
                                    value={selectedReassignTo}
                                    onValueChange={setSelectedReassignTo}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {reps
                                        .filter(
                                          (otherRep) =>
                                            otherRep.id !== rep.id &&
                                            otherRep.status === 'active'
                                        )
                                        .map((otherRep) => (
                                          <SelectItem
                                            key={otherRep.id}
                                            value={otherRep.id}
                                          >
                                            {otherRep.name} (
                                            {otherRep.role === 'salesperson'
                                              ? 'Sales Person'
                                              : otherRep.role
                                                  .charAt(0)
                                                  .toUpperCase() +
                                                otherRep.role.slice(1)}
                                            )
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </span>
                              </span>
                            </span>
                          ) : (
                            <span className="block">
                              Are you sure you want to delete{' '}
                              <strong>{rep.name}</strong>? This action cannot be
                              undone.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={() => setSelectedReassignTo('')}
                        >
                          Cancel
                        </AlertDialogCancel>
                        {rep.role === 'admin' ? null : associatedRecords[
                            rep.id
                          ] &&
                          (associatedRecords[rep.id].quotes > 0 ||
                            associatedRecords[rep.id].orders > 0) ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={() =>
                                reassignAndDelete(rep.id, selectedReassignTo)
                              }
                              disabled={
                                !selectedReassignTo || reassigning === rep.id
                              }
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              {reassigning === rep.id
                                ? 'Reassigning...'
                                : 'Reassign & Delete'}
                            </Button>
                            {rep.name === 'Robert M' &&
                              rep.email === 'myersgroup@gmail.com' && (
                                <Button
                                  onClick={() =>
                                    forceDeleteRep(rep.id, rep.email)
                                  }
                                  disabled={deleting === rep.id}
                                  className="bg-orange-600 text-white hover:bg-orange-700"
                                >
                                  Force Delete (Bypass Checks)
                                </Button>
                              )}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <AlertDialogAction
                              onClick={() => deleteRep(rep.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Permanently
                            </AlertDialogAction>
                            {rep.name === 'Robert M' &&
                              rep.email === 'myersgroup@gmail.com' && (
                                <AlertDialogAction
                                  onClick={() =>
                                    forceDeleteRep(rep.id, rep.email)
                                  }
                                  className="bg-orange-600 text-white hover:bg-orange-700"
                                >
                                  Force Delete (Bypass Checks)
                                </AlertDialogAction>
                              )}
                          </div>
                        )}
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Password Assignment Dialog */}
      {passwordDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assign Password</h3>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  value={passwordDialog.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={passwordDialog.password}
                  onChange={(e) =>
                    setPasswordDialog({
                      ...passwordDialog,
                      password: e.target.value,
                    })
                  }
                  placeholder="Enter new password"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters with uppercase,
                  lowercase, number, and special character.
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setPasswordDialog(null)}
                  disabled={assigningPassword === passwordDialog.email}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleAssignPassword(
                      passwordDialog.email,
                      passwordDialog.password
                    )
                  }
                  disabled={
                    !passwordDialog.password ||
                    assigningPassword === passwordDialog.email
                  }
                >
                  {assigningPassword === passwordDialog.email
                    ? 'Assigning...'
                    : 'Assign Password'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
