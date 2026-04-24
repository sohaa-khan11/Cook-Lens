# CookLens Backend

AI-powered ingredient detection and recipe retrieval system.

## Project Structure
- `app/routes/`: API endpoints for detection and recipes.
- `app/services/`: Core logic (YOLO vision, recipe retrieval).
- `app/models/`: Pydantic schemas.
- `app/data/processed/`: Contains the cleaned recipe dataset.

## Setup Instructions

### 1. Dataset Preparation
The system uses a subset of the Food.com recipes dataset. 
- The full dataset should be downloaded manually if you wish to regenerate the cleaned data.
- Place the `RAW_recipes.csv` in `app/data/raw/`.
- Use the processing script (available in version history or provided upon request) to generate `app/data/processed/recipes_clean.json`.
- **Note**: `recipes_clean.json` is already included in the repository for immediate use.

### 2. Installation
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Running Locally
```bash
uvicorn app.main:app --reload
```

## API Endpoints
- `POST /detect`: Upload an image to detect ingredients.
- `POST /recipes/search`: Search for recipes based on a list of confirmed ingredients.

## Deployment Notes
- Large raw dataset files are excluded via `.gitignore`.
- The `recipes_clean.json` is small enough to be tracked and deployed.
- YOLO model (`yolov8n.pt`) will be downloaded automatically on first run.
