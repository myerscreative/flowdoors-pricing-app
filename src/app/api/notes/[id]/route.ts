import { NextRequest, NextResponse } from 'next/server'

type UpdateNotePayload = {
  content?: string // optional if your route allows partial update
  // add other fields you actually use, e.g.:
  // title?: string;
  // attachments?: AttachmentIn[];
}

function isUpdateNotePayload(x: unknown): x is UpdateNotePayload {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>

  // If you require at least one updatable field, assert that here:
  const hasContent =
    typeof o.content === 'string' ? o.content.trim().length >= 0 : false
  // Add other property checks if your handler uses them.
  return hasContent /* || otherFieldChecks */
}

// If you have a GET handler, leave it as-is—no payload typing needed.

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id
    if (!noteId) {
      return NextResponse.json({ error: 'Missing note id' }, { status: 400 })
    }

    const bodyUnknown: unknown = await req.json()
    if (!isUpdateNotePayload(bodyUnknown)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // TODO: Implement update logic using `noteId` and fields from bodyUnknown

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('notes/[id] PATCH error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id
    if (!noteId) {
      return NextResponse.json({ error: 'Missing note id' }, { status: 400 })
    }

    // ... existing delete logic using `noteId` ...

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('notes/[id] DELETE error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
