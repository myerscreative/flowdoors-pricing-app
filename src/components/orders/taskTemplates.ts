'use client'

import type { TaskTemplate } from './types'

export async function fetchTaskTemplates(): Promise<TaskTemplate[]> {
  const res = await fetch('/api/task-templates', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load templates')
  return (await res.json()) as TaskTemplate[]
}

export async function createTaskTemplate(input: {
  title: string
  priority?: TaskTemplate['priority']
  assignee?: string
}): Promise<TaskTemplate> {
  const res = await fetch('/api/task-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create template')
  return (await res.json()) as TaskTemplate
}

export async function deleteTaskTemplate(id: string): Promise<void> {
  const res = await fetch(`/api/task-templates/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete template')
}

export async function updateTaskTemplate(
  id: string,
  patch: Partial<Omit<TaskTemplate, 'id'>>
): Promise<TaskTemplate> {
  const res = await fetch(`/api/task-templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error('Failed to update template')
  return (await res.json()) as TaskTemplate
}

export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
