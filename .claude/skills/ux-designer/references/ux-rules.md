# UX Functional Rules

These rules apply to every interface regardless of design direction. They are derived from established cognitive science and usability research. Violating these causes measurable usability degradation.

## Navigation & Information Architecture

**Miller's Law + Hick's Law: Limit choices**
- Maximum 7 top-level navigation items (5 is ideal)
- If a menu has more than 7 items, restructure: group into categories, use mega-menu, or create hierarchy
- Dropdown/flyout menus: maximum 10 items per group, with visual separators every 3-5 items
- Mobile hamburger menus must surface the 2-3 most critical links outside the hamburger

**Jakob's Law: Respect conventions**
- Logo top-left, links to homepage
- Primary navigation top or left
- Search in header, right-aligned or center
- Shopping cart / account icons top-right
- Footer contains secondary nav, legal, contact
- Don't innovate on navigation placement unless there's a compelling reason — and even then, test it

**Serial Position Effect: Strategic placement**
- Most important nav items go first and last
- Calls-to-action at the end of navigation sequences
- In lists of features/benefits: lead with the strongest, end with the second strongest
- Bury lesser items in the middle

## Content & Cognitive Load

**Chunking: Break information into groups**
- No wall of text longer than 3-4 paragraphs without a visual break (heading, image, callout)
- Form fields grouped by topic with clear group labels
- Phone numbers, account numbers, and codes displayed in digit groups (3-4 digits each)
- Related settings and options grouped with visual boundaries (borders, backgrounds, spacing)

**Progressive Disclosure: Show only what's needed now**
- Default to showing less, with clear paths to more
- Expandable/collapsible sections for secondary content
- "Show more" patterns for long lists (show 5, reveal rest)
- Tooltips and info icons for explanatory content, not inline paragraphs
- Multi-step processes over single massive forms

**Working Memory: Don't make users remember**
- Labels always visible (not just placeholder text that disappears on focus)
- Breadcrumbs for multi-level navigation
- Current state always visible (selected filters, active tab, step number)
- Comparison features: show items side by side, never expect users to remember and compare across pages

## Interaction Design

**Fitts's Law: Size and position of targets**
- Touch targets: minimum 44x44px (iOS guideline), 48x48dp (Android guideline)
- Desktop click targets: minimum 32x32px
- Spacing between targets: minimum 8px to prevent mis-taps
- Primary actions are the largest interactive element in their context
- On mobile: primary actions in the thumb zone (bottom 40% of screen)
- On desktop: primary actions positioned center-right or in natural reading flow endpoint
- Destructive actions are physically separated from confirmatory actions

**Flow: Don't break concentration**
- No interstitial popups during task completion
- Auto-save or clear "save" confirmation, never lose user work
- Inline validation (show errors as they occur, not after submission)
- Smooth transitions between states (no jarring page reloads for small changes)
- Loading states preserve layout structure (skeleton screens, not spinners that replace content)

**Goal-Gradient Effect: Show progress**
- Multi-step processes always show a progress indicator
- Step numbers and total visible ("Step 2 of 4")
- Profile/account completion percentage when onboarding
- Progress bars for uploads, installations, data processing
- When within 20% of completion, emphasize proximity to finish

**Doherty Threshold: Speed matters**
- System response under 400ms feels instant — optimize for this
- 400ms-1000ms: show subtle activity indicator (pulsing dot, shimmer)
- 1000ms-5000ms: show progress bar or skeleton screen
- Over 5000ms: show progress bar with time estimate or contextual content while waiting
- Optimistic UI: show the expected result immediately, sync in background

## Visual Hierarchy & Attention

**One Primary Action Per Screen**
- Every view/screen has exactly one thing the user should do. Make it visually dominant.
- Secondary actions are visually subordinate (smaller, less contrast, outline/ghost style)
- Tertiary actions are text-only or minimally styled
- If you can't identify the primary action, the design lacks focus — fix the information architecture first

**Von Restorff Effect: Make important things stand out**
- The standout element must be genuinely different, not just slightly bolder
- Use color contrast, size difference, or spatial isolation
- Only one standout element per section — if everything stands out, nothing does
- Destructive actions (delete, cancel subscription) stand out through color (red) and isolation, not through size

**Selective Attention: Guide the eye**
- Visual hierarchy flows: large/bold → medium/regular → small/muted
- Use whitespace to create importance (more space around something = more important)
- Images and faces draw attention — place them intentionally
- Directional cues (arrows, eye gaze in photos) point toward important content

**Anchoring Bias: Set reference points**
- Show original price before discounted price
- Present premium option first, then standard (makes standard feel like a deal)
- Default form values set expectations ("Donation: $50" anchors higher than empty field)
- Show what "most users" choose to anchor social proof

## Emotional Design

**Peak-End Rule: Memorable moments**
- Design at least one "peak" delight moment per flow (success animation, witty confirmation message, unexpected detail)
- End every flow positively: confirmation pages, thank-you messages, "what's next" guidance
- Error states are the most critical moment — handle them with care, specificity, and a path forward
- Empty states are opportunities for delight, not just "No results found"

**Aesthetic-Usability Effect: Beauty builds trust**
- Visual polish increases user tolerance for minor friction
- First impressions form in 50ms — the above-the-fold experience must be flawless
- Consistent visual language builds subconscious trust
- Broken visual rhythm (misaligned elements, inconsistent spacing) erodes trust faster than slow load times

**Zeigarnik Effect: Open loops motivate**
- Show incomplete profiles, unfinished setups, available-but-unclaimed features
- Notification badges create urgency to resolve
- "You're 80% there" is more motivating than "Complete your profile"
- But respect the user — don't manufacture false incompleteness

## Form Design (specific rules)

- One column layout for forms (two-column forms have measurably higher error rates)
- Labels above inputs (not beside, not inside as placeholder)
- Group related fields and label the groups
- Show requirements upfront (not as error messages after submission)
- Optional fields marked as "(optional)" — don't mark required fields with asterisks alone
- Real-time validation after field blur, not on every keystroke
- Error messages next to the relevant field, in red, with specific remediation text
- Submit button text describes the action ("Create Account", not "Submit")
- After submission: clear success/failure state, disable button to prevent double-submit

## Accessibility (non-negotiable minimums)

- Color contrast: WCAG AA minimum (4.5:1 body text, 3:1 large text / UI components)
- Never convey information by color alone (add icons, text, or patterns)
- All interactive elements keyboard-accessible with visible focus indicators
- Semantic HTML: headings in order (h1 → h2 → h3), landmarks (nav, main, aside), button vs link distinction
- Images: meaningful alt text or aria-hidden if decorative
- Decorative SVGs and icons must have `aria-hidden="true"`
- Form inputs linked to labels via `for`/`id`
- Skip-to-content link as first focusable element — use CSS positioning (not inline JS hacks)
- Reduced motion: respect `prefers-reduced-motion` media query
- Minimum 16px body font size (14px absolute floor for any text)

**Accessible link text: Never repeat generic labels**
- If a page has multiple cards/items that each link somewhere, every link MUST be uniquely identifiable by screen readers
- "Learn more, Learn more, Learn more..." is useless — a screen reader user has no idea which product each link refers to
- Fix: add `aria-label="Product Name — brief description"` to each card's `<a>` tag, and mark the visual "Learn more" text as `aria-hidden="true"`
- Alternatively, include the product name in the visible link text itself (e.g., "Learn more about FilterCodes Pro")
- This applies to any repeated link pattern: "Read more", "View details", "Shop now", etc.

## Section Hierarchy & Visual Prominence

**Category dividers must be visible during casual scanning**
- Tiny monospace uppercase labels (< 0.8rem, muted color) look like metadata, not structural headings — real users don't notice them. In user testing, people scrolled right past category labels styled this way.
- Use proper heading elements (`<h3>` or `<h4>`) at readable sizes (1.2rem+) with strong color contrast for category divisions
- A heading + horizontal rule is the most reliable section divider pattern — the rule catches the eye, the heading provides meaning
- When a section contains countable items, include the count as a visible badge/pill next to the heading (e.g., "16 items", "3 articles") — this helps users understand scope at a glance
- The pattern that tests best for grouped content: `<h3>` in the display font at 1.2-1.4rem + optional count badge in a pill + horizontal rule extending to fill remaining width

## Responsive Design Rules

- Design mobile-first, enhance for desktop — not the reverse
- Breakpoints: 640px (mobile → tablet), 1024px (tablet → desktop), 1280px (desktop → wide)
- Navigation transforms: full nav on desktop, compressed on tablet, hamburger on mobile
- Touch targets increase on smaller screens (48px minimum)
- Content reflows to single column below 640px
- Images scale and crop appropriately (art direction, not just scaling)
- No horizontal scroll on any viewport width
- Test at 320px wide (smallest common mobile) — nothing should break

## Postel's Law: Be forgiving

- Accept varied input formats (phone numbers with/without dashes, names with accents)
- Search is fuzzy/forgiving (handle typos, synonyms, partial matches)
- Undo is available for destructive actions (or at minimum, a confirmation step)
- Auto-save user progress in long forms
- Browser back button works as expected — never break it
- Deep links work — any URL someone shares should load the right state
