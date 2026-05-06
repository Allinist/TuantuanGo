---
name: ACG Marketplace
colors:
  surface: '#fff8f6'
  surface-dim: '#edd5cf'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ed'
  surface-container: '#ffe9e5'
  surface-container-high: '#fce3dd'
  surface-container-highest: '#f6ddd8'
  on-surface: '#261815'
  on-surface-variant: '#59413c'
  inverse-surface: '#3c2d29'
  inverse-on-surface: '#ffede9'
  outline: '#8d716a'
  outline-variant: '#e1bfb8'
  surface-tint: '#ae3115'
  primary: '#ae3115'
  on-primary: '#ffffff'
  primary-container: '#ff6b4a'
  on-primary-container: '#661000'
  inverse-primary: '#ffb4a3'
  secondary: '#006b59'
  on-secondary: '#ffffff'
  secondary-container: '#86f3d7'
  on-secondary-container: '#00705d'
  tertiary: '#006a69'
  on-tertiary: '#ffffff'
  tertiary-container: '#00acab'
  on-tertiary-container: '#003939'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad2'
  primary-fixed-dim: '#ffb4a3'
  on-primary-fixed: '#3d0600'
  on-primary-fixed-variant: '#8c1900'
  secondary-fixed: '#89f6da'
  secondary-fixed-dim: '#6cd9be'
  on-secondary-fixed: '#002019'
  on-secondary-fixed-variant: '#005142'
  tertiary-fixed: '#76f6f4'
  tertiary-fixed-dim: '#56d9d8'
  on-tertiary-fixed: '#002020'
  on-tertiary-fixed-variant: '#00504f'
  background: '#fff8f6'
  on-background: '#261815'
  surface-variant: '#f6ddd8'
typography:
  display-lg:
    fontFamily: beVietnamPro
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: beVietnamPro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-reg:
    fontFamily: beVietnamPro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: beVietnamPro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: beVietnamPro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  price-display:
    fontFamily: beVietnamPro
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 16px
  element-gap: 12px
  section-margin: 24px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The design system is built to bridge the gap between high-energy fandom culture and professional secondary-market trading. It centers on the **ACG (Anime, Comic, Games)** community, where the visual language must be "Gu-zi" friendly—meaning it showcases merchandise as the hero while maintaining the structural integrity of a secure financial platform.

The aesthetic follows **Modern Minimalism** with a focus on high-clarity information architecture. By utilizing heavy white space and a "content-first" layout, the system ensures that colorful character merchandise doesn't clash with the UI. The emotional goal is to provide users with a sense of excitement during the "Group Buy" process while instilling confidence through clean, balanced interface elements.

## Colors

This design system utilizes a high-conversion palette designed specifically for the WeChat Mini Program environment.

- **Primary (Group Buy Orange):** #FF6B4A is used for primary actions, price points, and urgency indicators. It is the "conversion engine" of the UI.
- **Secondary (Mint Trust):** #64D2B7 provides visual relief. It is used for "Verified" badges, successful transaction states, and secondary navigation elements to balance the warmth of the orange.
- **Neutrals:** The background is a very soft off-white (#F8F9FA) to reduce eye strain during long browsing sessions, while text levels are strictly tiered to ensure readability against the primary color.

## Typography

While the design system defaults to **PingFang SC** for native WeChat performance and Chinese character clarity, the Latin character set and weight distribution follow the logic of **Be Vietnam Pro**. 

The hierarchy is optimized for a 375pt width (standard mobile). Headlines use a tighter tracking to feel modern and "editorial," while body text maintains a generous line height (1.5x) to ensure transaction details and item descriptions are legible in a fast-scrolling environment. Price displays are treated as a distinct typographic class, always using semi-bold or bold weights to emphasize the financial nature of the platform.

## Layout & Spacing

The design system employs a **Fluid Grid** model centered on an 8px rhythmic increment (with 4px sub-units for tight label spacing). 

- **Safe Areas:** Standard side margins are set at 16px to ensure content doesn't hit the screen edges on diverse mobile devices.
- **Card Spacing:** Horizontal gutters between merchandise cards in a 2-column layout are fixed at 12px.
- **Vertical Rhythm:** A 24px margin is used to separate distinct logical sections (e.g., "Trending Now" vs "Your Orders"), creating a clear visual break without the need for heavy dividers.

## Elevation & Depth

To maintain a minimalist feel, the design system avoids heavy shadows in favor of **Ambient Shadows** and **Tonal Layering**.

1.  **Level 0 (Floor):** Background #F8F9FA.
2.  **Level 1 (Cards):** Surface white (#FFFFFF) with a very soft, diffused shadow: `0px 4px 12px rgba(0, 0, 0, 0.05)`. This makes merchandise "pop" without looking dated.
3.  **Level 2 (Active/Floating):** Used for navigation bars and floating action buttons. A slightly more pronounced shadow: `0px 8px 24px rgba(255, 107, 74, 0.15)`, using a tint of the primary color to maintain brand warmth.
4.  **Interactions:** When a card is pressed, it should scale slightly (0.98x) rather than increasing shadow depth, mimicking a physical tactile response.

## Shapes

The shape language is defined by "Friendly Precision." 

Standard containers and cards use a **12px radius** to feel approachable. High-impact elements, such as primary call-to-action buttons and "Group Buy" progress bars, use a **16px radius** or full pill-shape to distinguish them from the layout grid. 

Small UI elements like tags and labels should never be sharp; a minimum 4px radius is required to maintain the system's soft aesthetic.

## Components

The component library focuses on transactional efficiency within the ACG context:

- **Primary Buttons:** Solid #FF6B4A with white text. They use a "squishy" tactile feel on press.
- **Secondary Buttons:** Ghost style with a #FF6B4A border or solid Mint (#64D2B7) for low-priority "success" actions.
- **Merchandise Cards:** The core component. Features a 1:1 aspect ratio image area at the top, 12px rounded corners, and a reserved slot for "Condition" badges (e.g., SSR, New, Used).
- **Status Chips:** Small, pill-shaped indicators using secondary colors (e.g., Light Teal background with Dark Teal text) to indicate "In Stock" or "Shipping."
- **Input Fields:** Minimalist design with a 1px border (#E5E5EA) that shifts to Primary Orange on focus. Labels are always positioned above the field for mobile clarity.
- **Progress Bars:** Used for Group Buy targets. High-contrast orange against a soft grey track, emphasizing the "percentage filled" to drive FOMO (Fear Of Missing Out).