# Product Requirements Document
## Croc Charm Image Recognition Pipeline
**Version:** 1.0  
**Date:** 2025-02-27  
**Author:** TNG Consulting Inc.  
**Status:** Draft

---

## 1. Project Overview

A Python-based batch image processing pipeline that accepts photographs of Croc Charm sheets, detects and optionally crops individual charms using a cloud vision LLM, and outputs structured JSON metadata suitable for consumption by a custom web store front-end. The pipeline is designed for high-volume, repeatable runs with built-in cost tracking, retry logic, a human review queue, and model-agnostic configuration.

---

## 2. Goals and Non-Goals

### Goals
- Detect individual charms in hand-arranged, loosely-grouped sheet photographs
- Generate structured JSON metadata per charm via a cloud vision LLM (single API call per image)
- Optionally generate and save individual charm image crops
- Flag low-confidence results into a separate review queue
- Support high-volume batch processing with rate limiting, retry logic, and cost tracking
- Produce deterministic charm IDs to prevent cross-run collisions
- Remain model-agnostic via configuration (no hardcoded model names)

### Non-Goals
- Direct database writes (output is JSON files for import)
- UI or web interface (CLI tool only)
- Official Jibbitz SKU matching (visual inference only)
- Training a custom ML model (deferred to future phase if needed)

---

## 3. Users and Use Case

**Primary user:** TNG Consulting Inc. operator (Michael or delegated staff)  
**Use case:** Process batches of charm sheet photographs to generate product catalog JSON for a custom-coded web store page, with a human review pass for low-confidence items before publishing.

---

## 4. Input Specification

| Property | Details |
|---|---|
| Format | JPEG or PNG (phone camera photos) |
| Typical resolution | 3000–4000px+ on longest edge |
| Charms per sheet | 30–60, hand-arranged in loose columns |
| Charm characteristics | Rubber/PVC, variable size, touching or overlapping, high-gloss surface |
| Known challenges | Perspective distortion, shadows, irregular spacing, overlapping charms |

### Input Directory Structure
```
/input/
  batch_2025-02-27/
    sheet_001.jpg
    sheet_002.jpg
    ...
```

---

## 5. Output Specification

### 5.1 Primary Output — Charm JSON

One JSON file per processed batch, containing an array of charm objects.

**Schema:**
```json
{
  "batch_id": "2025-02-27-a3f9",
  "processed_at": "2025-02-27T14:32:00Z",
  "total_charms": 54,
  "total_cost_usd": 0.42,
  "charms": [
    {
      "id": "CHM-a3f9-001",
      "batch_id": "2025-02-27-a3f9",
      "source_image": "sheet_001.jpg",
      "title": "Buzz Lightyear Full Body Flying Pose",
      "description": "Buzz Lightyear in his iconic purple and white space suit, arms extended in a flying pose. From the Toy Story franchise.",
      "keywords": ["Toy Story", "Buzz Lightyear", "Pixar", "Disney", "space ranger", "purple", "white"],
      "category": "Movies & TV",
      "confidence": 0.91,
      "confidence_tier": "high",
      "crop_path": "output/crops/2025-02-27-a3f9/CHM-a3f9-001.jpg",
      "bounding_box": {
        "x": 142,
        "y": 88,
        "width": 210,
        "height": 195
      },
      "created_at": "2025-02-27T14:32:11Z"
    }
  ]
}
```

**Field Definitions:**

| Field | Type | Description |
|---|---|---|
| `id` | string | Deterministic charm ID (see Section 6.3) |
| `batch_id` | string | Run identifier (date + short hash) |
| `source_image` | string | Filename of the originating sheet image |
| `title` | string | Charm name as identified by LLM |
| `description` | string | 1–3 sentence product description for web display |
| `keywords` | array[string] | Search/filter keywords (character, franchise, color, theme) |
| `category` | string | Standardized category label (see Section 6.4) |
| `confidence` | float | LLM-reported confidence score (0.0–1.0) |
| `confidence_tier` | string | `high` (≥0.80), `medium` (0.60–0.79), `low` (<0.60) |
| `crop_path` | string\|null | Relative path to crop image, or null if crops disabled |
| `bounding_box` | object\|null | Pixel coordinates in source image, or null if not available |
| `created_at` | string | ISO 8601 timestamp |

### 5.2 Review Queue Output

A separate JSON file per batch containing only low and medium confidence charms, plus their image crops (always generated for review queue items regardless of global crop setting).

```json
{
  "batch_id": "2025-02-27-a3f9",
  "review_count": 7,
  "items": [
    {
      "id": "CHM-a3f9-023",
      "confidence": 0.52,
      "confidence_tier": "low",
      "llm_raw_response": "...",
      "crop_path": "output/review/2025-02-27-a3f9/CHM-a3f9-023.jpg",
      "suggested_title": "Unknown Pink Bear Charm",
      "reviewer_notes": null,
      "reviewed": false,
      "approved": null
    }
  ]
}
```

### 5.3 Run Log

Append-only JSONL log file tracking every run for auditing and cost management.

```
output/logs/run_log.jsonl
```

Each line:
```json
{"run_id": "2025-02-27-a3f9", "started_at": "...", "completed_at": "...", "sheets_processed": 3, "charms_detected": 54, "review_queue_count": 7, "api_calls": 3, "total_tokens": 18420, "estimated_cost_usd": 0.42, "model": "gemini-2.0-flash-exp", "errors": 0}
```

---

## 6. Functional Requirements

### 6.1 Detection and Identification

- Send each full sheet image to the configured cloud vision LLM in a single API call
- Prompt the LLM to: (a) detect and locate all individual charms, (b) identify each charm, (c) return bounding box coordinates, and (d) report confidence per charm
- Parse the structured LLM response into charm objects
- Do not make a second LLM call per charm unless confidence is below threshold and retry-on-low-confidence is enabled (configurable)

### 6.2 Image Cropping (Optional)

- Controlled by config flag: `generate_crops: true/false`
- When enabled, extract each charm's bounding box from the source image with configurable padding (default: 20px)
- Save crops as JPEG at configurable quality (default: 90%)
- Review queue items always get crops generated regardless of global flag
- Crop filenames match charm ID: `CHM-a3f9-001.jpg`

### 6.3 Charm ID Generation

IDs are deterministic and collision-resistant across runs:

```
CHM-{batch_hash}-{sequence}
```

- `batch_hash`: 4-character hash of (run date + input directory path)
- `sequence`: zero-padded 3-digit integer per batch
- Example: `CHM-a3f9-001`

This prevents cross-batch collisions while keeping IDs human-readable.

### 6.4 Category Taxonomy

Standardized categories (configurable/extensible in config file):

- Movies & TV
- Anime & Manga
- Video Games
- Sports & Athletics
- Food & Drink
- Animals & Nature
- Holidays & Seasonal
- Letters & Numbers
- Shapes & Symbols
- Professions & Hobbies
- Other / Unknown

### 6.5 Confidence Tiers and Review Queue

| Tier | Score Range | Behavior |
|---|---|---|
| High | ≥ 0.80 | Added to main output only |
| Medium | 0.60 – 0.79 | Added to main output AND review queue |
| Low | < 0.60 | Added to main output (flagged) AND review queue |

Thresholds are configurable.

### 6.6 Batch Processing and Job Queue

- Accept an input directory containing one or more sheet images
- Process images sequentially (configurable: parallel processing as future enhancement)
- Respect API rate limits with configurable delay between calls (default: 1 second)
- Retry failed API calls up to N times (configurable, default: 3) with exponential backoff
- On unrecoverable failure, log the error, skip the image, and continue processing remaining sheets
- Report total API cost estimate at end of run based on token counts

---

## 7. Configuration

All settings in a single `config.yaml` file. No hardcoded values in source.

```yaml
# Model configuration
llm:
  provider: "google"          # google | openai | anthropic
  model: "gemini-2.0-flash-exp"
  api_key_env: "GOOGLE_API_KEY"  # env var name, never store key in config
  max_tokens: 4096
  temperature: 0.1            # Low temp for consistent structured output

# Processing
processing:
  input_dir: "./input"
  output_dir: "./output"
  rate_limit_delay_seconds: 1.0
  max_retries: 3
  retry_backoff_multiplier: 2.0
  generate_crops: true
  crop_padding_px: 20
  crop_quality: 90

# Confidence thresholds
confidence:
  high_threshold: 0.80
  medium_threshold: 0.60

# Categories (extensible)
categories:
  - "Movies & TV"
  - "Anime & Manga"
  - "Video Games"
  - "Sports & Athletics"
  - "Food & Drink"
  - "Animals & Nature"
  - "Holidays & Seasonal"
  - "Letters & Numbers"
  - "Shapes & Symbols"
  - "Professions & Hobbies"
  - "Other / Unknown"
```

---

## 8. LLM Prompt Design

The system prompt instructs the LLM to return structured JSON only. Key requirements:

- Identify every visible charm, including partially visible ones
- Return bounding box as `{x, y, width, height}` in pixels relative to input image
- Return confidence as float 0.0–1.0
- Map category to the provided taxonomy list
- Generate keywords including: character name, franchise/IP, dominant colors, themes, art style
- Description should be 1–3 sentences suitable for a product listing
- If a charm cannot be identified, use title "Unknown Charm" and confidence 0.0
- Return only valid JSON — no markdown, no preamble

A/B prompt variants should be maintained for experimentation, selectable via config.

---

## 9. Technology Stack

| Component | Choice | Rationale |
|---|---|---|
| Language | Python 3.11+ | Specified requirement |
| LLM integration | Provider SDK or `litellm` | `litellm` enables model-agnostic switching |
| Image processing | Pillow (PIL) | Crop extraction and format handling |
| Configuration | PyYAML | Simple, human-editable |
| CLI | argparse or Click | Run from command line with flags |
| Output | JSON + JSONL | No database dependency |
| Dependency management | pip + requirements.txt | Simple, no over-engineering |

**Recommended LLM:** Google Gemini 2.0 Flash (or latest 2026 equivalent) — best cost/performance ratio for vision tasks at batch scale as of early 2026.

---

## 10. CLI Interface

```bash
# Basic run
python charm_recognizer.py --input ./input/batch_001 --output ./output

# Disable crops for a quick metadata-only run
python charm_recognizer.py --input ./input/batch_001 --no-crops

# Override model without editing config
python charm_recognizer.py --input ./input/batch_001 --model gemini-2.0-pro

# Dry run — validate images and estimate cost without API calls
python charm_recognizer.py --input ./input/batch_001 --dry-run

# Process review queue corrections (future phase)
python charm_recognizer.py --review ./output/review/2025-02-27-a3f9
```

---

## 11. Directory Structure

```
charm-recognizer/
├── charm_recognizer.py       # Main entry point
├── config.yaml               # Configuration
├── requirements.txt
├── README.md
├── src/
│   ├── detector.py           # LLM API calls and response parsing
│   ├── cropper.py            # Image crop extraction
│   ├── id_generator.py       # Deterministic ID generation
│   ├── output_writer.py      # JSON and review queue writing
│   ├── cost_tracker.py       # Token counting and cost estimation
│   ├── logger.py             # Run log management
│   └── prompts/
│       ├── system_prompt_v1.txt
│       └── system_prompt_v2.txt
├── input/                    # Input images (gitignored)
└── output/                   # Generated output (gitignored)
    ├── charms/               # Main JSON output per batch
    ├── crops/                # Individual charm images per batch
    ├── review/               # Review queue JSON and crops per batch
    └── logs/
        └── run_log.jsonl
```

---

## 12. Error Handling

| Error Type | Behavior |
|---|---|
| API rate limit hit | Wait and retry with backoff |
| API call fails after max retries | Log error, skip image, continue batch |
| LLM returns malformed JSON | Retry with simplified prompt; if still fails, skip |
| Image file unreadable | Log and skip immediately |
| No charms detected in image | Log warning, write empty result for that sheet |
| Bounding box outside image bounds | Clamp to image dimensions, log warning |

---

## 13. Known Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| LLM misses overlapping/touching charms | High | Medium | Review queue catches low confidence; consider multi-crop retry strategy in v2 |
| LLM hallucinates bounding boxes | Medium | Medium | Validate box dimensions against image size before cropping |
| API cost overruns on large batches | Medium | Low | Dry-run mode + per-run cost logging; set budget alerts on API account |
| Model deprecated or pricing changes | High (over time) | Low | Model-agnostic config means swap is a one-line change |
| Unofficial/licensed character IP in listings | High | High | Outside scope of this tool; operator responsibility |
| ID collisions across runs | Low (with design) | High | Deterministic batch-scoped IDs prevent this by design |

---

## 14. Out of Scope (Future Phases)

- Web-based review queue UI
- Direct WooCommerce or REST API push
- Parallel multi-threaded image processing
- Custom fine-tuned detection model
- Barcode/SKU scanning integration
- Pricing suggestion based on charm category

---

## 15. Success Criteria

| Metric | Target |
|---|---|
| Charm detection rate | ≥ 85% of visible charms detected per sheet |
| High-confidence identification rate | ≥ 70% of detected charms at ≥ 0.80 confidence |
| Processing time per sheet | < 30 seconds per sheet image |
| Run log accuracy | 100% of runs logged with cost data |
| Zero silent failures | All errors logged; no data lost without record |

---

## 16. Assumptions

- Input images are taken in reasonable lighting with charms fully visible
- The cloud LLM API account is pre-configured with sufficient quota for batch volume
- Operator reviews the review queue before publishing JSON to the web store
- The custom web store front-end is responsible for consuming and validating the JSON schema
- No personally identifiable information is included in any charm metadata
