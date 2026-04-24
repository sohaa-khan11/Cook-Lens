from ultralytics import YOLO
import logging
from typing import List, Dict
import io
from PIL import Image

# Configure minimal, safe logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- PHASE 3: NORMALIZATION CONFIGURATION ---
# White-list of valid culinary ingredients from the COCO dataset
ALLOWED_INGREDIENTS = {
    "apple", "banana", "orange", "broccoli", "carrot", "hot dog", 
    "sandwich", "pizza", "donut", "cake", "tomato", "onion", "potato", "egg"
}

# Mapping common YOLO misidentifications to culinary equivalents
LABEL_MAP = {
    "sports ball": "orange",
    "hot dog": "sausage",
    "sandwich": "bread",
    "pizza": "pizza",
    "donut": "donut",
    "cake": "cake"
}

def normalize_ingredients(raw_labels: List[str]) -> List[str]:
    """
    Refines raw YOLO labels into a clean, culinary-friendly ingredient list.
    """
    cleaned_list = []
    seen = set()

    for label in raw_labels:
        label = label.lower().strip()
        mapped_label = LABEL_MAP.get(label, label)
        
        if mapped_label in ALLOWED_INGREDIENTS or mapped_label in LABEL_MAP.values():
            if mapped_label not in seen:
                cleaned_list.append(mapped_label)
                seen.add(mapped_label)

    return cleaned_list

# --- CORE SERVICE ---
try:
    # Initialize YOLO model globally
    model = YOLO("yolov8n.pt")
except Exception as e:
    logger.error(f"Failed to load YOLO model: {e}")
    model = None

async def detect_ingredients_from_image(image_bytes: bytes, content_type: str = "image/jpeg") -> Dict:
    """
    Identifies food ingredients using local YOLOv8 detection with confidence awareness.
    Returns: {
        "ingredients": List[str],      # High confidence (>= 0.5)
        "low_confidence": List[str],   # Low confidence (0.2 - 0.5)
        "raw_detections": List[str],   # Everything detected before filtering
        "needs_confirmation": bool     # Flag if results are uncertain
    }
    """
    if not image_bytes or model is None:
        return {
            "ingredients": [],
            "low_confidence": [],
            "raw_detections": [],
            "needs_confirmation": False
        }

    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Run inference (Using 0.20 confidence to capture low-conf items)
        results = model.predict(source=image, conf=0.20, save=False)
        
        raw_labels = []
        high_conf_raw = []
        low_conf_raw = []

        for r in results:
            for box in r.boxes:
                class_id = int(box.cls[0])
                label = model.names[class_id]
                conf = float(box.conf[0])
                
                raw_labels.append(label)
                
                if conf >= 0.5:
                    high_conf_raw.append(label)
                elif conf >= 0.2:
                    low_conf_raw.append(label)

        # Apply Normalization to separate lists
        ingredients = normalize_ingredients(high_conf_raw)
        low_confidence = normalize_ingredients(low_conf_raw)
        
        # Determine if confirmation is needed
        needs_confirmation = len(ingredients) == 0 or len(low_confidence) > 0
        
        logger.info(f"Detection Complete: {len(ingredients)} high-conf, {len(low_confidence)} low-conf identified.")

        return {
            "ingredients": ingredients,
            "low_confidence": low_confidence,
            "raw_detections": raw_labels,
            "needs_confirmation": needs_confirmation
        }

    except Exception as e:
        logger.error(f"Local YOLO Detection Failure: {e}")
        return {
            "ingredients": [],
            "low_confidence": [],
            "raw_detections": [],
            "needs_confirmation": False
        }
