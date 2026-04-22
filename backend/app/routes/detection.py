from app.services.vision_service import detect_ingredients_from_image

router = APIRouter()

@router.post("/detect", response_model=DetectionResponse)
async def detect_ingredients(image: UploadFile = File(None)):
    """
    POST /detect
    Input: image (multipart/form-data)
    Output: List of string ingredients (AI-detected via Gemini Vision)
    """
    if not image:
        return {"ingredients": []}

    try:
        # Read image bytes
        image_bytes = await image.read()
        
        # Call vision intelligence service
        detected = await detect_ingredients_from_image(image_bytes)
        
        return {"ingredients": detected}
    except Exception:
        # Internal guard to ensure API consistency
        return {"ingredients": []}
