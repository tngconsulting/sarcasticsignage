# Technical Specification
## Croc Charm Image Recognition Pipeline
**Version:** 1.0  
**Date:** 2025-02-27  
**Companion Document:** Croc Charm Recognizer PRD v1.0  
**Status:** Draft

---

## 1. System Architecture

### 1.1 High-Level Data Flow

```
Input Image(s)
      │
      ▼
┌─────────────────┐
│   CLI Entry     │  charm_recognizer.py
│   Point         │  - Parse args
│                 │  - Load config
│                 │  - Init BatchJob
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ImageScanner   │  src/scanner.py
│                 │  - Validate image files
│                 │  - Resize if needed
│                 │  - Build prompt payload
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   LLMClient     │  src/llm_client.py
│                 │  - Send full-sheet image
│                 │  - Receive charm array + bounding boxes
│                 │  - Retry/backoff logic
│                 │  - Token counting
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ResponseParser  │  src/parser.py
│                 │  - Validate LLM JSON
│                 │  - Assign confidence tiers
│                 │  - Generate charm IDs
│                 │  - Split high/review queues
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────────┐
│Cropper │ │ OutputWriter │  src/cropper.py
│        │ │              │  src/output_writer.py
│- Crop  │ │- Write main  │
│  images│ │  JSON        │
│- Save  │ │- Write review│
│  crops │ │  queue JSON  │
└────────┘ │- Append run  │
           │  log JSONL   │
           └──────────────┘
```

### 1.2 Module Responsibilities

| Module | File | Responsibility |
|---|---|---|
| Entry point | `charm_recognizer.py` | CLI, config loading, orchestration |
| Config | `src/config.py` | Load, validate, and expose config.yaml |
| Image scanner | `src/scanner.py` | Image validation, resizing, prompt payload builder |
| LLM client | `src/llm_client.py` | API calls, retry logic, token tracking |
| Response parser | `src/parser.py` | Parse/validate LLM JSON, assign IDs and tiers |
| Cropper | `src/cropper.py` | Extract bounding box crops from source images |
| Output writer | `src/output_writer.py` | Write main JSON, review queue, run log |
| ID generator | `src/id_generator.py` | Deterministic ID generation |
| Cost tracker | `src/cost_tracker.py` | Token counting, cost estimation per model |
| Logger | `src/logger.py` | Structured run logging |
| Prompts | `src/prompts/` | Versioned prompt text files |

---

## 2. Environment and Dependencies

### 2.1 Runtime Requirements

```
Python >= 3.11
```

### 2.2 requirements.txt

```
# LLM abstraction
litellm>=1.40.0

# Image processing
Pillow>=10.3.0

# Configuration
PyYAML>=6.0.1

# CLI
click>=8.1.7

# Type safety / validation
pydantic>=2.7.0

# Utilities
python-dotenv>=1.0.1
tenacity>=8.3.0        # Retry logic
rich>=13.7.0           # Console output / progress bars
```

### 2.3 Installation

```bash
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # Add API keys here
```

### 2.4 .env.example

```
GOOGLE_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

---

## 3. Configuration Specification

### 3.1 config.yaml — Full Schema with Defaults

```yaml
llm:
  provider: "google"                    # google | openai | anthropic
  model: "gemini/gemini-2.0-flash-exp" # litellm model string format
  api_key_env: "GOOGLE_API_KEY"         # env var containing API key
  max_tokens: 4096
  temperature: 0.1
  prompt_version: "v1"                  # matches filename in src/prompts/

processing:
  input_dir: "./input"
  output_dir: "./output"
  supported_extensions: [".jpg", ".jpeg", ".png"]
  max_image_dimension_px: 4096          # Resize larger images before sending
  rate_limit_delay_seconds: 1.0
  max_retries: 3
  retry_backoff_multiplier: 2.0
  generate_crops: true
  crop_padding_px: 20
  crop_quality: 90                      # JPEG quality for saved crops

confidence:
  high_threshold: 0.80
  medium_threshold: 0.60               # Below this → low tier

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

cost_per_million_tokens:               # Update as pricing changes
  "gemini/gemini-2.0-flash-exp":
    input: 0.075
    output: 0.30
  "gpt-4o":
    input: 2.50
    output: 10.00
  "claude-opus-4-6":
    input: 15.00
    output: 75.00
```

### 3.2 Config Loading (src/config.py)

```python
from pydantic import BaseModel, Field
from typing import Optional
import yaml, os

class LLMConfig(BaseModel):
    provider: str
    model: str
    api_key_env: str
    max_tokens: int = 4096
    temperature: float = 0.1
    prompt_version: str = "v1"

class ProcessingConfig(BaseModel):
    input_dir: str
    output_dir: str
    supported_extensions: list[str] = [".jpg", ".jpeg", ".png"]
    max_image_dimension_px: int = 4096
    rate_limit_delay_seconds: float = 1.0
    max_retries: int = 3
    retry_backoff_multiplier: float = 2.0
    generate_crops: bool = True
    crop_padding_px: int = 20
    crop_quality: int = 90

class ConfidenceConfig(BaseModel):
    high_threshold: float = 0.80
    medium_threshold: float = 0.60

class AppConfig(BaseModel):
    llm: LLMConfig
    processing: ProcessingConfig
    confidence: ConfidenceConfig
    categories: list[str]
    cost_per_million_tokens: dict[str, dict[str, float]] = {}

def load_config(path: str = "config.yaml") -> AppConfig:
    with open(path) as f:
        raw = yaml.safe_load(f)
    return AppConfig(**raw)
```

---

## 4. Data Models

All data models use Pydantic v2 for validation and serialization.

### 4.1 Core Models (src/models.py)

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class ConfidenceTier(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class BoundingBox(BaseModel):
    x: int = Field(ge=0)
    y: int = Field(ge=0)
    width: int = Field(gt=0)
    height: int = Field(gt=0)

class Charm(BaseModel):
    id: str
    batch_id: str
    source_image: str
    title: str
    description: str
    keywords: list[str]
    category: str
    confidence: float = Field(ge=0.0, le=1.0)
    confidence_tier: ConfidenceTier
    crop_path: Optional[str] = None
    bounding_box: Optional[BoundingBox] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReviewItem(BaseModel):
    id: str
    confidence: float
    confidence_tier: ConfidenceTier
    llm_raw_response: str
    crop_path: Optional[str] = None
    suggested_title: str
    reviewer_notes: Optional[str] = None
    reviewed: bool = False
    approved: Optional[bool] = None

class BatchResult(BaseModel):
    batch_id: str
    processed_at: datetime = Field(default_factory=datetime.utcnow)
    total_charms: int
    total_cost_usd: float
    charms: list[Charm]

class ReviewQueue(BaseModel):
    batch_id: str
    review_count: int
    items: list[ReviewItem]

class RunLogEntry(BaseModel):
    run_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    sheets_processed: int = 0
    charms_detected: int = 0
    review_queue_count: int = 0
    api_calls: int = 0
    total_input_tokens: int = 0
    total_output_tokens: int = 0
    estimated_cost_usd: float = 0.0
    model: str
    errors: int = 0
    error_messages: list[str] = []

# LLM response shape (what we expect back from the LLM)
class LLMCharmRaw(BaseModel):
    title: str
    description: str
    keywords: list[str]
    category: str
    confidence: float
    bounding_box: Optional[BoundingBox] = None

class LLMResponse(BaseModel):
    charms: list[LLMCharmRaw]
```

---

## 5. LLM Integration

### 5.1 LLMClient (src/llm_client.py)

Uses `litellm` for provider abstraction. Key design:
- Single method: `identify_charms(image_path, config) -> LLMResponse`
- Retry handled by `tenacity`
- Token counts extracted from response metadata
- Image encoded as base64 inline (no URLs)

```python
import litellm
import base64
from pathlib import Path
from tenacity import retry, stop_after_attempt, wait_exponential
from src.models import LLMResponse, LLMCharmRaw
from src.cost_tracker import CostTracker

class LLMClient:
    def __init__(self, config, cost_tracker: CostTracker):
        self.config = config
        self.cost_tracker = cost_tracker
        import os
        os.environ[config.llm.api_key_env] = os.getenv(config.llm.api_key_env, "")

    def _encode_image(self, image_path: str) -> str:
        with open(image_path, "rb") as f:
            return base64.standard_b64encode(f.read()).decode("utf-8")

    def _load_prompt(self, version: str, categories: list[str]) -> str:
        prompt_path = Path(f"src/prompts/system_prompt_{version}.txt")
        template = prompt_path.read_text()
        return template.replace("{{CATEGORIES}}", "\n".join(f"- {c}" for c in categories))

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=2, min=2, max=30),
        reraise=True
    )
    def identify_charms(self, image_path: str) -> tuple[LLMResponse, dict]:
        encoded = self._encode_image(image_path)
        ext = Path(image_path).suffix.lower().lstrip(".")
        media_type = "image/jpeg" if ext in ("jpg", "jpeg") else "image/png"
        
        system_prompt = self._load_prompt(
            self.config.llm.prompt_version,
            self.config.categories
        )

        response = litellm.completion(
            model=self.config.llm.model,
            max_tokens=self.config.llm.max_tokens,
            temperature=self.config.llm.temperature,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{media_type};base64,{encoded}"
                            }
                        },
                        {
                            "type": "text",
                            "text": system_prompt
                        }
                    ]
                }
            ]
        )

        usage = {
            "input_tokens": response.usage.prompt_tokens,
            "output_tokens": response.usage.completion_tokens,
        }
        self.cost_tracker.record(self.config.llm.model, usage)

        raw_text = response.choices[0].message.content
        return self._parse_response(raw_text), usage

    def _parse_response(self, raw_text: str) -> LLMResponse:
        import json, re
        # Strip markdown code fences if present
        cleaned = re.sub(r"^```(?:json)?\n?|```$", "", raw_text.strip(), flags=re.MULTILINE)
        data = json.loads(cleaned)
        return LLMResponse(**data)
```

### 5.2 Prompt Design (src/prompts/system_prompt_v1.txt)

```
You are a product cataloging assistant specializing in Croc shoe charms (Jibbitz-style).

Analyze the provided image and identify every individual charm visible, including partially visible ones.

For each charm, return the following data. Use the category list provided — do not invent new categories.

Categories:
{{CATEGORIES}}

Return ONLY a valid JSON object in this exact structure. No markdown. No explanation. No preamble.

{
  "charms": [
    {
      "title": "Short descriptive product title (5-10 words)",
      "description": "1 to 3 sentences suitable for a product listing page",
      "keywords": ["keyword1", "keyword2"],
      "category": "Exact category from the list above",
      "confidence": 0.95,
      "bounding_box": {
        "x": 142,
        "y": 88,
        "width": 210,
        "height": 195
      }
    }
  ]
}

Rules:
- confidence is a float from 0.0 to 1.0 reflecting how certain you are of the identification
- bounding_box coordinates are in pixels relative to the top-left of the input image
- If a charm cannot be identified, use title "Unknown Charm", confidence 0.0, and category "Other / Unknown"
- keywords must include: character or subject name, franchise or IP (if known), dominant colors, themes
- Do not merge multiple charms into one entry
- Do not skip charms that overlap or touch other charms
- Every charm visible in the image must have an entry
```

---

## 6. Image Processing

### 6.1 Pre-processing (src/scanner.py)

Before sending to the LLM, images are validated and optionally resized:

```python
from PIL import Image
from pathlib import Path

class ImageScanner:
    def __init__(self, config):
        self.config = config
        self.max_dim = config.processing.max_image_dimension_px

    def validate(self, image_path: str) -> bool:
        try:
            with Image.open(image_path) as img:
                img.verify()
            return True
        except Exception:
            return False

    def prepare(self, image_path: str) -> str:
        """
        Resize image if it exceeds max_image_dimension_px.
        Returns path to prepared image (may be a temp file).
        Preserves aspect ratio.
        """
        with Image.open(image_path) as img:
            w, h = img.size
            if max(w, h) <= self.max_dim:
                return image_path  # No resize needed

            ratio = self.max_dim / max(w, h)
            new_size = (int(w * ratio), int(h * ratio))
            resized = img.resize(new_size, Image.LANCZOS)
            
            tmp_path = Path(image_path).with_suffix(".tmp.jpg")
            resized.save(tmp_path, "JPEG", quality=95)
            return str(tmp_path)
```

### 6.2 Cropper (src/cropper.py)

```python
from PIL import Image
from pathlib import Path
from src.models import BoundingBox

class Cropper:
    def __init__(self, config):
        self.padding = config.processing.crop_padding_px
        self.quality = config.processing.crop_quality

    def crop(self, source_image_path: str, bbox: BoundingBox, output_path: str) -> str:
        with Image.open(source_image_path) as img:
            w, h = img.size
            # Apply padding, clamped to image bounds
            x1 = max(0, bbox.x - self.padding)
            y1 = max(0, bbox.y - self.padding)
            x2 = min(w, bbox.x + bbox.width + self.padding)
            y2 = min(h, bbox.y + bbox.height + self.padding)

            cropped = img.crop((x1, y1, x2, y2))
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            cropped.save(output_path, "JPEG", quality=self.quality)
            return output_path
```

---

## 7. ID Generation

### 7.1 Algorithm (src/id_generator.py)

```python
import hashlib
from datetime import datetime

class IDGenerator:
    def __init__(self, input_dir: str, run_date: str):
        # Hash is deterministic per (date + input_dir)
        raw = f"{run_date}:{input_dir}"
        self.batch_hash = hashlib.sha256(raw.encode()).hexdigest()[:4]
        self.batch_id = f"{run_date}-{self.batch_hash}"
        self._counter = 0

    def next_charm_id(self) -> str:
        self._counter += 1
        return f"CHM-{self.batch_hash}-{self._counter:03d}"

    def get_batch_id(self) -> str:
        return self.batch_id
```

**Example output:** Given input_dir `./input/batch_001` on `2025-02-27`:
- `batch_id`: `2025-02-27-a3f9`
- Charm IDs: `CHM-a3f9-001`, `CHM-a3f9-002`, ...

---

## 8. Cost Tracking

### 8.1 CostTracker (src/cost_tracker.py)

```python
class CostTracker:
    def __init__(self, cost_table: dict):
        self.cost_table = cost_table  # from config
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.total_cost_usd = 0.0
        self.api_calls = 0

    def record(self, model: str, usage: dict):
        self.api_calls += 1
        input_t = usage.get("input_tokens", 0)
        output_t = usage.get("output_tokens", 0)
        self.total_input_tokens += input_t
        self.total_output_tokens += output_t

        rates = self.cost_table.get(model, {})
        input_cost = (input_t / 1_000_000) * rates.get("input", 0)
        output_cost = (output_t / 1_000_000) * rates.get("output", 0)
        self.total_cost_usd += input_cost + output_cost

    def summary(self) -> dict:
        return {
            "api_calls": self.api_calls,
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "estimated_cost_usd": round(self.total_cost_usd, 4)
        }
```

---

## 9. Output Writing

### 9.1 OutputWriter (src/output_writer.py)

```python
import json
from pathlib import Path
from datetime import datetime
from src.models import BatchResult, ReviewQueue, RunLogEntry

class OutputWriter:
    def __init__(self, output_dir: str, batch_id: str):
        self.base = Path(output_dir)
        self.batch_id = batch_id
        self.charms_dir = self.base / "charms"
        self.crops_dir = self.base / "crops" / batch_id
        self.review_dir = self.base / "review" / batch_id
        self.log_path = self.base / "logs" / "run_log.jsonl"
        for d in [self.charms_dir, self.crops_dir, self.review_dir, self.base / "logs"]:
            d.mkdir(parents=True, exist_ok=True)

    def write_batch(self, result: BatchResult):
        path = self.charms_dir / f"{self.batch_id}.json"
        path.write_text(result.model_dump_json(indent=2))

    def write_review_queue(self, queue: ReviewQueue):
        path = self.review_dir / f"{self.batch_id}_review.json"
        path.write_text(queue.model_dump_json(indent=2))

    def append_run_log(self, entry: RunLogEntry):
        with open(self.log_path, "a") as f:
            f.write(entry.model_dump_json() + "\n")

    def crop_path_for(self, charm_id: str) -> str:
        return str(self.crops_dir / f"{charm_id}.jpg")

    def review_crop_path_for(self, charm_id: str) -> str:
        return str(self.review_dir / f"{charm_id}.jpg")
```

---

## 10. CLI Entry Point

### 10.1 charm_recognizer.py

```python
import click
import time
from datetime import datetime
from pathlib import Path
from rich.console import Console
from rich.progress import track

from src.config import load_config
from src.scanner import ImageScanner
from src.llm_client import LLMClient
from src.parser import ResponseParser
from src.cropper import Cropper
from src.output_writer import OutputWriter
from src.id_generator import IDGenerator
from src.cost_tracker import CostTracker
from src.models import BatchResult, ReviewQueue, RunLogEntry

console = Console()

@click.command()
@click.option("--input", "input_dir", required=True, help="Directory containing sheet images")
@click.option("--output", "output_dir", default=None, help="Override output directory from config")
@click.option("--config", "config_path", default="config.yaml", help="Path to config.yaml")
@click.option("--model", default=None, help="Override model (litellm format)")
@click.option("--no-crops", is_flag=True, default=False, help="Disable image crop generation")
@click.option("--dry-run", is_flag=True, default=False, help="Validate inputs without API calls")
def main(input_dir, output_dir, config_path, model, no_crops, dry_run):
    config = load_config(config_path)
    
    if output_dir:
        config.processing.output_dir = output_dir
    if model:
        config.llm.model = model
    if no_crops:
        config.processing.generate_crops = False

    run_date = datetime.utcnow().strftime("%Y-%m-%d")
    id_gen = IDGenerator(input_dir, run_date)
    batch_id = id_gen.get_batch_id()
    cost_tracker = CostTracker(config.cost_per_million_tokens)
    scanner = ImageScanner(config)
    cropper = Cropper(config)
    writer = OutputWriter(config.processing.output_dir, batch_id)
    llm = LLMClient(config, cost_tracker)
    parser = ResponseParser(config, id_gen)

    run_log = RunLogEntry(
        run_id=batch_id,
        started_at=datetime.utcnow(),
        model=config.llm.model
    )

    # Collect valid images
    input_path = Path(input_dir)
    images = [
        f for f in input_path.iterdir()
        if f.suffix.lower() in config.processing.supported_extensions
    ]

    if not images:
        console.print(f"[red]No images found in {input_dir}[/red]")
        return

    console.print(f"[green]Batch:[/green] {batch_id}")
    console.print(f"[green]Images found:[/green] {len(images)}")
    console.print(f"[green]Model:[/green] {config.llm.model}")

    if dry_run:
        console.print("[yellow]DRY RUN — no API calls will be made[/yellow]")
        for img in images:
            valid = scanner.validate(str(img))
            status = "✓" if valid else "✗"
            console.print(f"  {status} {img.name}")
        return

    all_charms = []
    review_items = []

    for img in track(images, description="Processing sheets..."):
        try:
            prepared_path = scanner.prepare(str(img))
            llm_response, _ = llm.identify_charms(prepared_path)
            charms, reviews = parser.process(llm_response, img.name, writer, cropper, prepared_path)
            all_charms.extend(charms)
            review_items.extend(reviews)
            run_log.sheets_processed += 1
            time.sleep(config.processing.rate_limit_delay_seconds)
        except Exception as e:
            run_log.errors += 1
            run_log.error_messages.append(f"{img.name}: {str(e)}")
            console.print(f"[red]Error processing {img.name}: {e}[/red]")

    cost_summary = cost_tracker.summary()
    run_log.charms_detected = len(all_charms)
    run_log.review_queue_count = len(review_items)
    run_log.api_calls = cost_summary["api_calls"]
    run_log.total_input_tokens = cost_summary["total_input_tokens"]
    run_log.total_output_tokens = cost_summary["total_output_tokens"]
    run_log.estimated_cost_usd = cost_summary["estimated_cost_usd"]
    run_log.completed_at = datetime.utcnow()

    batch_result = BatchResult(
        batch_id=batch_id,
        total_charms=len(all_charms),
        total_cost_usd=cost_summary["estimated_cost_usd"],
        charms=all_charms
    )

    review_queue = ReviewQueue(
        batch_id=batch_id,
        review_count=len(review_items),
        items=review_items
    )

    writer.write_batch(batch_result)
    writer.write_review_queue(review_queue)
    writer.append_run_log(run_log)

    console.print(f"\n[bold green]Complete![/bold green]")
    console.print(f"  Charms detected: {len(all_charms)}")
    console.print(f"  Review queue:    {len(review_items)}")
    console.print(f"  API cost:        ${cost_summary['estimated_cost_usd']:.4f}")
    console.print(f"  Output:          {config.processing.output_dir}/{batch_id}.json")

if __name__ == "__main__":
    main()
```

---

## 11. Response Parser

### 11.1 src/parser.py

```python
from datetime import datetime
from src.models import (
    Charm, ReviewItem, ConfidenceTier, LLMResponse, BoundingBox
)
from src.id_generator import IDGenerator
from src.cropper import Cropper
from src.output_writer import OutputWriter

class ResponseParser:
    def __init__(self, config, id_gen: IDGenerator):
        self.config = config
        self.id_gen = id_gen
        self.high_t = config.confidence.high_threshold
        self.med_t = config.confidence.medium_threshold

    def _tier(self, confidence: float) -> ConfidenceTier:
        if confidence >= self.high_t:
            return ConfidenceTier.HIGH
        elif confidence >= self.med_t:
            return ConfidenceTier.MEDIUM
        return ConfidenceTier.LOW

    def _validate_bbox(self, bbox: BoundingBox | None, img_w: int, img_h: int) -> BoundingBox | None:
        if bbox is None:
            return None
        return BoundingBox(
            x=max(0, min(bbox.x, img_w - 1)),
            y=max(0, min(bbox.y, img_h - 1)),
            width=max(1, min(bbox.width, img_w - bbox.x)),
            height=max(1, min(bbox.height, img_h - bbox.y))
        )

    def process(
        self,
        llm_response: LLMResponse,
        source_image: str,
        writer: OutputWriter,
        cropper: Cropper,
        image_path: str
    ) -> tuple[list[Charm], list[ReviewItem]]:
        from PIL import Image
        with Image.open(image_path) as img:
            img_w, img_h = img.size

        charms = []
        reviews = []

        for raw in llm_response.charms:
            charm_id = self.id_gen.next_charm_id()
            tier = self._tier(raw.confidence)
            bbox = self._validate_bbox(raw.bounding_box, img_w, img_h)

            # Determine crop generation
            needs_review = tier in (ConfidenceTier.MEDIUM, ConfidenceTier.LOW)
            crop_path = None

            if bbox:
                if self.config.processing.generate_crops:
                    crop_path = writer.crop_path_for(charm_id)
                    cropper.crop(image_path, bbox, crop_path)
                elif needs_review:
                    # Always crop for review items
                    crop_path = writer.review_crop_path_for(charm_id)
                    cropper.crop(image_path, bbox, crop_path)

            charm = Charm(
                id=charm_id,
                batch_id=self.id_gen.get_batch_id(),
                source_image=source_image,
                title=raw.title,
                description=raw.description,
                keywords=raw.keywords,
                category=raw.category,
                confidence=raw.confidence,
                confidence_tier=tier,
                crop_path=crop_path,
                bounding_box=bbox,
                created_at=datetime.utcnow()
            )
            charms.append(charm)

            if needs_review:
                review_crop = crop_path or writer.review_crop_path_for(charm_id)
                if bbox and not crop_path:
                    cropper.crop(image_path, bbox, review_crop)
                reviews.append(ReviewItem(
                    id=charm_id,
                    confidence=raw.confidence,
                    confidence_tier=tier,
                    llm_raw_response=raw.model_dump_json(),
                    crop_path=review_crop,
                    suggested_title=raw.title
                ))

        return charms, reviews
```

---

## 12. Output File Examples

### 12.1 Main Batch JSON

```
output/charms/2025-02-27-a3f9.json
```

### 12.2 Review Queue JSON

```
output/review/2025-02-27-a3f9/2025-02-27-a3f9_review.json
```

### 12.3 Crop Files

```
output/crops/2025-02-27-a3f9/CHM-a3f9-001.jpg
output/crops/2025-02-27-a3f9/CHM-a3f9-002.jpg
...
```

### 12.4 Run Log

```
output/logs/run_log.jsonl
```
One JSON object per line, appended on each run.

---

## 13. Error Handling Matrix

| Error Condition | Location | Handling |
|---|---|---|
| Image file not found | scanner.py | Raise, caught in main, logged, skip |
| Image corrupt/unreadable | scanner.py | Raise, caught in main, logged, skip |
| API rate limit (429) | llm_client.py | tenacity retry with exponential backoff |
| API auth error (401/403) | llm_client.py | Raise immediately, halt run |
| LLM returns malformed JSON | llm_client.py | Retry up to max_retries, then skip image |
| LLM returns empty charm list | parser.py | Log warning, write empty result |
| Bounding box out of bounds | parser.py | Clamp to image dimensions, log warning |
| Crop write fails (disk full) | cropper.py | Log error, continue without crop |
| Config file missing | config.py | Raise immediately with clear message |
| API key env var not set | llm_client.py | Raise immediately with clear message |

---

## 14. Testing Plan

### 14.1 Unit Tests

| Test | Target |
|---|---|
| ID collision prevention across two runs same date/dir | id_generator.py |
| ID uniqueness within a batch | id_generator.py |
| Confidence tier assignment at boundary values | parser.py |
| Bounding box clamping at image edges | parser.py |
| Cost calculation accuracy vs manual calculation | cost_tracker.py |
| Config validation rejects missing required fields | config.py |
| JSON strip of markdown fences from LLM response | llm_client.py |
| Crop padding clamping at image boundary | cropper.py |

### 14.2 Integration Tests

| Test | Description |
|---|---|
| Single sheet end-to-end | Process one test image, assert JSON structure |
| Review queue generation | Inject mock low-confidence response, assert review file |
| No-crops flag | Assert no files written to crops dir |
| Dry-run flag | Assert no API calls made |
| Multi-sheet batch | Assert batch_id consistent across all charms |
| Run log append | Run twice, assert two lines in JSONL |

### 14.3 Test Fixtures

- `tests/fixtures/sheet_sample.jpg` — anonymized test image
- `tests/fixtures/mock_llm_response.json` — mock LLM response for unit tests
- `tests/fixtures/config_test.yaml` — test config pointing to fixtures

---

## 15. Future Phase Notes

These are explicitly out of scope for v1 but should not be painted over architecturally:

- **Parallel processing:** The per-sheet loop in main is intentionally sequential. Replace with `concurrent.futures.ThreadPoolExecutor` and a semaphore for rate limiting when volume demands it.
- **Review queue UI:** The review queue JSON schema includes `reviewed`, `approved`, and `reviewer_notes` fields. A future web UI can patch these fields and re-export corrected charms.
- **Reference database matching:** The title and keywords fields are designed to support fuzzy matching against a future charm reference database without schema changes.
- **REST API push:** OutputWriter is isolated — add an `APIWriter` class implementing the same interface to push to a REST endpoint without touching the pipeline.
- **Custom detection model:** If LLM accuracy on overlapping charms proves insufficient, the ImageScanner can be swapped for a YOLO-based segmentation step that feeds pre-cropped images to the LLM for identification only.
