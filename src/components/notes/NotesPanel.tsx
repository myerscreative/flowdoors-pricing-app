// src/components/notes/NotesPanel.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

/* ---------- Types ---------- */
export type NoteAttachment = {
  id: string
  name: string
  type: string
  size: number
  url: string // object URL for demo; later swap to remote URL
  isImage: boolean
}

export type Note = {
  id: string
  content: string
  createdAt: string // ISO
  author?: string
  attachments?: NoteAttachment[]
}

type Props = {
  initialNotes?: Note[]
  onCreate?: (_note: Note) => void
  onUpdate?: (_note: Note) => void
  onDelete?: (_id: string) => void
  title?: string
}

/* ---------- Utils ---------- */
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

const fmtSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

const buildAttachment = (file: File): NoteAttachment => {
  const url = URL.createObjectURL(file)
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    url,
    isImage: file.type.startsWith('image/'),
  }
}

/* ---------- Subcomponents ---------- */
function AttachmentChip({
  a,
  onRemove,
}: {
  a: NoteAttachment
  onRemove?: () => void
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white">
      {a.isImage ? (
        <Image
          src={a.url}
          alt={a.name || 'note attachment'}
          width={112}
          height={112}
          className="h-28 w-28 object-cover"
          draggable={false}
        />
      ) : (
        <div className="h-28 w-28 p-2">
          <div className="flex h-full w-full flex-col items-center justify-center rounded-md bg-gray-50 text-center">
            <div className="text-[11px] font-medium text-gray-700 line-clamp-2">
              {a.name}
            </div>
            <div className="text-[10px] text-gray-500">{fmtSize(a.size)}</div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-1 border-t border-gray-200 px-2 py-1">
        <a
          href={a.url}
          download={a.name}
          className="text-[11px] text-blue-600 hover:underline"
        >
          Download
        </a>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded px-1 text-[11px] text-red-600 hover:bg-red-50"
            aria-label={`Remove ${a.name}`}
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  )
}

/* ---------- Main Component ---------- */
export default function NotesPanel({
  initialNotes = [],
  onCreate,
  onUpdate,
  onDelete,
  title = 'Notes',
}: Props) {
  const [notes, setNotes] = useState<Note[]>(
    [...initialNotes].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  )

  // Composer state
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerText, setComposerText] = useState('')
  const [composerFiles, setComposerFiles] = useState<NoteAttachment[]>([])
  const composerInputRef = useRef<HTMLInputElement>(null)

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [editingFiles, setEditingFiles] = useState<NoteAttachment[]>([])
  const editorInputRef = useRef<HTMLInputElement>(null)

  // Menu state
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      const all = [
        ...composerFiles,
        ...editingFiles,
        ...notes.flatMap((n) => n.attachments ?? []),
      ]
      all.forEach((a) => {
        try {
          URL.revokeObjectURL(a.url)
        } catch {
          // ignore
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ----- Composer handlers ----- */
  const addComposerFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setComposerFiles((prev) => [
      ...prev,
      ...Array.from(files).map(buildAttachment),
    ])
  }

  const removeComposerFile = (id: string) => {
    const a = composerFiles.find((x) => x.id === id)
    if (a) {
      try {
        URL.revokeObjectURL(a.url)
      } catch {
        // ignore
      }
    }
    setComposerFiles((prev) => prev.filter((x) => x.id !== id))
  }

  const addNote = () => {
    const text = composerText.trim()
    if (!text && composerFiles.length === 0) return
    const note: Note = {
      id: `${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      content: text,
      createdAt: new Date().toISOString(),
      attachments: composerFiles,
    }
    setNotes((prev) => [note, ...prev])
    setComposerText('')
    setComposerFiles([])
    setComposerOpen(false)
    onCreate?.(note)
  }

  /* ----- Edit handlers ----- */
  const startEdit = (n: Note) => {
    setEditingId(n.id)
    setEditingText(n.content)
    setEditingFiles(n.attachments ? [...n.attachments] : [])
    setMenuOpenId(null)
  }

  const addEditorFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setEditingFiles((prev) => [
      ...prev,
      ...Array.from(files).map(buildAttachment),
    ])
  }

  const removeEditorFile = (id: string) => {
    const a = editingFiles.find((x) => x.id === id)
    if (a) {
      try {
        URL.revokeObjectURL(a.url)
      } catch {
        // ignore
      }
    }
    setEditingFiles((prev) => prev.filter((x) => x.id !== id))
  }

  const saveEdit = () => {
    if (!editingId) return
    setNotes((prev) =>
      prev.map((n) =>
        n.id === editingId
          ? { ...n, content: editingText.trim(), attachments: editingFiles }
          : n
      )
    )
    const changed = {
      ...notes.find((n) => n.id === editingId)!,
      content: editingText.trim(),
      attachments: editingFiles,
    }
    setEditingId(null)
    setEditingText('')
    setEditingFiles([])
    onUpdate?.(changed)
  }

  const deleteNote = (id: string) => {
    const n = notes.find((x) => x.id === id)
    n?.attachments?.forEach((a) => {
      try {
        URL.revokeObjectURL(a.url)
      } catch {
        // ignore
      }
    })
    setNotes((prev) => prev.filter((x) => x.id !== id))
    setMenuOpenId(null)
    onDelete?.(id)
  }

  /* ---------- Render ---------- */
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {!composerOpen && (
          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add note
          </button>
        )}
      </div>

      {/* Composer */}
      {composerOpen && (
        <div className="border-t border-gray-200 px-4 py-3">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Add Note
          </label>
          <textarea
            rows={5}
            value={composerText}
            onChange={(e) => setComposerText(e.target.value)}
            placeholder="Write a note… paragraphs and line breaks are preserved."
            className="w-full resize-y rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none ring-blue-500 focus:ring-2"
          />

          {/* Attach files */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              ref={composerInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addComposerFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => composerInputRef.current?.click()}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Attach files
            </button>
            <span className="text-xs text-gray-500">
              Images show thumbnails; all files are downloadable.
            </span>
          </div>

          {composerFiles.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {composerFiles.map((a) => (
                <AttachmentChip
                  key={a.id}
                  a={a}
                  onRemove={() => removeComposerFile(a.id)}
                />
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={addNote}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Note
            </button>
            <button
              type="button"
              onClick={() => {
                setComposerOpen(false)
                setComposerText('')
                composerFiles.forEach((a) => {
                  try {
                    URL.revokeObjectURL(a.url)
                  } catch {
                    // ignore
                  }
                })
                setComposerFiles([])
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!composerOpen && notes.length === 0 && (
        <div className="border-t border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
          No notes yet.
        </div>
      )}

      {/* Notes list */}
      {notes.length > 0 && (
        <ul className="divide-y divide-gray-200">
          {notes.map((n) => {
            const isEditing = n.id === editingId
            return (
              <li key={n.id} className="relative px-4 py-3">
                {/* actions */}
                <div className="absolute right-2 top-2">
                  <button
                    aria-label="Note actions"
                    onClick={() =>
                      setMenuOpenId((v) => (v === n.id ? null : n.id))
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    ⋮
                  </button>
                  {menuOpenId === n.id && (
                    <div
                      className="absolute right-0 z-10 mt-1 w-36 overflow-hidden rounded-md border border-gray-200 bg-white shadow-md"
                      onMouseLeave={() => setMenuOpenId(null)}
                    >
                      <button
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                        onClick={() => startEdit(n)}
                      >
                        Edit
                      </button>
                      <button
                        className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        onClick={() => deleteNote(n.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* timestamp */}
                <div className="mb-1 text-xs font-medium text-gray-500">
                  {fmtTime(n.createdAt)}
                </div>

                {/* content & attachments */}
                {isEditing ? (
                  <div>
                    <textarea
                      rows={5}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full resize-y rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none ring-blue-500 focus:ring-2"
                    />

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input
                        ref={editorInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => addEditorFiles(e.target.files)}
                      />
                      <button
                        type="button"
                        onClick={() => editorInputRef.current?.click()}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Attach files
                      </button>
                    </div>

                    {editingFiles.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                        {editingFiles.map((a) => (
                          <AttachmentChip
                            key={a.id}
                            a={a}
                            onRemove={() => removeEditorFile(a.id)}
                          />
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null)
                          setEditingText('')
                          // discard newly added unsaved files
                          editingFiles.forEach((a) => {
                            try {
                              URL.revokeObjectURL(a.url)
                            } catch {
                              // ignore
                            }
                          })
                          setEditingFiles(
                            n.attachments ? [...n.attachments] : []
                          )
                        }}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="whitespace-pre-wrap text-sm leading-6 text-gray-800">
                      {n.content}
                    </div>
                    {n.attachments && n.attachments.length > 0 ? (
                      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                        {n.attachments.map((a) => (
                          <AttachmentChip key={a.id} a={a} />
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
