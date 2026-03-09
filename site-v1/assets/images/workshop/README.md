# Workshop / Maker Images

Place workshop and in-progress product photography here.

## IMPORTANT:
- NO photos of Patricia personally (per brief)
- Workshop imagery, products in progress, tools, materials — all fine
- Finished products styled/displayed — all fine
- People's hands/arms at work — acceptable
- No faces, no identifiable personal photos

## Files referenced in HTML:
- `workshop-main.jpg` — Used on homepage "Meet the Maker" section
- `workshop-about.jpg` — Used on about.html two-column story section

## Recommended specifications:
- Format: JPG or WebP
- Landscape orientation preferred for two-column layout (4:3 or 16:9 ratio)
- Minimum 800px wide, ideal 1400px wide
- Under 400KB per image after compression

## Swapping placeholders:
Replace the `.placeholder-img.workshop` div elements with `<img>` tags:

```html
<!-- Replace this: -->
<div class="placeholder-img workshop" data-src="assets/images/workshop/workshop-main.jpg" ...>
  <span class="placeholder-icon">🪚</span>
  <span class="placeholder-label">Workshop / Product Photo</span>
</div>

<!-- With this: -->
<img src="assets/images/workshop/workshop-main.jpg" alt="Patricia's workshop — handmade signs and totes in progress" loading="lazy">
```
