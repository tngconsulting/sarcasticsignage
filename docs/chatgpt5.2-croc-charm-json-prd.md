# Product Requirements Document (PRD)
## Project: Croc Charm Sheet → Structured JSON via Image Recognition (Python)

**Document status**
- Version: 1.1 (export)
- Owner: Michael
- Date: 2026-02-27
- Implementation language: Python
- Platforms: Cross‑platform (Windows + Linux; macOS best‑effort)

---

## 1. Summary
Create a Python script that ingests **digital images of Croc charm sheets** (typically **30–60 charms per sheet**, hand-positioned, often touching/near-touching) and outputs **structured JSON** describing each detected charm:

- Auto-generated sequential `id` (`CHARM-001`, `CHARM-002`, …)
- `title` (short, listing-style)
- `description` (longer descriptive text)
- `keywords` (unlimited; normalized & deduped)
- `category` (**AI-generated**, single level)
- `confidence` (overall + sub-scores)
- `ip` block (flags potential IP restrictions; includes suspected brand/character and **suggested rightsholder company to contact** when inferable)

**Cropping does not need to be perfect** for v1. Crops are **saved by default** but can be disabled. **Only crops** are sent to the hosted vision API (never the full sheet).

---

## 2. Goals and non-goals

### 2.1 Goals
1. Batch process images into one charm record per detected charm.
2. Produce “good-enough” charm regions (bounding boxes with padding), even when charms touch.
3. Generate `title` / `description` / `keywords` / `category` via a **hosted vision API**.
4. Provide confidence scores and flags for review.
5. Provide IP restriction detection and rightsholder suggestion (best-effort).
6. Prioritize **recall**: better to over-detect than miss charms.
7. Generate a **run summary report**.

### 2.2 Non-goals (v1)
- Pixel-perfect instance segmentation masks.
- Guaranteed correct IP/character identification.
- Controlled taxonomy / subcategories (removed).
- Interactive labeling UI (CLI-first).

---

## 3. Assumptions and constraints
- Input images resemble phone photos with possible perspective distortion.
- Charms often touch/are close; minimal overlap in crops is acceptable.
- There are **no exact duplicates across the dataset** (no dedupe/canonicalization required for v1).
- Hosted/API labeling is acceptable; privacy stance is **crops only**.
- Manual work should be minimized; v1 relies on pragmatic heuristics rather than full annotation workflows.

---

## 4. Users and use cases
**Primary user:** Michael

**Use cases**
- Process a folder of sheet images → per-sheet JSON + combined JSON + manifest + optional crops.
- Review only flagged sheets (out-of-range counts / low confidence / suspected merges / high IP risk).
- Use JSON for downstream workflows (draft listings, compliance review, analytics).

---

## 5. Inputs

### 5.1 Supported input
- Image files: `.png`, `.jpg`, `.jpeg`
- Batch input: folder path (optionally recursive)

### 5.2 Configuration (CLI flags + config file)
- `idprefix` (default `CHARM-`)
- `startindex` (default `1`)
- `savecrops` (default `true`)
- `cropformat` (`png|jpg`, default `png`)
- `croppaddingpx` (default `20`)
- Detection sanity range:
  - `expectedmin` (default `30`)
  - `expectedmax` (default `60`)
  - `maxretries` (default `2`)
- Hosted API:
  - API key via env var/config
  - model identifier recorded in outputs
- Overlay generation mode:
  - generate overlays **only for flagged sheets** (v1 requirement)
- Run controls (recommended):
  - `--force` (reprocess even if outputs exist)
  - `--maxsheets`, `--maxcharms` (guardrails for testing/cost)

---

## 6. Outputs

### 6.1 Output packaging (required)
**All three are required for v1:**
1. **Per-sheet JSON**: `output/sheets/<sheetid>.json`
2. **Combined JSON**: `output/batch_<runid>.json`
3. **Manifest JSON**: `output/manifest_<runid>.json` (index of inputs/outputs, counts, flags)

### 6.2 Optional artifacts
- **Per-charm crop images** (default on):
  - `output/crops/<sheetid>/<charmid>.<ext>`
- **Debug overlay image** (flagged sheets only):
  - `output/overlays/<sheetid>_overlay.<ext>`
- **Run summary report** (required):
  - `output/report_<runid>.json`
  - optionally `output/report_<runid>.md`

---

## 7. Data model (JSON schema)

### 7.1 High-level structure (per sheet file)
```json
{
  "version": "1.0",
  "run": {
    "runid": "ISO8601+random",
    "scriptversion": "1.0.0",
    "modelinfo": {
      "detector": "name+version",
      "visionlabeler": "api+model+version"
    },
    "settings": {
      "idprefix": "CHARM-",
      "startindex": 1,
      "savecrops": true,
      "croppaddingpx": 20,
      "expectedmin": 30,
      "expectedmax": 60,
      "maxretries": 2
    }
  },
  "sheet": {
    "sheetid": "sheet_0001",
    "sourceimage": "path/to/sheet.png",
    "imagehash": "optional",
    "imagewidth": 3000,
    "imageheight": 2000,
    "detectedcount": 54,
    "sheetneedsreview": false,
    "detectionattempts": [
      { "attempt": 1, "paramsprofile": "default", "count": 52 },
      { "attempt": 2, "paramsprofile": "retry_profile_1", "count": 54 }
    ],
    "overlayimage": "output/overlays/sheet_0001_overlay.png",
    "charms": [ /* charm objects */ ]
  }
}
```

### 7.2 Charm object (per detection)
Required fields:
- `id`, `sheetid`, `index`
- `region.bbox {x,y,w,h}`, `region.paddingpx`
- `title`, `description`, `keywords[]`, `category`
- `confidence { detection, semantics, ip, overall }`
- `ip { flagged, suspectedbrands[], suspectedcharacters[], rightsholder, risklevel, rationale, confidence }`

Optional fields:
- `region.cropimage` (omitted/null when `savecrops=false`)
- `notes`, `flags[]`

Recommended guardrails:
- `categorymeta` to manage category entropy:
  - `raw`, `normalized`, `confidence`, `needsreview`

Example charm (illustrative):
```json
{
  "id": "CHARM-001",
  "sheetid": "sheet_0001",
  "index": 1,
  "region": {
    "bbox": { "x": 123, "y": 456, "w": 210, "h": 190 },
    "paddingpx": 20,
    "rotationdeg": 0,
    "cropimage": "output/crops/sheet_0001/CHARM-001.png"
  },
  "title": "Red Heart Charm - Cartoon Eyes",
  "description": "A glossy red heart-shaped charm with large cartoon-style eyes and a smile.",
  "keywords": ["red", "heart", "cartoon", "eyes", "smile", "glossy"],
  "category": "cartoon hearts",
  "categorymeta": {
    "raw": "Cartoon Heart / Cute",
    "normalized": "cartoon hearts",
    "confidence": 0.58,
    "needsreview": true
  },
  "ip": {
    "flagged": true,
    "suspectedbrands": ["Disney"],
    "suspectedcharacters": ["Mickey Mouse"],
    "rightsholder": "The Walt Disney Company",
    "risklevel": "high",
    "rationale": "Silhouette and facial features resemble Mickey branding.",
    "confidence": 0.62
  },
  "confidence": {
    "detection": 0.88,
    "semantics": 0.55,
    "ip": 0.62,
    "overall": 0.63
  },
  "flags": ["possiblemerge", "needsreview"]
}
```

---

## 8. Functional requirements

### FR1 — Batch ingestion
- MUST accept a single file or directory (optional recursion).
- MUST produce deterministic `sheetid` naming and stable ordering.
- SHOULD support resumability:
  - If per-sheet JSON exists, skip unless `--force`.

### FR2 — Detection and region extraction (high-recall)
- MUST output one charm record per detection.
- MUST operate in **high‑recall** mode by default (avoid missing charms).
- MUST output bounding boxes with configurable padding (`croppaddingpx`).
- SHOULD include conservative post-filters (drop only obvious non-charms: too small, extreme aspect ratio).

### FR3 — Crop saving (optional)
- Default `savecrops=true` saves per-charm crop images.
- If `savecrops=false`, MUST still output `bbox` and omit/null `cropimage`.
- MUST keep cropping deterministic (given same detection results).

### FR4 — Hosted labeling (title/description/keywords/category)
- MUST send **only crops** to hosted API.
- MUST generate:
  - `title`: short, listing-style
  - `description`: visible-attributes description
  - `keywords`: unlimited, normalized & deduped
  - `category`: single-level, AI-generated
- Keyword normalization MUST:
  - lowercase
  - trim whitespace
  - dedupe
  - remove obvious filler/stopwords (configurable)

### FR5 — IP identification and rightsholder metadata
- MUST allow IP naming (brands/characters) in generated text.
- MUST include `ip` block with:
  - `flagged` boolean
  - `suspectedbrands[]`, `suspectedcharacters[]`
  - `rightsholder` (company/org) when inferable (best-effort)
  - `risklevel` in `{low, medium, high}`
  - `rationale`
  - `confidence` 0–1

### FR6 — Confidence scoring
- MUST output sub-scores 0–1:
  - `detection`
  - `semantics` (includes quality checks, e.g., keyword bloat penalty)
  - `ip`
  - `overall` (weighted aggregate; configurable)
- MUST set per-charm flags on thresholds (e.g., `needsreview`).

### FR7 — Sheet-level sanity checks + retry
- If detection count is outside `[expectedmin, expectedmax]`:
  - MUST retry detection with predefined parameter profiles up to `maxretries`
  - MUST always output best result
  - MUST set `sheetneedsreview=true` if still out-of-range after retries
  - MUST store `detectionattempts[]` summary.

### FR8 — Debug overlays for flagged sheets
- If `sheetneedsreview=true` (and optionally other triggers), MUST generate overlay with boxes + IDs.
- v1 rule: overlays are generated **only for flagged sheets**.

### FR9 — API robustness, caching, and cost control
- MUST implement:
  - rate limiting
  - retries with exponential backoff
  - caching for labeling results:
    - key: perceptual hash + size + checksum of crop bytes (to handle subtle differences)
  - resumable runs (skip already-cached crops)
- MUST record API model identifier in `run.modelinfo.visionlabeler`.

### FR10 — Merged-region splitting (heuristic)
- MUST attempt a lightweight split on likely merged boxes before labeling:
  - triggers: unusually large area, multi-peak edges, contour signatures
  - methods: watershed/contour-based splitting (implementation detail)
- If split confidence is low, MUST keep merged box and flag:
  - `flags: ["possiblemerge"]`

### FR11 — Run summary report (required)
- MUST generate `report_<runid>.json` (and optionally `.md`) including:
  - sheets processed, total detections
  - retries and outcomes
  - splits attempted/succeeded
  - API calls, cache hits
  - flagged sheets + reasons
  - category frequency table
  - IP-flagged counts + top rightsholders
  - low-confidence charm list (IDs + links to crops/overlays when available)

---

## 9. Non-functional requirements

### NFR1 — Cross-platform
- MUST run on Windows and Linux; macOS best-effort.
- MUST use `pathlib` for paths and avoid OS-specific assumptions.

### NFR2 — Performance
- SHOULD process a typical 30–60 charm sheet in a practical runtime on a developer workstation.
- MUST avoid memory leaks in long batch runs.

### NFR3 — Maintainability
Pipeline SHOULD be modular:
1) load → preprocess
2) detect regions
3) (optional) split merged regions
4) crop
5) label via API (with caching)
6) score confidence + flags
7) export per-sheet JSON + artifacts
8) assemble combined JSON + manifest + report

---

## 10. Guardrails (to prevent future corner cases)

### Category entropy mitigation (recommended even with free-form categories)
- Store `categorymeta.raw` and `categorymeta.normalized`.
- Mark low-confidence/novel categories with `categorymeta.needsreview=true`.
- Support optional `categoryaliases.json` for later consolidation without reprocessing.

### Hallucination controls (hosted labeling)
- Descriptions should focus on visible attributes.
- IP names are allowed but must carry:
  - explicit confidence
  - rationale
  - rightsholder suggestion marked best-effort

---

## 11. Evaluation and success criteria

### Detection success
- Most sheets end up within expected count range after retries.
- Over-detection tolerated; misses minimized.
- Flagged sheets have overlays that make review fast.

### Labeling success
- Titles are usable (not empty, not extremely long).
- Keywords are normalized and not dominated by filler terms.
- Categories are reasonably coherent (tracked via report frequency).

### Compliance metadata success
- IP flags appear for obvious branded items.
- Rightsholder suggestions are present when likely and clearly labeled.

---

## 12. Milestones

1. CLI + file layout + schema + run metadata
2. Detection baseline + retries + bbox export
3. Optional crop saving + hashing/caching infrastructure
4. Hosted labeling integration (title/description/keywords/category)
5. IP block + confidence scoring + flags
6. Merged-region split heuristics
7. Overlays for flagged sheets
8. Combined JSON + manifest + run report
