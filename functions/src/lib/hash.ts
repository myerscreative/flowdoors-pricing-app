import crypto from 'crypto'

export function sha256(value?: string): string | undefined {
  if (!value) return undefined
  const norm = value.trim().toLowerCase()
  if (!norm) return undefined
  return crypto.createHash('sha256').update(norm, 'utf8').digest('hex')
}

export function normalizePhoneToE164(phone?: string): string | undefined {
  if (!phone) return undefined
  const digits = phone.replace(/\D+/g, '')
  if (!digits) return undefined
  if (digits.length === 10) return `+1${digits}`
  if (digits.startsWith('1') && digits.length === 11) return `+${digits}`
  if (phone.startsWith('+')) return phone
  return `+${digits}`
}
