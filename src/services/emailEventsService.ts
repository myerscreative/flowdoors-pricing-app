import { db } from '@/lib/firebaseClient'
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  updateDoc,
  serverTimestamp,
  Timestamp,
  doc,
} from 'firebase/firestore'

export interface EmailEvent {
  id: string
  to: string
  sentAt: Timestamp
  status: 'sent' | 'failed'
  error?: string
  messageId?: string
  openedAt?: Timestamp
  clickedAt?: Timestamp
  openCount?: number
  clickCount?: number
}

export async function getEmailEvents(quoteId: string): Promise<EmailEvent[]> {
  try {
    const emailEventsRef = collection(db, 'quotes', quoteId, 'emailEvents')
    const q = query(emailEventsRef, orderBy('sentAt', 'desc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as EmailEvent
    )
  } catch (error) {
    console.error('Error fetching email events:', error)
    return []
  }
}

export async function updateEmailEventWithWebhook(
  messageId: string,
  eventType: 'open' | 'click'
): Promise<boolean> {
  try {
    // Find the email event by messageId using a messageId mapping collection
    const messageIdRef = collection(db, 'emailMessageIds')
    const messageQuery = query(
      messageIdRef,
      where('messageId', '==', messageId)
    )
    const messageSnapshot = await getDocs(messageQuery)

    if (messageSnapshot.empty) {
      console.warn(`No email event found for messageId: ${messageId}`)
      return false
    }

    const messageDoc = messageSnapshot.docs[0]
    const { quoteId, emailEventId } = messageDoc.data()

    // Update the specific email event
    const emailEventRef = collection(db, 'quotes', quoteId, 'emailEvents')
    const emailEventDoc = doc(emailEventRef, emailEventId)

    const updateData: any = {}
    const now = serverTimestamp()

    if (eventType === 'open') {
      updateData.openedAt = now
      updateData.openCount = 1 // Will be incremented by Postmark for subsequent opens
    } else if (eventType === 'click') {
      updateData.clickedAt = now
      updateData.clickCount = 1 // Will be incremented by Postmark for subsequent clicks
    }

    await updateDoc(emailEventDoc, updateData)
    return true
  } catch (error) {
    console.error('Error updating email event with webhook:', error)
    return false
  }
}
