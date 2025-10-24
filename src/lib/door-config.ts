export type SystemType = 'multi-slide' | 'pocket'

// Correct limits
export const SIZE_LIMITS = {
  minPanelWidth: 37,
  maxPanelWidth: 48,
}

// Frame deduct before dividing by panel count
export const PANEL_GAP_IN = 3

export function perPanelWidth(
  totalWidthIn: number,
  panelCount: number
): number {
  const usable = Math.max(totalWidthIn - PANEL_GAP_IN, 0)
  return panelCount > 0 ? usable / panelCount : 0
}

export function allowedPanelCounts(totalWidthIn: number): number[] {
  const out: number[] = []
  const { minPanelWidth, maxPanelWidth } = SIZE_LIMITS
  const maxPanels = 6 // No 7 or 8 panel doors
  for (let n = 2; n <= maxPanels; n++) {
    const per = perPanelWidth(totalWidthIn, n)
    if (per >= minPanelWidth && per <= maxPanelWidth) out.push(n)
  }
  return out
}

export type PanelTemplate = { code: string; label: string }

// Only the layouts you support
export function panelTemplates(count: number): PanelTemplate[] {
  const dict: Record<number, PanelTemplate[]> = {
    2: [
      { code: 'XO', label: 'Operating + Fixed (left)' },
      { code: 'OX', label: 'Fixed + Operating (right)' },
      { code: 'XX', label: 'Both Operating' },
    ],
    3: [
      { code: 'XXO', label: 'Operating + Operating + Fixed' },
      { code: 'XOX', label: 'Operating + Fixed + Operating' },
      { code: 'OXX', label: 'Fixed + Operating + Operating' },
      { code: 'XOO', label: 'Operating + Fixed + Fixed' },
      { code: 'OXO', label: 'Fixed + Operating + Fixed' },
      { code: 'OOX', label: 'Fixed + Fixed + Operating' },
    ],
    4: [
      { code: 'XOOX', label: '(Operating + Fixed) + (Fixed + Operating)' },
      { code: 'XXXX', label: 'All Operating' },
      { code: 'OXXO', label: 'Fixed + Operating + Operating + Fixed (OXXO)' },
    ],
    5: [
      // If you do NOT support any 5-panel layouts, leave this empty:
      // (If you support some, add them here explicitly.)
    ],
    6: [
      {
        code: 'XOOOOX',
        label: '(Operating + Fix + Fix) + (Fix + Fix + Operating)',
      },
    ],
  }
  return dict[count] ?? []
}
