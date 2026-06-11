---
name: Pen to Paper
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#f0eeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#424846'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ec'
  outline: '#727876'
  outline-variant: '#c1c8c5'
  surface-tint: '#4a635d'
  primary: '#334b46'
  on-primary: '#ffffff'
  primary-container: '#4a635d'
  on-primary-container: '#c2ded6'
  inverse-primary: '#b1ccc5'
  secondary: '#506072'
  on-secondary: '#ffffff'
  secondary-container: '#d3e4fa'
  on-secondary-container: '#566678'
  tertiary: '#40483f'
  on-tertiary: '#ffffff'
  tertiary-container: '#576056'
  on-tertiary-container: '#d1dacd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cde8e1'
  primary-fixed-dim: '#b1ccc5'
  on-primary-fixed: '#06201b'
  on-primary-fixed-variant: '#334b46'
  secondary-fixed: '#d3e4fa'
  secondary-fixed-dim: '#b7c8dd'
  on-secondary-fixed: '#0c1d2c'
  on-secondary-fixed-variant: '#384859'
  tertiary-fixed: '#dce5d8'
  tertiary-fixed-dim: '#c0c9bd'
  on-tertiary-fixed: '#161d16'
  on-tertiary-fixed-variant: '#41493f'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  display:
    fontFamily: Bricolage Grotesque
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Bricolage Grotesque
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style
The design system is built on the "Pen to Paper" aesthetic—a transition from rigid digital interfaces to the tactile, thoughtful experience of a physical notebook. It targets users seeking focus, mindfulness, and a human touch in their tools. 

The style is a blend of **Tactile Minimalism** and **Humanist Sketching**. It prioritizes a high degree of "organic imperfection" to reduce the anxiety of a sterile digital canvas. Surfaces should evoke the feeling of heavyweight linen paper or a smooth stone-grey sketchbook. Interaction cues are subtle, utilizing charcoal-like blurs and hand-ruled strokes rather than standard CSS box-shadows. The emotional response is one of calm, deliberate composition and creative freedom.

## Colors
The palette is grounded in natural, matte tones that mimic physical materials.

- **Primary (Sage Green):** Used for primary actions and "fresh" highlights. It should feel like a muted, natural pigment.
- **Secondary (Ink Navy):** This replaces standard black for all text and structural "ink" lines. It provides high legibility while feeling like felt-tip pen ink.
- **Background (Paper):** A warm, off-white with a hint of texture. 
- **Neutral (Stone):** Used for secondary surfaces, dividers, and disabled states, mimicking graphite or light stone washes.

## Typography
The typography strategy creates a bridge between technical precision and hand-drawn warmth.

- **Headlines:** Use **Bricolage Grotesque**. Its quirky, expressive terminals and varying widths mimic the character of high-quality architectural lettering.
- **Body:** Use **Be Vietnam Pro**. Its friendly, rounded humanist shapes offer high readability while maintaining the "soft" ink-on-paper feel.
- **Technical/Labels:** Use **JetBrains Mono** at small scales to represent "notations" or marginalia, suggesting a technical but human-made draft.

Avoid pure black; always use `Ink Navy` for text to soften the digital contrast.

## Layout & Spacing
The layout follows a **Fluid Grid** model but ignores strict geometric perfection.

- **The Margin Rule:** Like a notebook, content should always maintain a generous "safe margin" from the edge of the screen (minimum 32px on desktop).
- **Rhythm:** Use an 8px baseline, but allow for intentional "whitespace breathing." Elements should not feel packed; they should feel like entries on a fresh page.
- **Breakpoints:**
  - **Mobile:** 4-column grid, 16px margins.
  - **Tablet:** 8-column grid, 24px margins.
  - **Desktop:** 12-column grid, 32px margins, max-width 1280px.

## Elevation & Depth
Depth in this design system is achieved through **Charcoal Depth** and **Paper Layering** rather than light-source shadows.

- **Subtle Irregularity:** Instead of standard shadows, use a 1px `Ink Navy` border with a very slight `border-radius` variation to suggest hand-drawn lines.
- **Depth Levels:**
  - **Level 0 (Surface):** The base paper texture.
  - **Level 1 (Elevated):** A soft, blurred 4px "charcoal" smudge (low-opacity navy shadow) offset slightly to the bottom-right.
  - **Level 2 (Overlay):** A thicker 1.5px hand-ruled border combined with a 12px charcoal smudge.
- **The "Ink Bleed":** Selected states can use a subtle "ink bleed" effect—a tiny glow of the primary color that suggests the pen held in one spot for too long.

## Shapes
Shapes must avoid perfect mathematical curves. 

- **Organic Corners:** While the variables define a `0.5rem` base, implementation should use CSS `clip-path` or slightly different radii for each corner (e.g., 8px, 10px, 9px, 11px) to create an "imperfect" hand-cut feel.
- **Dividers:** Never use a straight horizontal rule. Dividers should be "squiggly" or look like a quick pen stroke with varying thickness.

## Components

### Buttons
Buttons should appear as "sketched boxes."
- **Primary:** Solid `Sage Green` fill with a 1px `Ink Navy` hand-drawn border. Text in `Background Paper`.
- **Secondary:** Ghost style with a 1.5px `Ink Navy` border that doesn't quite meet perfectly at one corner.

### Input Fields
Inputs should look like a simple underline or a light stone-grey box. On focus, the bottom border should thicken and "darken" like a fresh ink stroke.

### Cards
Cards use the "Paper Layering" technique. Give cards a very faint linen pattern background-image. Use the Level 1 charcoal smudge for the resting state and Level 2 for hover.

### Chips & Tags
These should look like "hand-torn" pieces of paper or quick circles drawn around text. Use high-contrast `Stone` backgrounds with `Ink Navy` text.

### Icons & Dividers
Icons must be "Hand-Drawn" style (monoline, open strokes). Dividers should look like a "ruler-slipped" line—mostly straight but with organic tremors at the ends.

### Lists
Use "bullet points" that look like hand-filled ink dots or checkmarks that look like quick "v" strokes.