import type { RalColor } from './types'

export const RAL_COLORS: Record<string, RalColor[]> = {
  Whites: [
    { ral: 'RAL 9010', name: 'Pure White', hex: '#f1ece1' },
    { ral: 'RAL 9016', name: 'Traffic White', hex: '#f6f7f1' },
    { ral: 'RAL 9003', name: 'Signal White', hex: '#f4f7f0' },
  ],
  Blacks: [
    { ral: 'RAL 9005', name: 'Jet Black', hex: '#252525' },
    { ral: 'RAL 9011', name: 'Graphite Black', hex: '#2c2f33' },
    { ral: 'RAL 9017', name: 'Traffic Black', hex: '#282828' },
  ],
  Neutrals: [
    { ral: 'RAL 7035', name: 'Light Grey', hex: '#d7d7d7' },
    { ral: 'RAL 7040', name: 'Window Grey', hex: '#9da1a6' },
    { ral: 'RAL 7016', name: 'Anthracite Grey', hex: '#383e42' },
  ],
  Reds: [
    { ral: 'RAL 3000', name: 'Flame Red', hex: '#a52a2a' },
    { ral: 'RAL 3003', name: 'Ruby Red', hex: '#8b0000' },
    { ral: 'RAL 3020', name: 'Traffic Red', hex: '#cc0605' },
  ],
  Yellows: [
    { ral: 'RAL 1003', name: 'Signal Yellow', hex: '#f9a800' },
    { ral: 'RAL 1018', name: 'Zinc Yellow', hex: '#fdd600' },
    { ral: 'RAL 1021', name: 'Rape Yellow', hex: '#f6b400' },
  ],
  Greens: [
    { ral: 'RAL 6005', name: 'Moss Green', hex: '#004225' },
    { ral: 'RAL 6018', name: 'Yellow Green', hex: '#5d9d55' },
    { ral: 'RAL 6037', name: 'Pure Green', hex: '#2ba03d' },
  ],
  Blues: [
    { ral: 'RAL 5002', name: 'Ultramarine Blue', hex: '#00387b' },
    { ral: 'RAL 5010', name: 'Gentian Blue', hex: '#005a9c' },
    { ral: 'RAL 5015', name: 'Sky Blue', hex: '#0087be' },
  ],
  Specials: [
    { ral: 'RAL 8017', name: 'Chocolate Brown', hex: '#452f2f' },
    { ral: 'RAL 9006', name: 'White Aluminium', hex: '#a5a8a9' },
    { ral: 'RAL 9007', name: 'Grey Aluminium', hex: '#87888a' },
  ],
}
