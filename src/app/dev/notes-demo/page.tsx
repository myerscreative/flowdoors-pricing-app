import NotesPanel, { Note } from '@/components/notes/NotesPanel'

export default function Page() {
  const seed: Note[] = [
    {
      id: 'n2',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      content:
        'Kickoff call with homeowner.\n\nAttached initial sketch and spec sheet.\nParagraphs are preserved.',
      attachments: [
        // example remote image (works like object URL for preview)
        {
          id: 'a1',
          name: 'sketch.png',
          type: 'image/png',
          size: 123456,
          url: 'https://picsum.photos/200/140',
          isImage: true,
        },
        {
          id: 'a2',
          name: 'spec-sheet.pdf',
          type: 'application/pdf',
          size: 532480,
          url: 'https://example.com/spec-sheet.pdf',
          isImage: false,
        },
      ],
    },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-xl font-semibold text-gray-900">Notes Demo</h1>
      <NotesPanel initialNotes={seed} />
    </div>
  )
}
