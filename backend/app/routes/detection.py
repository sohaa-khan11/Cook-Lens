from fastapi import APIRouter, File, UploadFile
from app.models.schemas import DetectionResponse
from app.services.vision_service import detect_ingredients_from_image

router = APIRouter()

@router.post("/detect")
async def detect_ingredients(image: UploadFile = File(...)):
    """
    POST /detect
    Input: image (multipart/form-data)
    """
    if not image:
        return {"ingredients": []}

    try:
        # Read image bytes
        filename = image.filename
        content_type = image.content_type
        image_bytes = await image.read()
        
        if len(image_bytes) == 0:
            return {"ingredients": []}
            
        # Call local vision intelligence service
        detection_result = await detect_ingredients_from_image(image_bytes, content_type)
        
        return detection_result
    except Exception as e:
        # Silent failure for UX, but log could be added here
        return {
            "ingredients": [],
            "low_confidence": [],
            "raw_detections": [],
            "needs_confirmation": False
        }
