from openai import OpenAI
import json
import logging
import os
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    logger.error("Variable de entorno OPENAI_API_KEY no encontrada")
    raise RuntimeError("La variable de entorno OPENAI_API_KEY no está configurada")

client = OpenAI(api_key=api_key)


def extract_json_from_text(text: str) -> Optional[Dict[str, Any]]:
    """Try to extract a JSON object or array from a free-form text.

    Strategies:
    - Remove common Markdown code fences (```json ... ``` or ``` ... ```)
    - Try full-string json.loads
    - Search for the first balanced JSON object `{...}` or array `[...]` and try to parse that
    - Return the parsed dict/list on success, otherwise None
    """
    if not text:
        return None

    s = text.strip()

    # Remove markdown code fences if present
    if s.startswith("```") and s.endswith("```"):
        # strip the opening fence and any language identifier
        try:
            first_newline = s.find('\n')
            if first_newline != -1:
                s = s[first_newline+1:-3].strip()
            else:
                s = s[3:-3].strip()
        except Exception:
            s = s.strip('`')

    # Try direct json
    try:
        return json.loads(s)
    except Exception:
        pass

    # Helper to find a balanced block starting at the first occurrence of open_char
    def find_balanced(text: str, open_char: str, close_char: str) -> Optional[str]:
        start = text.find(open_char)
        if start == -1:
            return None
        depth = 0
        for i in range(start, len(text)):
            if text[i] == open_char:
                depth += 1
            elif text[i] == close_char:
                depth -= 1
                if depth == 0:
                    return text[start:i+1]
        return None

    # Try object {}
    obj_snip = find_balanced(s, '{', '}')
    if obj_snip:
        try:
            return json.loads(obj_snip)
        except Exception:
            pass

    # Try array []
    arr_snip = find_balanced(s, '[', ']')
    if arr_snip:
        try:
            return json.loads(arr_snip)
        except Exception:
            pass

    return None

def analyze_product_image(data_uri: str) -> Dict[str, str]:

    user_message = {
        "role": "user",
        "content": [
            {"type": "text", "text": (
                "Recibirás una imagen. Identifica el producto que aparece en la imagen "
                "y devuelve un objeto JSON con exactamente dos claves: \"productName\" "
                "(un título comercial breve, máximo ~6 palabras) y \"productDescription\" "
                "(una descripción útil y concisa del producto, 1-2 frases). "
                "Devuelve SOLO el objeto JSON y nada más."
            )},
            {"type": "image_url", "image_url": { "url": data_uri } }
        ]
    }

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[user_message],
            temperature=0.2,
            max_tokens=500,
        )
    except Exception as e:
        logger.exception("Error al llamar a OpenAI (chat completions)")
        raise

    # Response parsing: try to extract JSON from the model output
    try:
        # The SDK may return Choice objects or dicts; normalize to a text string
        choice = response.choices[0]

        # extract a 'message' object from choice (works for dicts and objects)
        if isinstance(choice, dict):
            message = choice.get("message") or choice.get("delta") or {}
        else:
            message = getattr(choice, "message", None) or getattr(choice, "delta", None) or {}

        # extract content from message (handles both dict and object shapes)
        content = None
        if isinstance(message, dict):
            # message might contain a 'content' key or nested list
            content = message.get("content")
        else:
            content = getattr(message, "content", None)

        # fallback: sometimes the choice has .text or .message is a simple string
        if content is None:
            content = getattr(choice, "text", None) or getattr(choice, "message", None)

        # normalize content to a text string for JSON extraction
        if isinstance(content, str):
            text = content
        else:
            try:
                text = json.dumps(content)
            except Exception:
                text = str(content)

        parsed = extract_json_from_text(text)
        if parsed is None:
            # last resort: if response has 'text' or direct string
            alt = getattr(choice, 'text', None)
            if isinstance(alt, str):
                parsed = extract_json_from_text(alt)

        if not parsed:
            raise ValueError("No se encontró JSON en la respuesta del modelo")

        # Ensure required keys exist
        name = parsed.get("productName") or parsed.get("title") or parsed.get("name")
        desc = parsed.get("productDescription") or parsed.get("description")
        if not name or not desc:
            raise ValueError("El JSON devuelto por el modelo no contiene las claves requeridas 'productName' y 'productDescription'")

        return name, desc

    except Exception as e:
        logger.exception("No se pudo parsear la respuesta de OpenAI")
        raise


def generate_product_image(productName: str, productDescription) -> str:

    """Genera una imagen a partir del `productName` y `productDescription`.

    Devuelve los bytes de la imagen generada (decodificados desde base64).
    Llama a la API de imágenes del cliente OpenAI. Si la respuesta proporciona
    base64 en `data[0]['b64_json']`, la decodifica y devuelve los bytes.
    """
    prompt = (
        f"Foto de producto de {productName}. {productDescription}. "
        "Fotografía de producto de alta calidad, iluminación de estudio, fondo blanco, aspecto realista"
    )

    try:
        # Intentar usar la API de imágenes. El nombre del método y la forma de la respuesta
        # puede variar según la versión del SDK; manejamos las formas más comunes.
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=prompt,
            tools=[{"type": "image_generation"}],
        )
    except Exception as e:
        logger.exception("Error al generar imagen con OpenAI")
        raise

    try:
        image_data = [
            output.result
            for output in response.output
            if output.type == "image_generation_call"
        ]

        image_base64 = image_data[0]
        img_bytes = base64.b64decode(image_base64)
        return img_bytes
    except Exception as e:
        logger.exception("No se pudo extraer la imagen de la respuesta de OpenAI")
        raise

      