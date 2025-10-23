import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function getLeadRecipients(): Promise<string[]> {
  const ref = doc(db, 'settings', 'notifications')
  const snap = await getDoc(ref)
  if (snap.exists() && Array.isArray(snap.data().leadRecipients)) {
    return snap.data().leadRecipients
  }
  // fallback to env vars
  const fallback = [
    process.env.MARKETING_EMAIL,
    process.env.MANAGER_EMAIL,
  ].filter(Boolean) as string[]
  return fallback
}

export async function getQuoteRecipients(): Promise<string[]> {
  const ref = doc(db, 'settings', 'notifications')
  const snap = await getDoc(ref)
  if (snap.exists() && Array.isArray(snap.data().quoteRecipients)) {
    return snap.data().quoteRecipients
  }
  // fallback to env vars
  const fallback = process.env.DEFAULT_QUOTE_RECIPIENTS
    ? process.env.DEFAULT_QUOTE_RECIPIENTS.split(',')
        .map((email) => email.trim())
        .filter(Boolean)
    : ['info@flowdoors.com'] // default fallback
  return fallback
}

export async function setLeadRecipients(emails: string[]): Promise<void> {
  const ref = doc(db, 'settings', 'notifications')
  await setDoc(ref, { leadRecipients: emails }, { merge: true })
}

export async function setQuoteRecipients(emails: string[]): Promise<void> {
  const ref = doc(db, 'settings', 'notifications')
  await setDoc(ref, { quoteRecipients: emails }, { merge: true })
}

export async function setAllNotificationRecipients(
  leadEmails: string[],
  quoteEmails: string[]
): Promise<void> {
  const ref = doc(db, 'settings', 'notifications')
  await setDoc(
    ref,
    {
      leadRecipients: leadEmails,
      quoteRecipients: quoteEmails,
    },
    { merge: true }
  )
}
