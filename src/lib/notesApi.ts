export type NoteAttachment = {
  id?: string
  name: string
  type: string
  size: number
  url: string
  isImage: boolean
  createdAt?: string
}

export type Note = {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  attachments: NoteAttachment[]
}

type CreateNoteInput = {
  content: string
  attachments?: Omit<NoteAttachment, 'id' | 'createdAt'>[]
}

type UpdateNoteInput = {
  content: string
  attachments?: Omit<NoteAttachment, 'id' | 'createdAt'>[]
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }
  return (await res.json()) as T
}

export async function listNotes(opts?: {
  signal?: AbortSignal
}): Promise<Note[]> {
  const res = await fetch('/api/notes', {
    method: 'GET',
    cache: 'no-store',
    signal: opts?.signal,
    headers: { accept: 'application/json' },
  })
  return json<Note[]>(res)
}

export async function createNote(
  input: CreateNoteInput,
  opts?: { signal?: AbortSignal }
): Promise<Note> {
  const res = await fetch('/api/notes', {
    method: 'POST',
    cache: 'no-store',
    signal: opts?.signal,
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      content: input.content,
      attachments: input.attachments ?? [],
    }),
  })
  return json<Note>(res)
}

export async function updateNote(
  id: string,
  input: UpdateNoteInput,
  opts?: { signal?: AbortSignal }
): Promise<Note> {
  const res = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    cache: 'no-store',
    signal: opts?.signal,
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      content: input.content,
      attachments: input.attachments ?? [],
    }),
  })
  return json<Note>(res)
}

export async function deleteNote(
  id: string,
  opts?: { signal?: AbortSignal }
): Promise<{ ok: true }> {
  const res = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    cache: 'no-store',
    signal: opts?.signal,
    headers: { accept: 'application/json' },
  })
  return json<{ ok: true }>(res)
}
