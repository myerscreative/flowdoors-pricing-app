'use client'

// Type-only imports for Firebase typings
import type {
  Firestore,
} from 'firebase/firestore'
import { z } from 'zod'

/** Accept Firestore Timestamp | Date | string | number and normalize to Date|null */
const FireDateZ = z.any().transform((v) => {
  try {
    if (v && typeof v.toDate === 'function') return v.toDate() as Date
    if (v instanceof Date) return v as Date
    if (typeof v === 'string' || typeof v === 'number')
      return new Date(v as any)
  } catch {
    // intentionally empty
  }
  return null as Date | null
})

const NoteAttachmentZ = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.string(),
  size: z.number(),
  url: z.string(),
  isImage: z.boolean(),
  createdAt: FireDateZ.optional().nullable(),
})

const FireNoteDocZ = z
  .object({
    content: z.string(),
    orderId: z.string().optional().nullable(),
    quoteId: z.string().optional().nullable(),
    userId: z.string().optional().nullable(),
    attachments: z.array(NoteAttachmentZ).optional().default([]),
    createdAt: FireDateZ.optional().nullable(),
    updatedAt: FireDateZ.optional().nullable(),
  })
  .passthrough()

export type NoteAttachment = {
  id?: string
  name: string
  type: string
  size: number
  url: string
  isImage: boolean
  createdAt?: Date | null
}

export type Note = {
  id: string
  content: string
  orderId?: string | null
  quoteId?: string | null
  userId?: string | null
  attachments: NoteAttachment[]
  createdAt: Date | null
  updatedAt: Date | null
}

export type CreateNoteInput = {
  content: string
  orderId?: string | null
  quoteId?: string | null
  userId?: string | null
  attachments?: Omit<NoteAttachment, 'id' | 'createdAt'>[]
}

export type UpdateNoteInput = {
  content?: string
  attachments?: Omit<NoteAttachment, 'id' | 'createdAt'>[]
}

// Helper module-type aliases
type FS = typeof import('firebase/firestore')

// Dynamic imports to prevent SSR issues (typed)
let db: Firestore

// Firestore function refs
let collection: FS['collection']
let addDoc: FS['addDoc']
let getDocs: FS['getDocs']
let doc: FS['doc']
let getDoc: FS['getDoc']
let updateDoc: FS['updateDoc']
let deleteDoc: FS['deleteDoc']
let serverTimestamp: FS['serverTimestamp']
let query: FS['query']
let orderBy: FS['orderBy']
let where: FS['where']

// Initialize Firebase imports dynamically
async function initFirebase() {
  const firebase = await import('@/lib/firebaseClient')
  const firestore = await import('firebase/firestore')

  db = firebase.db
  collection = firestore.collection
  addDoc = firestore.addDoc
  getDocs = firestore.getDocs
  doc = firestore.doc
  getDoc = firestore.getDoc
  updateDoc = firestore.updateDoc
  deleteDoc = firestore.deleteDoc
  serverTimestamp = firestore.serverTimestamp
  query = firestore.query
  orderBy = firestore.orderBy
  where = firestore.where
}

let firebaseInitialized = false

function requireDb(): Firestore {
  if (!db) throw new Error('Firebase not initialized. Call initFirebase() first.')
  return db
}

/** Safely map a Firestore doc to Note */
function mapFireToNote(docId: string, raw: unknown): Note | null {
  const parsed = FireNoteDocZ.safeParse(raw)
  if (!parsed.success) {
    console.warn('Skipping malformed note', {
      docId,
      issues: parsed.error.issues,
    })
    return null
  }
  const n = parsed.data

  return {
    id: docId,
    content: n.content,
    orderId: n.orderId ?? null,
    quoteId: n.quoteId ?? null,
    userId: n.userId ?? null,
    attachments: (n.attachments ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      size: a.size,
      url: a.url,
      isImage: a.isImage,
      createdAt: a.createdAt ?? null,
    })),
    createdAt: n.createdAt ?? null,
    updatedAt: n.updatedAt ?? null,
  }
}

/**
 * List all notes, optionally filtered by orderId or quoteId
 */
export async function listNotes(options?: {
  orderId?: string
  quoteId?: string
}): Promise<Note[]> {
  if (!firebaseInitialized) {
    await initFirebase()
    firebaseInitialized = true
  }

  try {
    const notesCol = collection(requireDb(), 'notes')
    let q = query(notesCol, orderBy('createdAt', 'desc'))

    // Apply filters if provided
    if (options?.orderId) {
      q = query(notesCol, where('orderId', '==', options.orderId), orderBy('createdAt', 'desc'))
    } else if (options?.quoteId) {
      q = query(notesCol, where('quoteId', '==', options.quoteId), orderBy('createdAt', 'desc'))
    }

    const snapshot = await getDocs(q)
    const notes: Note[] = []

    snapshot.forEach((docSnap) => {
      const note = mapFireToNote(docSnap.id, docSnap.data())
      if (note) notes.push(note)
    })

    return notes
  } catch (error) {
    console.error('Error listing notes:', error)
    throw error
  }
}

/**
 * Get a single note by ID
 */
export async function getNote(noteId: string): Promise<Note | null> {
  if (!firebaseInitialized) {
    await initFirebase()
    firebaseInitialized = true
  }

  try {
    const noteRef = doc(requireDb(), 'notes', noteId)
    const snapshot = await getDoc(noteRef)

    if (!snapshot.exists()) {
      return null
    }

    return mapFireToNote(snapshot.id, snapshot.data())
  } catch (error) {
    console.error('Error getting note:', error)
    throw error
  }
}

/**
 * Create a new note
 */
export async function createNote(input: CreateNoteInput): Promise<Note> {
  if (!firebaseInitialized) {
    await initFirebase()
    firebaseInitialized = true
  }

  try {
    const now = serverTimestamp()

    const noteData = {
      content: input.content,
      orderId: input.orderId ?? null,
      quoteId: input.quoteId ?? null,
      userId: input.userId ?? null,
      attachments: (input.attachments ?? []).map((a) => ({
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        name: a.name,
        type: a.type,
        size: a.size,
        url: a.url,
        isImage: a.isImage,
        createdAt: now,
      })),
      createdAt: now,
      updatedAt: now,
    }

    const docRef = await addDoc(collection(requireDb(), 'notes'), noteData)

    // Fetch the created note to get the server timestamps
    const created = await getNote(docRef.id)
    if (!created) {
      throw new Error('Failed to fetch created note')
    }

    return created
  } catch (error) {
    console.error('Error creating note:', error)
    throw error
  }
}

/**
 * Update an existing note
 */
export async function updateNote(
  noteId: string,
  input: UpdateNoteInput
): Promise<Note> {
  if (!firebaseInitialized) {
    await initFirebase()
    firebaseInitialized = true
  }

  try {
    const noteRef = doc(requireDb(), 'notes', noteId)

    // Check if note exists
    const existing = await getDoc(noteRef)
    if (!existing.exists()) {
      throw new Error('Note not found')
    }

    const updateData: any = {
      updatedAt: serverTimestamp(),
    }

    if (input.content !== undefined) {
      updateData.content = input.content
    }

    if (input.attachments !== undefined) {
      updateData.attachments = input.attachments.map((a) => ({
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        name: a.name,
        type: a.type,
        size: a.size,
        url: a.url,
        isImage: a.isImage,
        createdAt: serverTimestamp(),
      }))
    }

    await updateDoc(noteRef, updateData)

    // Fetch the updated note
    const updated = await getNote(noteId)
    if (!updated) {
      throw new Error('Failed to fetch updated note')
    }

    return updated
  } catch (error) {
    console.error('Error updating note:', error)
    throw error
  }
}

/**
 * Delete a note
 */
export async function deleteNote(noteId: string): Promise<void> {
  if (!firebaseInitialized) {
    await initFirebase()
    firebaseInitialized = true
  }

  try {
    const noteRef = doc(requireDb(), 'notes', noteId)
    await deleteDoc(noteRef)
  } catch (error) {
    console.error('Error deleting note:', error)
    throw error
  }
}
