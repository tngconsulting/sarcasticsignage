# Design Directions Catalog

Each direction is a complete, opinionated design system. When selecting a direction, commit fully — don't mix elements from multiple directions. Each entry specifies exact fonts, color construction logic, spacing philosophy, layout approach, and the contexts it suits.

---

## 1. Civic Authority

**Suits:** Government, legal, regulatory, institutional, public services
**Emotional register:** Trustworthy, serious, stable, transparent

**Typography:**
- Display: Source Serif 4 (700) — authoritative serif with modern clarity
- Body: Source Sans 3 (400, 600) — highly readable government-grade sans
- Mono: Source Code Pro (for data/reference numbers)

**Color construction:**
- Primary: Deep navy `#1B2A4A` — authority without being corporate
- Accent: Civic gold `#C5930A` — dignified warmth, used sparingly for CTAs and highlights
- Surface: Warm white `#FAFAF7` — softer than pure white, less sterile
- Surface alt: `#F0EFE9` — subtle warm gray for alternating sections
- Text: `#2D2D2D` — near-black, easier to read than pure black
- Text muted: `#6B6B6B`
- Border: `#D4D2CB`
- Success: `#2E7D32`, Warning: `#E65100`, Error: `#C62828`

**Spacing:** Generous, formal. Base unit 8px. Sections separated by 64-80px. Content max-width 960px (narrower than typical — for readability of policy/legal content).

**Layout approach:** Single-column dominant with optional sidebar for navigation. Strong horizontal rules between sections. Table-based data presentation preferred over cards. Left-aligned text throughout — no centering except page titles. Sticky table of contents for long-form content.

**Distinguishing details:** Thin top border accent line (4px civic gold). Subtle paper-like texture on surface. Breadcrumb navigation always present. Print-friendly layout considerations. No decorative imagery — functional only.

---

## 2. Academic Commons

**Suits:** Education, universities, LMS platforms, research, training portals
**Emotional register:** Approachable, structured, intellectually curious, welcoming

**Typography:**
- Display: Fraunces (700, italic for feature headings) — warm, scholarly serif with personality
- Body: Atkinson Hyperlegible (400, 700) — designed for maximum readability/accessibility
- Mono: JetBrains Mono (for code examples)

**Color construction:**
- Primary: Scholarly green `#2D5F2D` — growth, knowledge, calm authority
- Accent: Warm amber `#D4870E` — inviting, highlights key interactions
- Surface: `#FFFDF7` — warm cream, textbook feel
- Surface alt: `#F5F0E6` — parchment-like warmth
- Text: `#1A1A1A`
- Text muted: `#5C5C5C`
- Border: `#D6CDB7`
- Success: `#388E3C`, Warning: `#F57C00`, Error: `#D32F2F`

**Spacing:** Comfortable reading rhythm. Base unit 8px. Generous line-height (1.7 for body). Paragraph spacing 1.5em. Content max-width 720px for body text (optimal reading width).

**Layout approach:** Content-first, magazine-inspired. Wide margins on desktop (like a textbook). Pull quotes and callout boxes break up long content. Sidebar for related resources/navigation on wider screens, collapsing to in-flow on mobile. Card-based layouts only for course/module overviews, using 2-column grid (not 3).

**Distinguishing details:** Subtle ruled lines under headings (like notebook paper). Progress indicators for multi-step content. Generous use of white space around learning objectives/key takeaways. Warm, hand-drawn-feel icons if icons are needed.

---

## 3. Nordic Precision

**Suits:** SaaS products, developer tools, B2B software, technical documentation
**Emotional register:** Clean, efficient, premium, quietly confident

**Typography:**
- Display: General Sans (600, 700) — geometric but warm, modern sans
- Body: General Sans (400) — same family for cohesion, technical feel
- Mono: Berkeley Mono or Fira Code (for code)

**Color construction:**
- Primary: Deep charcoal `#1C1C1E` — premium, ink-like
- Accent: Electric teal `#00B4A6` — sharp contrast, technical energy
- Surface: `#FFFFFF` — crisp white, no warmth
- Surface alt: `#F7F7F8` — barely-there gray
- Text: `#1C1C1E`
- Text muted: `#71717A`
- Border: `#E4E4E7`
- Success: `#10B981`, Warning: `#F59E0B`, Error: `#EF4444`

**Spacing:** Tight but precise. Base unit 4px. Dense information layout. Content max-width 1200px. Small gaps between related items, larger gaps between sections.

**Layout approach:** Grid-based, modular. Asymmetric layouts with strong left rail for navigation. Dense data tables welcome. Cards only for dashboard widgets, never for marketing feature lists. Strong use of tabbed interfaces and collapsible sections to manage density.

**Distinguishing details:** Monospaced text for labels and metadata. Subtle dot-grid or fine-line backgrounds. Dark mode variant is the natural home for this direction. Micro-interactions: precise, short (150ms), functional not decorative. Status indicators use colored dots, not full background fills.

---

## 4. Warm Commerce

**Suits:** E-commerce, product pages, subscription services, small business retail
**Emotional register:** Inviting, premium but accessible, trustworthy, action-oriented

**Typography:**
- Display: DM Serif Display (400) — elegant product-forward serif
- Body: DM Sans (400, 500, 700) — clean, friendly, highly legible
- Mono: Not typically needed

**Color construction:**
- Primary: Rich terracotta `#C44B25` — warm, energetic, earthy
- Accent: Deep forest `#1B4332` — grounding contrast, trust signal
- Surface: `#FBF9F6` — warm off-white
- Surface alt: `#F2EDE6` — sand-like warmth
- Text: `#1A1612` — warm near-black
- Text muted: `#7A7067`
- Border: `#DDD6CB`
- Success: `#2D6A4F`, Warning: `#E76F00`, Error: `#B91C1C`

**Spacing:** Medium-generous. Base unit 8px. Product imagery gets room to breathe. Content max-width 1140px.

**Layout approach:** Asymmetric product grids (not equal-width cards). Hero images span full width. Product cards vary in size to create visual rhythm — feature a hero product larger, supporting products smaller. Sticky add-to-cart on mobile. Trust signals (reviews, guarantees) positioned near conversion points.

**Distinguishing details:** Subtle organic shapes as decorative dividers (curved section separators instead of straight lines). Product photography is the star — UI gets out of the way. Price typography is larger and bolder than surrounding text. Micro-animations on add-to-cart. Warm shadows (tinted, not neutral gray).

---

## 5. Studio Minimal

**Suits:** Creative agencies, portfolios, design studios, freelancer sites
**Emotional register:** Confident, editorial, curated, intentionally sparse

**Typography:**
- Display: Syne (700, 800) — distinctive geometric display with character
- Body: Instrument Sans (400, 500) — clean, modern, stays out of the way
- Mono: Space Mono (for captions, metadata)

**Color construction:**
- Primary: True black `#000000` — maximum contrast, zero compromise
- Accent: Signal red `#E63B2E` — arresting, used only for interactive elements and rare emphasis
- Surface: `#F5F5F0` — warm light gray, not sterile white
- Surface alt: `#EAEAE4`
- Text: `#000000`
- Text muted: `#666660`
- Border: `#CCCCC6`

**Spacing:** Extreme. Base unit 8px but sections may be 120-160px apart. Content max-width varies — some sections bleed full width, others are narrow 600px columns.

**Layout approach:** Dramatically asymmetric. Large type used as a compositional element. Grid-breaking intentional — elements overlap, extend beyond containers, or align to unexpected baselines. Scroll-triggered reveals but NOT fade-in-from-below (use clip-path reveals, horizontal slides, or scale transforms). Image-text layouts where image takes 60-70% width.

**Distinguishing details:** Mix of giant display type and tiny caption text for dramatic scale contrast. Numbered sections. Project showcases use full-bleed imagery. Horizontal scrolling for portfolio galleries. Cursor interactions (custom cursor on hover over projects). Minimal color — let the work provide color.

---

## 6. Mission Driven

**Suits:** Non-profits, NGOs, community organizations, social enterprises, charities
**Emotional register:** Warm, human, purposeful, inclusive, hopeful

**Typography:**
- Display: Libre Baskerville (700) — classic, trustworthy, humanist serif
- Body: Open Sans (400, 600) — universally readable, inclusive
- Mono: Not needed

**Color construction:**
- Primary: Deep ocean `#1A5276` — trustworthy, calming, purposeful
- Accent: Sunrise orange `#E67E22` — hope, energy, warmth
- Surface: `#FFFFFF`
- Surface alt: `#F4F7F9` — cool light blue-gray
- Text: `#2C3E50`
- Text muted: `#7F8C8D`
- Border: `#D5DBDB`
- Success: `#27AE60`, Warning: `#F39C12`, Error: `#E74C3C`

**Spacing:** Generous, breathing. Base unit 8px. Sections 64px apart. Content max-width 1040px. Wide margins create a sense of openness.

**Layout approach:** People-first imagery. Impact statistics presented large and bold, not hidden in body text. Two-column layouts for story + data pairings. Donation/action CTAs repeated at logical emotional peaks in content flow, not just at the bottom. Testimonials presented as quotes with real photos, not cards in a carousel.

**Distinguishing details:** Rounded UI elements (8-12px radius) — nothing sharp. Photo treatments: slight warm overlay to unify diverse photography. Impact numbers use the display font at large scale. Progress bars for fundraising goals. Gentle animations — nothing flashy. Accessibility is paramount: WCAG AAA where possible.

---

## 7. Corporate Precision

**Suits:** Enterprise B2B, consulting firms, financial services, professional services
**Emotional register:** Authoritative, polished, competent, no-nonsense

**Typography:**
- Display: Plus Jakarta Sans (700, 800) — modern geometric with professional warmth
- Body: Plus Jakarta Sans (400, 500) — cohesive single-family system
- Mono: IBM Plex Mono (for data)

**Color construction:**
- Primary: Steel blue `#2B4C7E` — corporate trust, less generic than navy
- Accent: Brass `#B8860B` — understated premium
- Surface: `#FFFFFF`
- Surface alt: `#F8F9FA`
- Text: `#212529`
- Text muted: `#6C757D`
- Border: `#DEE2E6`

**Spacing:** Structured, efficient. Base unit 8px. Tight component spacing, more generous section spacing. Content max-width 1200px.

**Layout approach:** Grid-disciplined. Strong alignment throughout. Data visualizations and charts prominently placed. Asymmetric 2-column layouts for content: 60/40 or 65/35 splits, not 50/50. White papers and case studies use pull-quote callouts. Navigation is comprehensive but organized in mega-menus.

**Distinguishing details:** Thin horizontal rules as section dividers. Subtle use of the brass accent — only in key moments (CTAs, selected states, data highlights). Stats and KPIs displayed in a distinctive horizontal strip. Testimonials presented as named, titled endorsements — no anonymous quotes. Clean iconography: outlined, not filled.

---

## 8. Playful Product

**Suits:** Consumer apps, startup landing pages, lifestyle brands, SaaS for non-technical users
**Emotional register:** Friendly, energetic, approachable, modern, delightful

**Typography:**
- Display: Clash Display (600, 700) — bold, quirky, personality-forward
- Body: Satoshi (400, 500, 700) — friendly geometric sans
- Mono: Not typically needed

**Color construction:**
- Primary: Vivid violet `#6C3CE9` — BUT not the AI-slop purple-gradient version. Solid, confident, paired with its complement
- Accent: Lime `#A3E635` — unexpected energy, high contrast with violet
- Surface: `#FAFAFA`
- Surface alt: `#F0F0F0`
- Text: `#18181B`
- Text muted: `#71717A`
- Border: `#E4E4E7`
- Success: `#22C55E`, Warning: `#EAB308`, Error: `#EF4444`

**Spacing:** Rhythmic, bouncy. Base unit 8px. Generous padding inside components. Sections flow with varied spacing — tight for related groups, loose for topic changes. Content max-width 1080px.

**Layout approach:** Bento grid — varied card sizes in a magazine-like composition. Hero sections use angled or curved dividers instead of straight horizontal lines. Feature sections alternate layout direction (text-left/image-right, then reverse). Floating elements and subtle rotations create energy without chaos.

**Distinguishing details:** Pill-shaped buttons and tags. Colored component backgrounds (not just white cards on gray). Playful hover animations: subtle bounces, rotations, color shifts. Emoji used functionally in UI (✓ instead of a checkmark icon). Dashed borders for secondary containers. Sticker-like decorative elements.

---

## 9. Data Dense

**Suits:** Admin dashboards, analytics platforms, monitoring tools, CRM interfaces
**Emotional register:** Efficient, powerful, professional, information-rich

**Typography:**
- Display: Inter Tight (600, 700) — compact, data-optimized (NOT regular Inter for body)
- Body: IBM Plex Sans (400, 500) — designed for data-heavy interfaces
- Mono: IBM Plex Mono (for numbers, codes, IDs)

**Color construction:**
- Primary: Ink blue `#0F172A` — dark, dense, serious
- Accent: Action blue `#3B82F6` — clear interactive signal
- Surface: `#FFFFFF` (light mode) or `#0F172A` (dark mode — dark is default for this direction)
- Surface alt: `#F1F5F9` (light) or `#1E293B` (dark)
- Text: `#0F172A` (light) or `#E2E8F0` (dark)
- Text muted: `#64748B`
- Border: `#E2E8F0` (light) or `#334155` (dark)
- Chart palette: `#3B82F6`, `#10B981`, `#F59E0B`, `#EF4444`, `#8B5CF6`, `#EC4899`

**Spacing:** Tight. Base unit 4px. Minimal padding in table cells. Dense sidebar navigation. Content is full-width — no max-width constraint.

**Layout approach:** Sidebar + main content + optional detail panel (three-column when space allows). Data tables are the primary content element — not cards, not charts alone. Charts support tables, they don't replace them. Sticky headers on tables. Collapsible sidebar for maximum content width. Tab bars for switching views.

**Distinguishing details:** Numbers right-aligned in tables. Status badges: small, colored pills. Sparkline charts inline with table rows. Keyboard shortcuts indicated in tooltips. Compact mode by default, comfortable mode as user preference. Subtle zebra striping on tables. Monospaced numbers throughout (tabular-nums).

---

## 10. Heritage Craft

**Suits:** Artisan products, craft brands, restaurants, wineries, boutique hospitality
**Emotional register:** Authentic, warm, handcrafted, storied, premium

**Typography:**
- Display: Playfair Display (700, 900) — classic editorial with old-world elegance
- Body: Lora (400, 500) — readable serif that pairs naturally with Playfair
- Accent font: Caveat or similar (for handwritten-feel callouts, sparingly)

**Color construction:**
- Primary: Wine `#5B1A2A` — rich, deep, artisanal
- Accent: Aged gold `#B5922E` — patina, premium
- Surface: `#FDF8F0` — cream, parchment-like
- Surface alt: `#F3EBD9` — deeper cream
- Text: `#2A1A0E` — warm dark brown
- Text muted: `#7A6A5E`
- Border: `#D4C5AE`

**Spacing:** Gracious. Base unit 8px. Extra generous margins and padding. Content max-width 960px. Everything breathes.

**Layout approach:** Long-scroll storytelling. Large full-bleed photography between content sections. Text overlaid on images with proper contrast (text on a semi-transparent background, not directly on photos). Parallax scrolling used subtly — only one or two sections, not the entire page. Menu/product listings in a single column, not grid.

**Distinguishing details:** Decorative rules and ornaments between sections (thin, elegant, not busy). All-caps tracking on small labels and category text. Pull quotes in the display font at large size. Subtle grain texture on backgrounds. Photography is warm-toned and editorial. No stock photos — if you must use placeholders, use solid color blocks with the display font, not generic images.

---

## 11. Tech Forward

**Suits:** AI/ML products, developer platforms, API documentation, tech startups
**Emotional register:** Cutting-edge, intelligent, technical credibility, futuristic but usable

**Typography:**
- Display: Space Grotesk (700) — geometric, technical, distinctive (only use if the user hasn't specified no Space Grotesk, and never reuse across projects)
- Body: Geist (400, 500) — Vercel's clean modern sans (or Manrope as fallback)
- Mono: Geist Mono or JetBrains Mono

**Color construction:**
- Primary: Void black `#09090B` — the abyss
- Accent: Phosphor green `#22D3EE` — terminal energy, data streams
- Surface: `#09090B` (dark mode default) or `#FAFAFA` (light)
- Surface alt: `#18181B` (dark) or `#F4F4F5` (light)
- Text: `#FAFAFA` (dark) or `#09090B` (light)
- Text muted: `#A1A1AA`
- Border: `#27272A` (dark) or `#E4E4E7` (light)

**Spacing:** Moderate-tight. Base unit 4px. Code blocks get generous padding. Content max-width 1280px for docs, 960px for marketing.

**Layout approach:** Left-aligned documentation style even for marketing. Code examples prominently displayed — not hidden in tabs. Terminal/console aesthetics: command examples in styled code blocks. Three-column docs layout (nav / content / on-page ToC). Marketing sections use split layouts: explanation left, live demo or code right.

**Distinguishing details:** Gradient text on hero headings (used once, not everywhere). Grid lines or dot patterns as subtle background decoration. Animated code typing effects for hero sections. API endpoint styling as a design element. Version badges. Glassmorphism for floating elements (frosted glass over dark backgrounds). Terminal-green accents.

---

## 12. Editorial Longform

**Suits:** Blogs, magazines, news sites, content platforms, essay-focused sites
**Emotional register:** Thoughtful, readable, intellectual, immersive

**Typography:**
- Display: Newsreader (700) — editorial serif designed for reading
- Body: Charter or Literata (400, 400 italic, 700) — optimized for long-form reading
- Sans accent: Work Sans (500, 600) — for UI elements, metadata, navigation

**Color construction:**
- Primary: Ink `#1A1A2E` — deep, rich, editorial
- Accent: Vermillion `#D4380D` — editorial tradition, links and emphasis
- Surface: `#FFFFF8` — warm white, easy on eyes for long reading
- Surface alt: `#F7F5EE`
- Text: `#1A1A2E`
- Text muted: `#6B6B80`
- Border: `#D4D4DC`

**Spacing:** Reading-optimized. Base unit 8px. Body text at 18-20px. Line-height 1.7-1.8. Paragraph spacing 1.5em. Content max-width 680px for body text (the optimal measure). Wider for images/media (up to 1000px).

**Layout approach:** Single-column reading with breakout elements. Images and pull quotes can break the column width. Sticky reading progress bar. Estimated reading time. Footnotes as sidenotes on wide screens, inline on narrow. Related content at the end, not in the sidebar. Table of contents that highlights current section.

**Distinguishing details:** Drop caps on article openings. Serif body text (uncommon in web, immediately distinctive). Author bylines with small photos. Category labels as small caps. Blockquotes with left border in accent color. Figure captions in sans-serif, smaller, muted. No infinite scroll — paginated or single long article.

---

## 13. Quiet Luxury

**Suits:** High-end brands, luxury real estate, premium services, fine dining, hospitality
**Emotional register:** Exclusive, refined, understated, aspirational

**Typography:**
- Display: Cormorant Garamond (300, 600) — light weight for elegance, bold for impact
- Body: Jost (300, 400) — light, airy, geometric elegance
- Mono: Not needed

**Color construction:**
- Primary: Charcoal `#2C2C2C` — understated, never garish
- Accent: Champagne `#C9B99A` — subtle warmth, luxury without flash
- Surface: `#FAF9F6` — barely warm white
- Surface alt: `#F0EEEA`
- Text: `#2C2C2C`
- Text muted: `#8C8C84`
- Border: `#E0DDD6`

**Spacing:** Luxuriously generous. Base unit 8px. Sections 100-120px apart. Content max-width 1000px. Extreme whitespace is the luxury signal.

**Layout approach:** Less is more, dramatically. Large-scale photography with minimal text overlay. Single products/properties presented one at a time, full viewport. Horizontal scrolling for galleries. Minimal navigation — a single menu icon that reveals a full-screen overlay. Text content is sparse but precisely placed.

**Distinguishing details:** Extreme font weight contrast (300 body next to 600 display). All-caps letterspaced text for labels and navigation. No drop shadows anywhere — flat, clean. Transitions are slow and smooth (400-600ms). Muted, desaturated photography. No badges, no pop-ups, no urgency tactics. The absence of typical web elements IS the design statement.

---

## 14. Community Hub

**Suits:** Forums, member portals, social platforms, user communities, internal tools
**Emotional register:** Belonging, active, participatory, organized, alive

**Typography:**
- Display: Nunito (700, 800) — rounded, friendly, community-feeling
- Body: Nunito Sans (400, 600) — paired family, clean and readable
- Mono: Fira Code (for technical communities)

**Color construction:**
- Primary: Friendly indigo `#4338CA` — approachable but organized
- Accent: Coral `#FB7185` — warmth, notifications, activity
- Surface: `#FFFFFF`
- Surface alt: `#F5F3FF` — tinted with primary for cohesion
- Text: `#1E1B4B`
- Text muted: `#6B7280`
- Border: `#E5E7EB`
- Online/active: `#22C55E`

**Spacing:** Compact but not cramped. Base unit 4px. Tighter spacing in feed/list views. More generous in profile/about pages. Content max-width varies: feed 640px, full layouts 1200px.

**Layout approach:** Feed-based main content. User avatars are prominent and consistent in size. Threaded conversation views. Sidebar for categories/channels. Activity indicators throughout (online dots, recent activity timestamps). Card-based only for user profiles and project showcases.

**Distinguishing details:** Avatar-forward design — user presence is visible everywhere. Reaction systems (not just likes). Badge systems for user status/achievements. Unread indicators and notification counts. Warm micro-interactions on engagement actions. Subtle background color to distinguish your own content from others'. Real-time activity indicators.

---

## 15. Utility First

**Suits:** Internal tools, admin panels, form-heavy applications, back-office systems
**Emotional register:** Efficient, functional, clear, no-frills, workmanlike

**Typography:**
- Display: System UI stack (no external font load — speed matters)
- Body: System UI stack — `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`
- Mono: System mono — `ui-monospace, "Cascadia Code", "Source Code Pro", monospace`

**Color construction:**
- Primary: Neutral `#374151` — no personality by design
- Accent: Utility blue `#2563EB` — clear interactive signal, nothing else
- Surface: `#FFFFFF`
- Surface alt: `#F9FAFB`
- Text: `#111827`
- Text muted: `#6B7280`
- Border: `#E5E7EB`
- Success: `#059669`, Warning: `#D97706`, Error: `#DC2626`

**Spacing:** Maximum efficiency. Base unit 4px. Compact form layouts. Dense but readable tables. Full-width — every pixel is functional.

**Layout approach:** Forms dominate. Group related fields with clear fieldset labels. Horizontal form layouts on wide screens (label left, input right). Action buttons right-aligned and visually weighted by importance. Data tables with inline editing. Tab-based navigation between sections. No hero sections, no marketing, no fluff.

**Distinguishing details:** This direction is intentionally undesigned — it looks like a well-built tool, not a marketing site. Focus indicators are prominent (accessibility). Error states are inline and specific. Confirmation dialogs for destructive actions. Batch action toolbars. Keyboard-navigable throughout. Loading states use skeleton screens matching the layout.

---

## Selection Matrix

Use this to quickly narrow candidates:

| Context | Primary Candidates | Avoid |
|---|---|---|
| Government/public sector | Civic Authority, Utility First | Playful Product, Studio Minimal |
| University/education | Academic Commons, Editorial Longform | Quiet Luxury, Data Dense |
| LMS/training platform | Academic Commons, Community Hub | Studio Minimal, Heritage Craft |
| E-commerce/products | Warm Commerce, Heritage Craft | Civic Authority, Data Dense |
| SaaS B2B | Nordic Precision, Corporate Precision | Heritage Craft, Mission Driven |
| SaaS B2C / consumer app | Playful Product, Community Hub | Civic Authority, Corporate Precision |
| Creative agency/portfolio | Studio Minimal, Editorial Longform | Utility First, Civic Authority |
| Developer tools/API | Tech Forward, Nordic Precision, Data Dense | Heritage Craft, Mission Driven |
| Non-profit/charity | Mission Driven, Academic Commons | Quiet Luxury, Data Dense |
| Dashboard/analytics | Data Dense, Nordic Precision | Heritage Craft, Editorial Longform |
| Restaurant/hospitality | Heritage Craft, Quiet Luxury | Data Dense, Utility First |
| Blog/content platform | Editorial Longform, Academic Commons | Data Dense, Utility First |
| Luxury brand | Quiet Luxury, Studio Minimal | Playful Product, Utility First |
| Community/forum | Community Hub, Playful Product | Quiet Luxury, Civic Authority |
| Internal tool/admin | Utility First, Data Dense | Quiet Luxury, Studio Minimal |
| Moodle plugin sales page | Warm Commerce, Academic Commons, Nordic Precision | Quiet Luxury, Studio Minimal |
| Product/plugin catalog | Corporate Precision, Warm Commerce, Nordic Precision | Studio Minimal, Quiet Luxury, Editorial Longform |

---

## Direction-Content Density Rules

**Match the direction's layout density to the content volume.** This is the single most common selection error. A direction designed for sparse, editorial presentation will fail when applied to dense, multi-item content — and vice versa.

### High-density content (many items to browse/compare)
Examples: product catalogs, plugin directories, course listings, job boards, resource libraries, documentation indexes

**Use:** Corporate Precision, Warm Commerce, Nordic Precision, Data Dense, Utility First
**Avoid:** Studio Minimal, Quiet Luxury, Editorial Longform

Why: High-density content needs uniform card sizes for easy scanning, compact spacing to show more items per viewport, and strong grid discipline. Directions that use dramatic spacing, asymmetric layouts, or single-item-per-viewport presentation make comparison impossible and waste screen real estate.

### Low-density content (few items, each deserving focus)
Examples: portfolios, case studies, product detail pages, agency showcases, landing pages with 3-5 sections

**Use:** Studio Minimal, Quiet Luxury, Heritage Craft, Editorial Longform
**Avoid:** Data Dense, Utility First

Why: When each item deserves individual attention, generous spacing and dramatic presentation create the right emotional impact. Dense, utilitarian layouts make premium content feel cheap.

### Mixed-density content (some sections dense, some sparse)
Examples: homepages with hero + feature grid + testimonials, dashboards with KPIs + data tables

**Use:** Pick the direction that matches the *dominant* content type. For the minority sections, adapt the direction's tokens while respecting its overall feel — don't switch directions mid-page.

### Color palette perception outside original context
A direction's colors carry emotional associations beyond their intended context. Green + amber reads as "nature/organic" to general audiences, not "education." Blue + gold reads as "professional/financial." Red + black reads as "bold/aggressive." When selecting a direction for an audience outside its primary context, evaluate whether the color associations will feel right to *that* audience — not just whether the direction's layout fits.
