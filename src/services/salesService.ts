/* src/services/salesService.ts */
'use client'

import type { Salesperson as SalespersonType } from '@/lib/types'

// Match project-wide type: prefer alias over empty-extends interface
export type Salesperson = SalespersonType

// Data required to create a new salesperson
export type NewSalespersonData = Pick<
  Salesperson,
  | 'name'
  | 'email'
  | 'phone'
  | 'homeZip'
  | 'startDate'
  | 'location_code'
  | 'role'
  | 'referralCodes'
  | 'prefix'
  | 'zipcodes'
>

/** Narrow Firestore Timestamp-like values into Date (or undefined) without using `any`. */
function toMaybeDate(v: unknown): Date | undefined {
  if (v instanceof Date) return v
  if (v && typeof v === 'object' && 'toDate' in v) {
    const maybe = v as { toDate?: () => Date }
    if (typeof maybe.toDate === 'function') {
      try {
        return maybe.toDate()
      } catch {
        return undefined
      }
    }
  }
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v)
    return Number.isNaN(d.getTime()) ? undefined : d
  }
  return undefined
}

export async function addSalesperson(
  data: NewSalespersonData
): Promise<string> {
  try {
    const { db } = await import('@/lib/firebaseClient')
    const { collection, addDoc, serverTimestamp } = await import(
      'firebase/firestore'
    )

    // Placeholder; a robust system would generate this server-side to ensure uniqueness.
    const salesperson_id = `SP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    const docRef = await addDoc(collection(db, 'salespeople'), {
      ...data,
      startDate: data.startDate || new Date(), // Provide default startDate if undefined
      salesperson_id,
      status: 'active', // Default status for new salespeople
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
    console.warn('Salesperson added with ID: ', docRef.id)
    return docRef.id
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('Error adding salesperson: ', e)
    throw new Error(`Failed to save salesperson to database: ${msg}`)
  }
}

export async function getSalespeople(): Promise<Salesperson[]> {
  try {
    const { db } = await import('@/lib/firebaseClient')
    const { collection, getDocs, query, orderBy } = await import(
      'firebase/firestore'
    )

    const q = query(
      collection(db, 'salespeople'),
      orderBy('created_at', 'desc')
    )
    const querySnapshot = await getDocs(q)

    const salespeople = querySnapshot.docs.map((d) => {
      const data = d.data() as Record<string, unknown>
      return {
        id: d.id,
        salesperson_id: String(data.salesperson_id ?? ''),
        firebase_uid: (data.firebase_uid as string | undefined) ?? '',
        name: String(data.name ?? ''),
        email: String(data.email ?? ''),
        location_code: String(data.location_code ?? ''),
        role: String(data.role ?? ''),
        status: String(data.status ?? ''),
        prefix: (data.prefix as string | undefined) ?? '',
        zipcodes: (Array.isArray(data.zipcodes)
          ? (data.zipcodes as unknown[])
          : []
        ).map((z) => String(z)),
        phone: String(data.phone ?? ''),
        homeZip: String(data.homeZip ?? ''),
        referralCodes: (Array.isArray(data.referralCodes)
          ? (data.referralCodes as unknown[])
          : []
        ).map((c) => String(c)),
        created_at: toMaybeDate(data.created_at) ?? new Date(),
        updated_at: toMaybeDate(data.updated_at) ?? new Date(),
      } as Salesperson
    })

    return salespeople
  } catch (error) {
    console.error('Error getting salespeople:', error)
    throw error
  }
}

export async function updateSalesperson(
  id: string,
  data: Partial<Salesperson>
): Promise<void> {
  try {
    const { db } = await import('@/lib/firebaseClient')
    const { doc, updateDoc, serverTimestamp } = await import(
      'firebase/firestore'
    )

    const salespersonRef = doc(db, 'salespeople', id)

    // Exclude any accidental 'id' field from being written
    const updateData: Partial<Salesperson> & Record<string, unknown> = {
      ...data,
    }
    delete (updateData as Record<string, unknown>).id

    await updateDoc(salespersonRef, {
      ...updateData,
      updated_at: serverTimestamp(),
    })
    console.warn(`Salesperson with ID ${id} updated.`)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('Error updating salesperson: ', e)
    throw new Error(`Failed to update salesperson in database: ${msg}`)
  }
}

export async function deleteSalesperson(id: string): Promise<void> {
  try {
    const { db } = await import('@/lib/firebaseClient')
    const { doc, getDoc, query, collection, where, getDocs, deleteDoc } =
      await import('firebase/firestore')

    const salespersonRef = doc(db, 'salespeople', id)

    // Get the salesperson data first to check for associated records
    const salespersonDoc = await getDoc(salespersonRef)
    if (!salespersonDoc.exists()) {
      throw new Error('Salesperson not found')
    }

    const salespersonData = salespersonDoc.data() as Record<string, unknown>
    const salespersonName = String(salespersonData.name ?? '')

    const _firebaseUid = String(salespersonData.firebase_uid ?? '')

    // Check for associated quotes
    const quotesQuery = query(
      collection(db, 'quotes'),
      where('salesRep', '==', salespersonName)
    )
    const quotesSnapshot = await getDocs(quotesQuery)

    // Check for associated orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('salesRep', '==', salespersonName)
    )
    const ordersSnapshot = await getDocs(ordersQuery)

    if (!quotesSnapshot.empty || !ordersSnapshot.empty) {
      const quoteCount = quotesSnapshot.size
      const orderCount = ordersSnapshot.size
      throw new Error(
        `Cannot delete salesperson "${salespersonName}" because they have ${quoteCount} associated quote(s) and ${orderCount} associated order(s). ` +
          `Please reassign or delete these records first.`
      )
    }

    // Note: Firebase Auth user deletion is handled by the API route
    // to avoid importing firebase-admin in client-side code

    // Delete Firestore document
    await deleteDoc(salespersonRef)
    console.warn(`Salesperson with ID ${id} deleted from Firestore.`)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('Error deleting salesperson: ', e)
    throw new Error(`Failed to delete salesperson from the database: ${msg}`)
  }
}

// Temporary function to force delete Robert Myers (myersgroup@gmail.com) bypassing associated records check
export async function forceDeleteSalesperson(
  id: string,
  email: string
): Promise<void> {
  try {
    const { db } = await import('@/lib/firebaseClient')
    const { doc, getDoc, deleteDoc } = await import('firebase/firestore')

    const salespersonRef = doc(db, 'salespeople', id)

    // Get the salesperson data first
    const salespersonDoc = await getDoc(salespersonRef)
    if (!salespersonDoc.exists()) {
      throw new Error('Salesperson not found')
    }

    const salespersonData = salespersonDoc.data() as Record<string, unknown>
    const salespersonEmail = String(salespersonData.email ?? '')

    // Only allow force delete for specific email
    if (salespersonEmail !== email) {
      throw new Error(
        `Force delete only allowed for ${email}, not ${salespersonEmail}`
      )
    }

    console.warn(
      `Force deleting salesperson with ID ${id} and email ${email} (bypassing associated records check)`
    )

    // Delete Firestore document without checking associated records
    await deleteDoc(salespersonRef)
    console.warn(`Salesperson with ID ${id} force deleted from Firestore.`)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('Error force deleting salesperson: ', e)
    throw new Error(
      `Failed to force delete salesperson from the database: ${msg}`
    )
  }
}

export async function getSalespersonAssociatedRecords(
  id: string
): Promise<{ quotes: number; orders: number }> {
  try {
    const { db } = await import('@/lib/firebaseClient')
    const { doc, getDoc, query, collection, where, getDocs } = await import(
      'firebase/firestore'
    )

    const salespersonRef = doc(db, 'salespeople', id)
    const salespersonDoc = await getDoc(salespersonRef)

    if (!salespersonDoc.exists()) {
      return { quotes: 0, orders: 0 }
    }

    const salespersonData = salespersonDoc.data() as Record<string, unknown>
    const salespersonName = String(salespersonData.name ?? '')

    // Check for associated quotes
    const quotesQuery = query(
      collection(db, 'quotes'),
      where('salesRep', '==', salespersonName)
    )
    const quotesSnapshot = await getDocs(quotesQuery)

    // Check for associated orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('salesRep', '==', salespersonName)
    )
    const ordersSnapshot = await getDocs(ordersQuery)

    return {
      quotes: quotesSnapshot.size,
      orders: ordersSnapshot.size,
    }
  } catch (error) {
    console.error('Error getting associated records:', error)
    return { quotes: 0, orders: 0 }
  }
}

export async function reassignSalespersonRecords(
  fromSalespersonId: string,
  toSalespersonId: string
): Promise<{ quotesReassigned: number; ordersReassigned: number }> {
  try {
    const { db } = await import('@/lib/firebaseClient')
    const {
      doc,
      getDoc,
      query,
      collection,
      where,
      getDocs,
      updateDoc,
      serverTimestamp,
    } = await import('firebase/firestore')

    // Get both salespeople
    const fromSalespersonRef = doc(db, 'salespeople', fromSalespersonId)
    const toSalespersonRef = doc(db, 'salespeople', toSalespersonId)

    const [fromDoc, toDoc] = await Promise.all([
      getDoc(fromSalespersonRef),
      getDoc(toSalespersonRef),
    ])

    if (!fromDoc.exists() || !toDoc.exists()) {
      throw new Error('One or both salespeople not found')
    }

    const fromSalespersonData = fromDoc.data() as Record<string, unknown>
    const toSalespersonData = toDoc.data() as Record<string, unknown>

    const fromName = String(fromSalespersonData.name ?? '')
    const toName = String(toSalespersonData.name ?? '')

    // Reassign quotes
    const quotesQuery = query(
      collection(db, 'quotes'),
      where('salesRep', '==', fromName)
    )
    const quotesSnapshot = await getDocs(quotesQuery)

    let quotesReassigned = 0
    for (const quoteDoc of quotesSnapshot.docs) {
      await updateDoc(quoteDoc.ref, {
        salesRep: toName,
        updatedAt: serverTimestamp(),
      })
      quotesReassigned++
    }

    // Reassign orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('salesRep', '==', fromName)
    )
    const ordersSnapshot = await getDocs(ordersQuery)

    let ordersReassigned = 0
    for (const orderDoc of ordersSnapshot.docs) {
      await updateDoc(orderDoc.ref, {
        salesRep: toName,
        updatedAt: serverTimestamp(),
      })
      ordersReassigned++
    }

    console.warn(
      `Reassigned ${quotesReassigned} quotes and ${ordersReassigned} orders from ${fromName} to ${toName}`
    )

    return { quotesReassigned, ordersReassigned }
  } catch (error) {
    console.error('Error reassigning salesperson records:', error)
    throw new Error(
      `Failed to reassign records: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function getSalespersonByEmail(
  email: string
): Promise<Salesperson | null> {
  try {
    const { db } = await import('@/lib/firebaseClient')
    const { collection, query, where, limit, getDocs } = await import(
      'firebase/firestore'
    )

    const q = query(
      collection(db, 'salespeople'),
      where('email', '==', email),
      limit(1)
    )
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const docSnap = querySnapshot.docs[0]
    const data = docSnap.data() as Record<string, unknown>

    return {
      id: docSnap.id,
      ...(data as unknown as Partial<Salesperson>),
    } as Salesperson
  } catch (error) {
    console.error('Error getting salesperson by email:', error)
    throw error
  }
}

// Fetch salesperson doc by Firestore id (as stored in localStorage 'salesRepId')
export async function getSalespersonById(
  id: string
): Promise<Salesperson | null> {
  try {
    const { db } = await import('@/lib/firebaseClient')
    const { doc, getDoc } = await import('firebase/firestore')

    console.warn('🔍 getSalespersonById called with ID:', id)

    const ref = doc(db, 'salespeople', id)
    const snap = await getDoc(ref)

    if (!snap.exists()) {
      console.warn('❌ Document does not exist for ID:', id)
      return null
    }

    const data = snap.data() as Record<string, unknown>
    console.warn('🔍 Raw Firestore data:', data)

    const salesperson = {
      id: snap.id,
      ...(data as unknown as Partial<Salesperson>),
    } as Salesperson
    console.warn('🔍 Processed salesperson:', salesperson)

    return salesperson
  } catch (e) {
    console.error('getSalespersonById failed', e)
    return null
  }
}

/**
 * Find a salesperson by referral code (case-insensitive).
 * Uses a client-side filter over the salespeople collection for flexibility.
 */
export async function getSalespersonByReferralCode(
  code: string
): Promise<Salesperson | null> {
  const norm = String(code || '')
    .trim()
    .toLowerCase()
  if (!norm) return null
  const all = await getSalespeople()
  for (const sp of all) {
    const codes = (sp.referralCodes ?? []).map((c) =>
      String(c).trim().toLowerCase()
    )
    if (codes.includes(norm)) return sp
  }
  return null
}

/**
 * Find a salesperson by zipcode (exact match, string compare).
 */
export async function getSalespersonByZipcode(
  zip: string
): Promise<Salesperson | null> {
  const norm = String(zip || '').trim()
  if (!norm) return null
  const all = await getSalespeople()
  for (const sp of all) {
    const zips = (sp.zipcodes ?? []).map((z) => String(z).trim())
    if (zips.includes(norm)) return sp
  }
  return null
}
