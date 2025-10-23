'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  addSalesperson,
  getSalespeople,
  updateSalesperson,
  deleteSalesperson,
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

type Role = 'admin' | 'manager' | 'salesperson' | 'marketing'
type RoleFromModel = Salesperson['role']
type StatusFromModel = Salesperson extends { status: infer S }
  ? S
  : 'active' | 'inactive'

interface FormState {
  name: string
  email: string
  phone: string
  homeZip: string
  startDate: string // date input value (YYYY-MM-DD)
  location_code: string
  role: RoleFromModel
  prefix: string
  referralCodes: string // CSV / space-separated
  zipcodes: string // CSV / space-separated
}

function toDateInputValue(value: unknown): string {
  if (!value) return ''
  const d = new Date(value as string | number | Date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function ManageSalespeoplePage() {
  const [reps, setReps] = useState<Salesperson[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    homeZip: '',
    startDate: '',
    location_code: 'SD',
    role: 'salesperson',
    prefix: '',
    referralCodes: '',
    zipcodes: '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [reassigning, setReassigning] = useState<string | null>(null)
  const [associatedRecords, setAssociatedRecords] = useState<
    Record<string, { quotes: number; orders: number }>
  >({})
  const [selectedReassignTo, setSelectedReassignTo] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | StatusFromModel>(
    'all'
  )
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const data = await getSalespeople()
      setReps(data)

      // Load associated records for each salesperson
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
    load()
  }, [])

  const handleCreate = async () => {
    setSaving(true)
    try {
      await addSalesperson({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        homeZip: form.homeZip.trim(),
        startDate: form.startDate ? new Date(form.startDate) : undefined,
        location_code: form.location_code.trim(),
        role: form.role,
        referralCodes: form.referralCodes.split(/[,\s]+/).filter(Boolean),
        prefix: form.prefix.trim(),
        zipcodes: form.zipcodes.split(/[,\s]+/).filter(Boolean),
      } as unknown as Salesperson) // keep runtime identical; satisfy service create type
      setForm({
        name: '',
        email: '',
        phone: '',
        homeZip: '',
        startDate: '',
        location_code: 'SD',
        role: 'salesperson',
        prefix: '',
        referralCodes: '',
        zipcodes: '',
      })
      await load()
    } finally {
      setSaving(false)
    }
  }

  const updateRep = async (id: string, data: Partial<Salesperson>) => {
    await updateSalesperson(id, data)
    await load()
  }

  const deleteRep = async (id: string) => {
    setDeleting(id)
    try {
      await deleteSalesperson(id)
      await load()
      toast({
        title: 'Success',
        description: 'Salesperson deleted successfully.',
      })
    } catch (error) {
      console.error('Failed to delete salesperson:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete salesperson'
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
        description: `Reassigned ${result.quotesReassigned} quotes and ${result.ordersReassigned} orders, then deleted salesperson.`,
      })
      setSelectedReassignTo('')
    } catch (error) {
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

  const getRoleIcon = (role: RoleFromModel) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />
      case 'manager':
        return <Crown className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: RoleFromModel) => {
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

    return filtered.slice().sort((a, b) => {
      const roleDiff = roleOrder[a.role as Role] - roleOrder[b.role as Role]
      if (roleDiff !== 0) return roleDiff
      return a.name.localeCompare(b.name)
    })
  }, [reps, roleFilter, statusFilter])

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Manage Salespeople</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Salesperson</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* First line */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Prefix (2–4 letters)</Label>
              <Input
                value={form.prefix}
                onChange={(e) =>
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
                onChange={(e) => setForm({ ...form, zipcodes: e.target.value })}
              />
            </div>
            <div>
              <Label>Referral Codes (comma or space separated)</Label>
              <Input
                value={form.referralCodes}
                onChange={(e) =>
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
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Home Zipcode</Label>
              <Input
                value={form.homeZip}
                onChange={(e) => setForm({ ...form, homeZip: e.target.value })}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(
                  value: 'salesperson' | 'manager' | 'admin' | 'marketing'
                ) => setForm({ ...form, role: value })}
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
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Location Code</Label>
              <Input
                value={form.location_code}
                onChange={(e) =>
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
          <CardTitle>Salespeople</CardTitle>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label htmlFor="role-filter">Filter by Role:</Label>
              <Select
                value={roleFilter}
                onValueChange={(value: 'all' | Role) => setRoleFilter(value)}
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
                onValueChange={(value: 'all' | StatusFromModel) =>
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
              <div className="text-sm text-muted-foreground">Sales People</div>
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
                      onBlur={(e) =>
                        updateRep(rep.id, { name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Prefix</Label>
                    <Input
                      defaultValue={rep.prefix ?? ''}
                      onBlur={(e) =>
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
                      onBlur={(e) =>
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
                      onBlur={(e) =>
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
                      onBlur={(e) =>
                        updateRep(rep.id, { email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      defaultValue={rep.phone ?? ''}
                      onBlur={(e) =>
                        updateRep(rep.id, { phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Home Zipcode</Label>
                    <Input
                      defaultValue={rep.homeZip ?? ''}
                      onBlur={(e) =>
                        updateRep(rep.id, { homeZip: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select
                      defaultValue={rep.role}
                      onValueChange={(value: RoleFromModel) =>
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
                      defaultValue={toDateInputValue(rep.startDate as unknown)}
                      onBlur={(e) =>
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
                      defaultValue={rep.location_code}
                      onBlur={(e) =>
                        updateRep(rep.id, { location_code: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2">{/* spacer */}</div>
                </div>

                <div className="flex gap-2 justify-end items-center">
                  {/* Show associated records count */}
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
                        status:
                          rep.status === 'active'
                            ? ('inactive' as StatusFromModel)
                            : ('active' as StatusFromModel),
                      })
                    }
                  >
                    {rep.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>

                  <AlertDialog>
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
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Delete Salesperson
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {rep.role === 'admin' ? (
                            <div className="space-y-2">
                              <p className="text-destructive font-semibold">
                                Cannot delete <strong>{rep.name}</strong>{' '}
                                because they have Admin role.
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Admin users cannot be deleted for security
                                reasons. Consider deactivating them instead.
                              </p>
                            </div>
                          ) : associatedRecords[rep.id] &&
                            (associatedRecords[rep.id].quotes > 0 ||
                              associatedRecords[rep.id].orders > 0) ? (
                            <div className="space-y-4">
                              <p>
                                Cannot delete <strong>{rep.name}</strong>{' '}
                                because they have associated records:
                              </p>
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

                              <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                  You can reassign these records to another
                                  salesperson and then delete:
                                </p>
                                <div className="space-y-2">
                                  <Label htmlFor="reassign-to">
                                    Reassign to:
                                  </Label>
                                  <Select
                                    value={selectedReassignTo}
                                    onValueChange={setSelectedReassignTo}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a salesperson" />
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
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p>
                              Are you sure you want to delete{' '}
                              <strong>{rep.name}</strong>? This action cannot be
                              undone.
                            </p>
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
                        ) : (
                          <AlertDialogAction
                            onClick={() => deleteRep(rep.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Permanently
                          </AlertDialogAction>
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
    </main>
  )
}
