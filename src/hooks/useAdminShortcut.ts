'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hidden admin access hook
 * 
 * SECURITY NOTE: This is for navigation convenience only, NOT security.
 * The /admin route still requires proper authentication via the admin layout guard.
 * 
 * Provides two ways to access admin:
 * 1. Type "admin" sequence anywhere on the page (ignores input fields)
 * 2. Click logo 5 times rapidly (within 1 second)
 */

const ADMIN_SEQUENCE = 'admin'
const SEQUENCE_TIMEOUT = 2000 // 2 seconds of inactivity resets sequence
const LOGO_CLICK_TIMEOUT = 1000 // 1 second between clicks resets counter
const LOGO_CLICK_THRESHOLD = 5 // Number of clicks needed

export function useAdminShortcut() {
  const router = useRouter()
  const sequenceRef = useRef('')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const clickCountRef = useRef(0)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isActivated, setIsActivated] = useState(false)

  useEffect(() => {
    // Keyboard sequence handler
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore keypresses when user is typing in input/textarea fields
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Add character to sequence
      sequenceRef.current += event.key.toLowerCase()

      // Check if sequence matches "admin"
      if (sequenceRef.current === ADMIN_SEQUENCE) {
        console.log('🔑 Admin shortcut activated via keyboard sequence')
        setIsActivated(true)
        router.push('/admin')
        sequenceRef.current = ''
      } else if (sequenceRef.current.length >= ADMIN_SEQUENCE.length) {
        // Reset if sequence gets too long
        sequenceRef.current = ''
      }

      // Reset sequence after timeout
      timeoutRef.current = setTimeout(() => {
        sequenceRef.current = ''
      }, SEQUENCE_TIMEOUT)
    }

    // Logo click handler (5 rapid clicks)
    const handleLogoClick = () => {
      // Clear existing click timeout
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }

      // Increment click counter
      clickCountRef.current += 1

      // Check if threshold reached
      if (clickCountRef.current >= LOGO_CLICK_THRESHOLD) {
        console.log('🔑 Admin shortcut activated via logo clicks')
        setIsActivated(true)
        router.push('/admin')
        clickCountRef.current = 0
      }

      // Reset counter after timeout
      clickTimeoutRef.current = setTimeout(() => {
        clickCountRef.current = 0
      }, LOGO_CLICK_TIMEOUT)
    }

    // Attach keyboard listener
    window.addEventListener('keypress', handleKeyPress)

    // Attach click listener to logo images
    const logos = document.querySelectorAll('img[alt*="FlowDoors Logo"], img[alt*="flowdoors-logo"]')
    logos.forEach((logo) => {
      logo.addEventListener('click', handleLogoClick)
    })

    // Cleanup on unmount
    return () => {
      window.removeEventListener('keypress', handleKeyPress)
      logos.forEach((logo) => {
        logo.removeEventListener('click', handleLogoClick)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [router])

  return { isActivated }
}

