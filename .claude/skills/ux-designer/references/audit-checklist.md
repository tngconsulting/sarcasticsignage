# Audit & Fix Checklist

When the user provides existing code or a site to improve, follow this diagnostic framework. The goal is surgical improvement — not a full rebuild unless the existing code is unsalvageable.

## Step 1: Identify What's Worth Keeping

Before changing anything, list what works. Even a bad design usually has some functional elements, established brand colors, or content structure that should be preserved. Changing everything disorients users who are already familiar with the current interface.

Ask yourself:
- Is there an established color palette or brand identity? → Preserve and refine it, don't replace
- Is the content structure logical? → Keep the information architecture, fix the visual presentation
- Are there custom components that work functionally? → Restyle, don't rebuild
- Does the site have existing users? → Preserve navigation patterns they've learned

## Step 2: AI Slop Diagnosis

Check for these specific signatures. Each one you find is a fix target:

### Layout Slop Checklist
- [ ] Three equal-width icon-heading-description cards in a row
- [ ] Perfectly centered hero: heading + subtitle + single CTA
- [ ] Uniform grid of identically-structured cards
- [ ] Perfect bilateral symmetry throughout
- [ ] Every section follows the same structure
- [ ] No variation in section height or density
- [ ] Padding is identical on all elements regardless of content

### Color Slop Checklist
- [ ] Purple/indigo/violet as primary with blue or teal accent
- [ ] Gradient backgrounds (especially purple-to-blue)
- [ ] Overly saturated palette with no muted tones
- [ ] Gray-on-white low-contrast text
- [ ] White cards on light gray background as the only color strategy
- [ ] No warm/cool color temperature — everything is neutral

### Typography Slop Checklist
- [ ] Inter, Roboto, or system-ui as the only typeface
- [ ] All headings same weight, only size varies
- [ ] No typographic hierarchy beyond size
- [ ] Generic 16px text with default line-height
- [ ] No display/body font distinction
- [ ] Letter-spacing and line-height are browser defaults

### Component Slop Checklist
- [ ] Rounded cards with uniform drop shadows
- [ ] Gradient-fill buttons
- [ ] Feature grids that are just card grids with icons
- [ ] Testimonial carousels
- [ ] Generic hero image or SVG illustration
- [ ] Everything fades in from below on scroll
- [ ] Hover effects are only opacity changes
- [ ] Cards with generic "Learn more" links that all look and sound identical to assistive technology
- [ ] Category labels that are visually indistinguishable from metadata (tiny, muted, monospace)

## Step 3: UX Problems Diagnosis

Check for functional usability issues:

### Navigation
- [ ] More than 7 top-level nav items
- [ ] No clear primary action visible above the fold
- [ ] Mobile navigation is just a hamburger with no visible key links
- [ ] No breadcrumbs on multi-level content
- [ ] Current page/section not indicated in navigation

### Content
- [ ] Walls of text without visual breaks
- [ ] Forms with too many fields visible at once
- [ ] Important information buried below the fold
- [ ] No clear visual hierarchy — everything looks equally important
- [ ] Missing empty states (pages that show nothing when there's no data)

### Interaction
- [ ] Tap/click targets smaller than 44px
- [ ] No loading states for async operations
- [ ] Form errors only shown after submission
- [ ] No confirmation for destructive actions
- [ ] Links and buttons visually indistinguishable

### Accessibility
- [ ] Color contrast below WCAG AA (4.5:1)
- [ ] Information conveyed by color alone
- [ ] Missing alt text on meaningful images
- [ ] No visible focus indicators
- [ ] Heading hierarchy broken (h1 → h3 with no h2)
- [ ] Body text below 16px
- [ ] Repetitive generic link text ("Learn more", "Read more", "View details") — screen readers announce a useless list of identical labels
- [ ] Missing `aria-label` on cards/items that link with generic text — each link must be uniquely identifiable
- [ ] Decorative SVGs/icons missing `aria-hidden="true"`
- [ ] No skip-to-content link as first focusable element
- [ ] Skip link implemented with inline JS hacks instead of CSS positioning

### Section Structure
- [ ] Category/section dividers styled as tiny muted text (< 0.8rem) — users don't notice them during scanning
- [ ] Section headings using monospace or all-caps at small sizes — reads as metadata, not structure
- [ ] No visual separator (horizontal rule, border, background change) between content groups
- [ ] Missing item counts on category headings — users can't gauge scope at a glance

## Step 4: Prioritize Fixes

Not all problems are equal. Fix in this order:

### Priority 1: Broken functionality
- Accessibility violations (legal risk, excludes users)
- Navigation failures (users can't find things)
- Interaction bugs (tap targets, form errors, missing states)

### Priority 2: AI slop signatures
- Layout monotony (the biggest visual giveaway)
- Typography sameness
- Color palette genericism

### Priority 3: Refinement
- Spacing and rhythm improvements
- Micro-interaction additions
- Content hierarchy optimization
- Performance and load state improvements

## Step 5: Fix Strategy

### For layout slop:
- Break the grid. Vary column widths. Make one card/item a "featured" size.
- Alternate section structures — if one section is text-left/image-right, the next should NOT be the mirror.
- Vary section heights and content density.
- Introduce asymmetry: 60/40 splits, offset grids, content that doesn't center.

### For color slop:
- If the existing palette is an AI-default (purple/indigo), propose a replacement that fits the context using the design directions catalog.
- If the existing palette has brand intent (they chose these colors), preserve the hues but fix the tonal range — add lighter tints, darker shades, muted variants.
- Replace gradient backgrounds with solid colors or subtle textures.
- Warm up neutral grays (add a hint of the primary color to grays).

### For typography slop:
- Introduce a display/body font distinction if there isn't one.
- Add weight variation to headings (h1 bold, h2 semibold, h3 medium).
- Fix line-height (1.5-1.7 for body) and letter-spacing (slight positive tracking on all-caps labels).
- Increase body text to at least 17-18px if it's at generic 16px.

### For component slop:
- Replace uniform card grids with varied layouts.
- Replace gradient buttons with solid, high-contrast buttons.
- Replace carousel testimonials with static pull-quotes or a stacked layout.
- Replace "fade in from below" with more distinctive entrance animations (clip-path, scale, horizontal slide) — or remove animations entirely if they're gratuitous.

## Step 6: Verify Cohesion

After making fixes, check that the result is internally consistent:
- Do the new elements use the same spacing scale as preserved elements?
- Is there a coherent color system (not just a collection of fixes)?
- Does the typography have a clear hierarchy throughout?
- Do the new and preserved elements feel like they belong to the same design?

If the fixes created a Frankenstein, consider whether the project needs a CLF definition (CSS custom properties) applied globally rather than piecemeal fixes.

## Reporting Fixes to the User

When presenting audit results, be concise:
1. One sentence on what works (preserve their ego about what they built)
2. Top 3 issues ranked by impact
3. The fixes you're applying and why (brief)
4. Show the result

Do NOT write a 20-point audit report. The user wants to see the improvement, not read about it.
