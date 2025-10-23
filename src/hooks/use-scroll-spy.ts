'use client'

import { useState, useEffect } from 'react'

export function useScrollSpy(
  ids: string[],
  options: IntersectionObserverInit
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      // Find the first entry that is intersecting
      const intersectingEntry = entries.find((entry) => entry.isIntersecting)
      if (intersectingEntry) {
        setActiveId(intersectingEntry.target.id)
      }
    }, options)

    ids.forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      ids.forEach((id) => {
        const element = document.getElementById(id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [ids, options])

  return activeId
}
