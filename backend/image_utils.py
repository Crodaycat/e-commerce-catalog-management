from typing import Optional
import base64
from io import BytesIO
from PIL import Image, UnidentifiedImageError
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)


def process_image_bytes(content: bytes, content_type: Optional[str] = None, max_bytes: int = 5 * 1024 * 1024) -> str:
    """Process image bytes and return a data URI string.

    - Validates max size (raises HTTPException 400 if too large).
    - Tries to determine MIME type from `content_type`; if missing, uses Pillow to detect format.
    - Returns a Data URI `data:<mime>;base64,<b64>`.

    This function is reusable for images coming from UploadFile or from image-generation APIs
    that return raw bytes.
    """
    if content is None:
        raise HTTPException(status_code=400, detail="No se recibieron datos de imagen")

    if len(content) > max_bytes:
        raise HTTPException(status_code=400, detail=f"Imagen demasiado grande (máx. {max_bytes // (1024*1024)}MB)")

    b64 = base64.b64encode(content).decode("utf-8")

    mime = content_type
    if not mime:
        try:
            img = Image.open(BytesIO(content))
            fmt = (img.format or "").lower()
            mime_map = {
                "jpeg": "image/jpeg",
                "jpg": "image/jpeg",
                "png": "image/png",
                "gif": "image/gif",
                "webp": "image/webp",
                "bmp": "image/bmp",
                "tiff": "image/tiff",
            }
            mime = mime_map.get(fmt, "application/octet-stream")
        except UnidentifiedImageError:
            raise HTTPException(status_code=400, detail="El archivo no es una imagen válida")
        except Exception:
            logger.exception("Error detectando formato de imagen")
            mime = "application/octet-stream"

    return f"data:{mime};base64,{b64}"
