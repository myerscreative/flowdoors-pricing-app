# Vibepoint Design System

## Brand Overview

Vibepoint is a mood tracking app that helps users understand and control their emotional states. The visual design should feel warm, inviting, and emotionally supportive—never clinical or cold.

---

## Color Palette

### Gradient Colors (Core Mood Gradient)

The four-corner bilinear interpolation gradient represents the mood selection interface:

| Position | Color Name | Hex | RGB | Usage |
|----------|-----------|-----|-----|-------|
| Top-Left | Calm Cyan | `#7CC6D6` | `rgb(124, 198, 214)` | Happy + Unmotivated |
| Top-Right | Energetic Orange | `#F5A623` | `rgb(245, 166, 35)` | Happy + Motivated |
| Bottom-Left | Deep Navy | `#2D3A5C` | `rgb(45, 58, 92)` | Unhappy + Unmotivated |
| Bottom-Right | Dark Burgundy | `#8B2942` | `rgb(139, 41, 66)` | Unhappy + Motivated |

### UI Colors

```css
:root {
  /* Gradient Corner Colors (for mood selector only) */
  --gradient-top-left: #7CC6D6;
  --gradient-top-right: #F5A623;
  --gradient-bottom-left: #2D3A5C;
  --gradient-bottom-right: #8B2942;

  /* Page Background (soft, light gradient) */
  --bg-cyan: #d4f1f9;
  --bg-pink: #f8e8f0;
  --bg-cream: #fdf6e9;
  --bg-peach: #f5e6e0;

  /* Text Colors */
  --text-primary: #1a1a2e;
  --text-secondary: #4a4a6a;
  --text-light: rgba(255, 255, 255, 0.95);
  --text-muted: rgba(255, 255, 255, 0.75);

  /* Surface Colors */
  --card-bg: rgba(255, 255, 255, 0.85);
  --card-bg-solid: #ffffff;
  --card-border: rgba(255, 255, 255, 0.3);
  --surface-hover: rgba(255, 255, 255, 0.95);

  /* Accent Gradient (for buttons, streak card) */
  --accent-gradient: linear-gradient(135deg, #f97316 0%, #c026d3 50%, #7c3aed 100%);
  
  /* PRO / Accent Colors */
  --pro-primary: #c71585;
  --pro-secondary: #ff1493;
  --pro-gradient: linear-gradient(135deg, #c71585, #ff1493);
  --pro-bg-light: rgba(199, 21, 133, 0.08);
  --pro-bg-medium: rgba(199, 21, 133, 0.15);

  /* Status Colors */
  --success: #16a34a;
  --warning: #f59e0b;
  --error: #dc2626;

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 15px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 25px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 15px 50px rgba(0, 0, 0, 0.15);
  --shadow-pro: 0 4px 20px rgba(199, 21, 133, 0.3);
}
```

---

## Typography

### Font Families

```css
:root {
  --font-display: 'Fraunces', serif;
  --font-body: 'Outfit', sans-serif;
}
```

**Google Fonts Import:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,600&display=swap" rel="stylesheet">
```

### Type Scale

| Element | Font | Size | Weight | Usage |
|---------|------|------|--------|-------|
| Page Title | Fraunces | 2rem | 600 | Main greeting |
| Section Title | Fraunces | 1.4rem | 600 | Card headers |
| Card Title | Fraunces | 1.2rem | 600 | Feature titles |
| Large Number | Fraunces | 2.5rem | 600 | Stats, streak count |
| Body | Outfit | 1rem | 400 | General text |
| Body Small | Outfit | 0.95rem | 400 | Descriptions |
| Caption | Outfit | 0.85rem | 400 | Secondary info |
| Label | Outfit | 0.75rem | 500 | Stat labels, badges |
| Micro | Outfit | 0.65rem | 700 | PRO badge text |

---

## Spacing

```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-2xl: 24px;
  --space-3xl: 28px;
  --space-4xl: 32px;
  --space-5xl: 40px;
}
```

---

## Border Radius

```css
:root {
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;
  --radius-full: 50px;
}
```

---

## Component Styles

### Cards

**Glass Card (default):**
```css
.card {
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
}
```

**Card Header with Link:**
```css
.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-link {
  font-size: 0.9rem;
  color: var(--accent-magenta);  /* #c026d3 */
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.card-link:hover {
  opacity: 0.8;
}
```

**Gradient Card (streak, highlights):**

Uses the same orange-to-purple gradient as the primary button:

```css
.card-gradient {
  background: linear-gradient(135deg, #f97316 0%, #c026d3 50%, #7c3aed 100%);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  color: white;
  position: relative;
  overflow: hidden;
}

/* Optional: subtle glow overlay */
.card-gradient::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  border-radius: 50%;
}
```

**PRO Upgrade Card (dark, for free users):**

This card has a dark purple/navy gradient background to stand out:

```css
.card-pro-upgrade {
  background: linear-gradient(135deg, 
    #1e1e32 0%, 
    #2d2050 50%,
    #1e1e32 100%);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 32px 24px;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* Subtle glow effect */
.card-pro-upgrade::before {
  content: '';
  position: absolute;
  top: -30%;
  right: -20%;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(199, 21, 133, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.card-pro-upgrade-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 16px 0 8px;
}

.card-pro-upgrade-desc {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin-bottom: 24px;
}
```

### Buttons

**Primary Button (Log Your Mood):**

The main CTA uses a vibrant orange-to-purple gradient:

```css
.btn-primary {
  display: block;
  width: 100%;
  padding: 20px 30px;
  background: linear-gradient(135deg, #f97316 0%, #c026d3 50%, #7c3aed 100%);
  border: none;
  border-radius: 20px;
  font-family: var(--font-body);
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 30px rgba(192, 38, 211, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(192, 38, 211, 0.4);
}

/* Plus icon circle inside button */
.btn-primary-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  margin-right: 12px;
}
```

**PRO Button:**
```css
.btn-pro {
  padding: 14px 28px;
  background: var(--pro-gradient);
  border: none;
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  box-shadow: var(--shadow-pro);
  transition: all 0.3s ease;
}

.btn-pro:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 28px rgba(199, 21, 133, 0.5);
}
```

**Nav Pill:**
```css
.nav-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}
```

### PRO Badge

```css
.pro-badge {
  background: var(--pro-gradient);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 10px;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(199, 21, 133, 0.3);
}
```

---

## Animations

### Fade In Up (page load)

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Usage with staggered delays */
.element-1 { animation: fadeInUp 0.6s ease-out 0.1s both; }
.element-2 { animation: fadeInUp 0.6s ease-out 0.2s both; }
.element-3 { animation: fadeInUp 0.6s ease-out 0.3s both; }
```

### Float (icons)

```css
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

@keyframes float-icon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
```

### Wave (greeting emoji)

```css
@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-10deg); }
}
```

---

## Background

### Page Background Gradient

The background should be a soft, light gradient - NOT the intense mood gradient colors. This creates a calm, inviting canvas:

```css
body {
  background: linear-gradient(
    135deg,
    #d4f1f9 0%,      /* soft cyan - top left */
    #f8e8f0 35%,     /* soft pink - middle */
    #fdf6e9 65%,     /* soft cream - middle */
    #f5e6e0 100%     /* soft peach - bottom right */
  );
  background-attachment: fixed;
  min-height: 100vh;
}
```

**Alternative CSS variable approach:**
```css
:root {
  --bg-cyan: #d4f1f9;
  --bg-pink: #f8e8f0;
  --bg-cream: #fdf6e9;
  --bg-peach: #f5e6e0;
}

body {
  background: linear-gradient(
    135deg,
    var(--bg-cyan) 0%,
    var(--bg-pink) 35%,
    var(--bg-cream) 65%,
    var(--bg-peach) 100%
  );
}
```

**IMPORTANT:** The mood gradient colors (cyan #7CC6D6, orange #F5A623, navy #2D3A5C, burgundy #8B2942) are ONLY used for:
- The mood selector interface
- Mini mood gradient thumbnails
- Accent gradients on buttons and cards (like "Log Your Mood" button, streak card)

They should NOT be used as the page background.

### Floating Orbs (ambient effect)

The orbs should use soft, muted versions of the accent colors:

```css
.bg-orbs {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: #a8e0eb;  /* soft cyan */
  top: -100px;
  left: -100px;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: #f0c6d8;  /* soft pink */
  top: 20%;
  right: -150px;
  animation-delay: -5s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: #e8d4c8;  /* soft peach */
  bottom: -100px;
  left: 30%;
  animation-delay: -10s;
}
```

---

## Mood Gradient (Canvas Rendering)

The mood selector uses HTML5 Canvas with bilinear interpolation:

```typescript
function drawMoodGradient(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  const topLeft = { r: 124, g: 198, b: 214 };     // #7CC6D6
  const topRight = { r: 245, g: 166, b: 35 };     // #F5A623
  const bottomLeft = { r: 45, g: 58, b: 92 };     // #2D3A5C
  const bottomRight = { r: 139, g: 41, b: 66 };   // #8B2942
  
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const xRatio = x / (width - 1);
      const yRatio = y / (height - 1);
      
      // Bilinear interpolation
      const r = Math.round(
        topLeft.r * (1 - xRatio) * (1 - yRatio) +
        topRight.r * xRatio * (1 - yRatio) +
        bottomLeft.r * (1 - xRatio) * yRatio +
        bottomRight.r * xRatio * yRatio
      );
      const g = Math.round(
        topLeft.g * (1 - xRatio) * (1 - yRatio) +
        topRight.g * xRatio * (1 - yRatio) +
        bottomLeft.g * (1 - xRatio) * yRatio +
        bottomRight.g * xRatio * yRatio
      );
      const b = Math.round(
        topLeft.b * (1 - xRatio) * (1 - yRatio) +
        topRight.b * xRatio * (1 - yRatio) +
        bottomLeft.b * (1 - xRatio) * yRatio +
        bottomRight.b * xRatio * yRatio
      );
      
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}
```

---

## Modal Styles

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.modal-overlay.active {
  opacity: 1;
  visibility: visible;
}

.modal-container {
  background: linear-gradient(180deg, #ffffff 0%, #fdf8ff 100%);
  border-radius: 28px;
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.3),
    0 10px 30px rgba(199, 21, 133, 0.15);
  transform: scale(0.9) translateY(20px);
  transition: transform 0.3s ease;
}

.modal-overlay.active .modal-container {
  transform: scale(1) translateY(0);
}
```

---

## Responsive Breakpoints

```css
/* Mobile first - base styles are for mobile */

/* Container widths */
.container {
  width: 100%;
  max-width: 480px;      /* Mobile */
  margin: 0 auto;
  padding: 20px;
}

/* Small phones */
@media (max-width: 360px) {
  .container { padding: 16px; }
  .greeting { font-size: 1.7rem; }
}

/* Tablets */
@media (min-width: 768px) {
  .container {
    max-width: 600px;    /* Tablet */
    padding: 40px 24px;
  }
  .greeting { font-size: 2.2rem; }
  .stats-grid { gap: 16px; }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 720px;    /* Desktop */
    padding: 48px 32px;
  }
  .greeting { font-size: 2.5rem; }
  .log-mood-btn { 
    padding: 24px 36px;
    font-size: 1.2rem;
  }
  .stats-grid { 
    gap: 20px;
  }
  .stat-card {
    padding: 24px 20px;
  }
  .stat-value {
    font-size: 2.2rem;
  }
  .streak-card,
  .trend-card,
  .latest-mood,
  .insight-card,
  .pro-upgrade-card,
  .unlock-card {
    padding: 28px;
  }
  .quick-nav {
    gap: 16px;
  }
  .nav-pill {
    padding: 14px 24px;
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .container {
    max-width: 800px;    /* Large desktop */
    padding: 56px 40px;
  }
}
```

### Container Width Summary

| Breakpoint | Screen Width | Container Max-Width |
|------------|--------------|---------------------|
| Mobile (default) | < 768px | 480px |
| Tablet | ≥ 768px | 600px |
| Desktop | ≥ 1024px | 720px |
| Large Desktop | ≥ 1280px | 800px |

---

## Accessibility Notes

- Minimum touch target size: 44x44px
- Color contrast ratios meet WCAG AA standards
- Focus states on all interactive elements
- Reduced motion support via `prefers-reduced-motion`
- Semantic HTML structure

---

## File Reference

- **Dashboard HTML:** `vibepoint-dashboard.html`
- **Gradient Reference Image:** `gradientreference.png`