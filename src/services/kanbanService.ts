'use client'

import { db } from '@/lib/firebaseClient'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

// Light, permissive interfaces for kanban operations
export interface KanbanColumn {
  id: string
  key: string
  name: string
  order: number
}

export interface KanbanCard {
  id: string
  title: string
  quoteId?: string
  status?: string
  order?: number
  [k: string]: unknown
}

export interface ReorderPayload {
  sourceColumnId: string
  destColumnId: string
  cardId: string
  position: number
}

export type KanbanConfig = {
  columns: string[] // ordered list of status/column ids
  titles?: Record<string, string> // optional display titles per id
  updatedAt?: unknown
}

async function getConfig(
  docId: string,
  fallback: string[]
): Promise<KanbanConfig> {
  try {
    const ref = doc(db, 'settings', docId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const data = snap.data() as KanbanConfig
      const columns =
        Array.isArray(data.columns) && data.columns.length
          ? data.columns
          : fallback
      const titles = data.titles || {}
      return { columns, titles }
    }
  } catch (e) {
    console.warn('Failed to load kanban config', docId, e)
  }
  return { columns: fallback, titles: {} }
}

async function saveConfig(docId: string, config: KanbanConfig): Promise<void> {
  const ref = doc(db, 'settings', docId)
  await setDoc(
    ref,
    { ...config, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

export const kanbanService = {
  async getQuotesConfig(fallback: string[]): Promise<KanbanConfig> {
    return getConfig('quotes-kanban', fallback)
  },
  async saveQuotesConfig(config: KanbanConfig): Promise<void> {
    return saveConfig('quotes-kanban', config)
  },
  async getOrdersConfig(fallback: string[]): Promise<KanbanConfig> {
    return getConfig('orders-kanban', fallback)
  },
  async saveOrdersConfig(config: KanbanConfig): Promise<void> {
    return saveConfig('orders-kanban', config)
  },
  async getDeletedRetentionDays(): Promise<number> {
    try {
      const cfg = await getConfig('general', [])
      const anyCfg: unknown = cfg as unknown
      const days = Number(
        (anyCfg as Record<string, unknown>)?.deletedRetentionDays ?? 30
      )
      return Number.isFinite(days) && days > 0 ? days : 30
    } catch {
      return 30
    }
  },
  async setDeletedRetentionDays(days: number): Promise<void> {
    const n = Math.max(1, Math.floor(days))
    await saveConfig('general', {
      columns: [],
      titles: {},
      updatedAt: undefined,
    })
    // Merge-only write of the field
    const ref = doc(db, 'settings', 'general')
    await setDoc(
      ref,
      { deletedRetentionDays: n, updatedAt: serverTimestamp() },
      { merge: true }
    )
  },
}
