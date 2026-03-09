## Technical Design Spec
### Project: Croc Charm Sheet → Structured JSON (Python)

**Scope:** v1 implementation of the approved PRD (high-recall detection, heuristic split, hosted vision API labeling on crops only, optional crop saving, per-sheet + combined JSON, manifest, run report, overlays for flagged sheets).  
**Non-goals:** pixel-perfect instance masks, dedupe/canonical design IDs, interactive UI.

---

## 1. Architecture overview

### Pipeline stages
1) **Ingest**
- Enumerate input images (file or directory).
- Assign `sheetid`, compute `sheetfingerprint` (optional but useful).

2) **Preprocess**
- Normalize image for detection: resize for detector, optional illumination normalize.
- (Optional) perspective correction *not required for v1* (keep as future hook).

3) **Detect regions (high recall)**
- Produce candidate bounding boxes with scores.
- Apply conservative filters only (drop obvious noise).

4) **Sanity check + retry**
- If count ∉ `[expectedmin, expectedmax]`, rerun detection with alternative parameter profiles up to `maxretries`.

5) **Merged-region split (heuristic)**
- Identify likely merged boxes (oversized / multi-peak).
- Attempt watershed/contour splitting into sub-boxes.
- If split uncertain, keep merged and flag `possiblemerge`.

6) **Crop extraction**
- Pad boxes by `croppaddingpx`, clamp to image bounds.
- If `savecrops=true`, write crops to disk and record paths.
- Always store bbox + padding in JSON, regardless of crop saving.

7) **Hosted labeling (crops only) + caching**
- For each crop: compute `croplabelcachekey` (perceptual hash + dims + checksum).
- If cache hit: reuse prior label output.
- Else: call hosted vision API to generate:
  - `title`, `description`, `keywords`, `category`
  - IP block fields (suspected brands/characters/rightsholder/risk/confidence/rationale)
  - Any model-provided confidence signals where available

8) **Normalization + confidence scoring**
- Normalize keywords; normalize category (and keep `categorymeta.raw/normalized`).
- Compute confidence sub-scores: `detection`, `semantics`, `ip`, `overall`.
- Add `flags` for low confidence and structural concerns.

9) **Emit artifacts**
- Per-sheet JSON
- Optional overlay (flagged sheets only)
- Combined JSON aggregation
- Manifest JSON
- Run report JSON (+ optional Markdown)

---

## 2. Module design (Python packages)

Recommended project layout:
```
croccharms/
  src/croccharms/
    __init__.py
    cli.py
    config.py
    ingest.py
    preprocess.py
    detect/
      __init__.py
      detector_base.py
      opencv_detector.py
      yolo_detector.py          # optional later
      retry_profiles.py
      postfilter.py
    split/
      __init__.py
      heuristic_split.py
    crop.py
    label/
      __init__.py
      api_client.py
      prompts.py
      cache.py
      normalize.py
    score.py
    overlay.py
    export/
      __init__.py
      schema.py
      write_sheet.py
      write_batch.py
      manifest.py
      report.py
    util/
      log.py
      hash.py
      io.py
      timing.py
  tests/
  pyproject.toml
  README.md
```

### Key responsibilities
- `cli.py`: CLI entrypoint, orchestrates pipeline.
- `config.py`: config loading (YAML/JSON/TOML) + CLI overrides.
- `detect/*`: detection implementation + retry scheduling.
- `split/*`: watershed/contour splitting logic.
- `label/*`: hosted API calls + caching + prompt templates + normalization helpers.
- `score.py`: confidence sub-score computation and flagging.
- `export/*`: JSON serialization, manifest and report generation.
- `overlay.py`: draw boxes + IDs for flagged sheets.

---

## 3. Detection strategy (v1)

### v1 baseline: OpenCV region proposals (fastest to implement)
Because perfect cropping isn’t required, start with a pragmatic detector:

**Approach**
- Convert to HSV/Lab; threshold on background separation.
- Morphological close/open to clean.
- Connected components / contour extraction.
- Bounding boxes from contours, with confidence heuristics:
  - area within expected range
  - solidity/extent
  - edge density
  - contour complexity

**High-recall tuning**
- Lower thresholds to over-include.
- Conservative filtering only to remove clearly invalid regions.

### Retry profiles
Define profiles to adjust thresholds and morphology:
- `default`
- `retry_profile_1`: more aggressive foreground detection (lower threshold, larger close kernel)
- `retry_profile_2`: alternative color space or adaptive thresholding

Store in `detect/retry_profiles.py` as structured configs.

### Future upgrade hook (optional)
- Swap in YOLO detector later (`yolo_detector.py`) without changing downstream contracts:
  - `DetectorBase.detect(image)-> List[Detection]` where `Detection = bbox + score + meta`.

---

## 4. Heuristic split design (merged regions)

### Candidate selection
Mark a box as “possibly merged” if:
- box area > `median_area * k` (e.g., k=1.8) OR
- contour shows multiple lobes (convexity defects count) OR
- distance transform reveals multiple peaks

### Split algorithm (watershed)
For each candidate ROI:
- grayscale → blur → threshold
- distance transform
- find peaks as markers
- watershed segmentation
- extract sub-contours → sub-boxes
- validate sub-boxes (size/aspect range)

### Split confidence
Compute:
- number of segments (2–4 acceptable; >6 likely noise)
- segment sizes not too small
- sub-box overlap small
If confidence < threshold: keep original box, flag `possiblemerge`.

---

## 5. Cropping and artifact handling

### Crop generation
- Apply `croppaddingpx` uniformly.
- Clamp to image bounds.
- Write crops only if `savecrops=true`.

### Naming
- Crop path: `output/crops/<sheetid>/<CHARM-ID>.<ext>`
- Overlay path: `output/overlays/<sheetid>_overlay.png`

### Determinism
- Stable ordering:
  - sort detections top-to-bottom, left-to-right (by bbox y then x) before assigning sequential IDs.

---

## 6. Hosted labeling design (API client + prompts)

### API abstraction
Define a generic interface so you can swap providers without rewriting the pipeline:

```python
class VisionLabeler(Protocol):
    def label_crop(self, image_bytes: bytes, mime: str, context: dict) -> dict:
        ...
```

### Prompt strategy (structured output)
Use a strict JSON response format from the hosted model, then validate and repair (single-pass repair, not endless).

**Requested fields from model**
- `title`
- `description`
- `keywords` (array)
- `category`
- `ip`:
  - `flagged`, `suspectedbrands`, `suspectedcharacters`, `rightsholder`, `risklevel`, `rationale`, `confidence`
- `modelconf` (optional): self-reported confidence signals per field

### Guardrails embedded in prompt
- “Describe only visible attributes.”
- “IP names allowed; if uncertain, still name but reduce confidence and explain rationale.”
- “Rightsholder is best-effort; if unknown, return null.”
- “Keywords: avoid filler; prefer concrete visual attributes.”

### Validation
- JSON schema validate model response.
- Normalization pass:
  - keywords: lowercase, trim, dedupe
  - category: store raw + normalized
- If model returns string keywords, split safely.

---

## 7. Caching and cost control

### Cache key
Use a hybrid key:
- perceptual hash (`pHash` or `dHash`) of the crop (robust to small changes)
- dimensions
- byte checksum (sha256 of bytes)

Example cache key:
`{phash}_{w}x{h}_{sha256[:12]}`

### Cache storage
- Recommended: `sqlite` database (`label_cache.sqlite`) with:
  - key → response_json, created_at, provider, model_id

### Rate limiting and retries
- Token bucket limiter per provider constraints.
- Retries with exponential backoff + jitter on 429/5xx.
- Persist partial progress:
  - write per-sheet JSON progressively so a crash doesn’t lose all work.

---

## 8. Confidence scoring (implementation)

### detection score
- Use detector’s native score if available.
- If OpenCV baseline: derive from heuristics:
  - normalized area score
  - edge density / solidity score
  - penalties for extreme aspect ratio
- Scale to 0–1.

### semantics score
Combine:
- model’s self-confidence (if provided)
- penalties:
  - empty title/description
  - excessive keyword count (soft penalty, not hard cap)
  - `possiblemerge` decreases semantics confidence
- Ensure 0–1.

### ip score
- Start from model’s IP confidence
- Penalize if rationale missing or inconsistent

### overall score
Configurable weighted sum, default:
- `overall = 0.45*detection + 0.40*semantics + 0.15*ip`

### Flag rules (examples)
- `needsreview` if:
  - `overall < 0.55` OR
  - `possiblemerge` present OR
  - `ip.flagged == true AND ip.risklevel == "high" AND ip.confidence < 0.6`

---

## 9. Overlays (flagged sheets only)

### Trigger
Generate overlay when:
- `sheetneedsreview=true` OR
- flagged charms exceed threshold (e.g., >20% needsreview)

### Content
- draw bbox rectangles
- draw `CHARM-###` near top-left of bbox

---

## 10. Outputs

### Per-sheet JSON
- `output/sheets/<sheetid>.json`
- Contains the full `run` object and one `sheet`.

### Combined JSON
- `output/batch_<runid>.json`
- Contains all sheets for the run.

### Manifest
- lists inputs with:
  - file path
  - sheetid
  - per-sheet JSON path
  - overlay path (if any)
  - counts and flags

### Report
- `report_<runid>.json` with aggregates and top lists.
- Optional `report_<runid>.md` for readability.

---

## 11. Observability and logging
- Structured logs (JSON lines) with stage timings.
- Log API stats: calls, retries, cache hits, latency.
- Save debug artifacts only when needed (flagged sheets).

---

## 12. Testing strategy

### Unit tests
- bbox sorting and ID assignment determinism
- keyword normalization
- category normalization
- cache key computation
- schema validation for outputs
- confidence computation boundaries

### Integration tests
- Run on a small fixture set:
  - verify artifacts created as expected
  - verify report counts match sum of per-sheet counts
- Mock hosted API responses for deterministic tests.

---

## 13. Implementation choices (recommended defaults)
- Python 3.11+
- Libraries:
  - `opencv-python`, `numpy`
  - `Pillow` (optional)
  - `sqlite3` (stdlib) for caching
  - `pydantic` or `jsonschema` for validation
  - `typer` (or `argparse`) for CLI
  - `tqdm` for progress
  - `imagehash` for perceptual hashing (or implement dHash)

---

## 14. Open items
1) Hosted provider/model for vision labeling (kept abstract in v1 design).
2) Default thresholds:
   - overall review threshold (assumed 0.55)
   - split confidence threshold
3) Whether to generate Markdown report by default.
