# Product Images

Place product photography here. All images should be square (1:1 aspect ratio) for
consistent grid display, or they will be cropped to fit the product card image area.

## Recommended specifications:
- Format: JPG or WebP
- Size: 600x600px minimum, 1200x1200px ideal
- Aspect ratio: 1:1 (square)
- File size: Aim for under 200KB per image (compress with TinyPNG or Squoosh)

## Naming convention:
Use the `data-src` attribute values already in the HTML as the target filenames:

### Signs
- `sign-not-arguing.jpg`
- `sign-smile.jpg`
- `sign-patience.jpg`
- `sign-children.jpg`
- `sign-fridge.jpg`

### Tote Bags
- `tote-sample-1.jpg`
- `tote-sample-2.jpg`
- `tote-sample-3.jpg`

### Zippered Pouches
- `pouch-sample-1.jpg`
- `pouch-sample-2.jpg`

### Apparel
- `tshirt-sample.jpg`
- `cap-sample.jpg`
- `toque-sample.jpg`
- `apron-sample.jpg`

### Accessories
- `croc-charm-sample.jpg`
- `keychain-sample.jpg`
- `wine-bag-sample.jpg`
- `pot-holder-sample.jpg`

### Adults Only
- `adults-canvas-1.jpg` through `adults-canvas-6.jpg`

## Swapping placeholders:
Once images are added, replace the `.placeholder-img` div elements in the HTML
with standard `<img>` tags using the same `data-src` value as the `src`:

```html
<!-- Replace this: -->
<div class="placeholder-img signs" data-src="assets/images/products/sign-smile.jpg" ...>
  <span class="placeholder-icon">🪧</span>
  <span class="placeholder-label">Wooden Sign</span>
</div>

<!-- With this: -->
<img src="assets/images/products/sign-smile.jpg" alt="I Smile Because I Have No Idea What Is Going On — Wooden Sign" loading="lazy">
```

Always include descriptive `alt` text for accessibility (WCAG 2.2 compliance).
