from fastapi import FastAPI, File, UploadFile, Form, Path, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, ValidationError, model_validator
from typing import Optional, Literal
import json
import logging
from image_utils import process_image_bytes
from product_generators import analyze_product_image, generate_product_image
import shutil
from sqlalchemy.sql import insert, select, func, or_
from database import database, products
import os
import uuid


app = FastAPI()

# configure basic logging for the module
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Allow cross-origin requests from the frontend/dev host
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIRECTORY="~/uploads"


class Health(BaseModel):
    status: str


class ProductCreation(BaseModel):
    productName: str
    productDescription: str
    price: float

class ProductGenerationRequest(BaseModel):
    requestType: Literal["image", "product_description"]
    productName: Optional[str] = None
    productDescription: Optional[str] = None

    @model_validator(mode="after")
    def check_required_for_image(self):
        if self.requestType == "image":
            if not self.productName:
                raise ValueError("'productName' es obligatorio cuando 'requestType' es 'image'")
            if not self.productDescription:
                raise ValueError("'productDescription' es obligatorio cuando 'requestType' es 'image'")
        return self

class Product(BaseModel):
    id: str
    name: str
    description: str
    price: float
    image: Optional[str] = None

    class Config:
        from_attributes = True

class PaginatedProductResponse(BaseModel):
    total: int
    result: list[Product]

class ProductGenerationResponse(BaseModel):
    requestType: Literal["image", "product_description"]
    productName: str
    productDescription: str
    image: str


@app.on_event("startup")
async def startup():
    """Connect to the database on startup."""
    logger.info("Connecting to the database...")
    try:
        await database.connect()
        logger.info("Database connection successful.")
    except Exception as e:
        logger.error(f"Database connection failed during startup: {e}")
        # Re-raise the exception to prevent the app from starting with a broken database connection
        raise HTTPException(status_code=503, detail="Service unavailable: Database connection failed.")

@app.on_event("shutdown")
async def shutdown():
    """Disconnect from the database on shutdown."""
    logger.info("Disconnecting from the database...")
    await database.disconnect()

@app.get("/health", response_model=Health)
async def health():
    return Health(status="ok")

@app.post("/products")
async def products_generation(
    request: str = Form(...),
    productImage: Optional[UploadFile] = File(None)
):
    try:
        payload = json.loads(request)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="JSON inválido en el campo 'request'")
    
    image_uuid = str(uuid.uuid4())
    root, extension = os.path.splitext(productImage.filename)
    file_name = image_uuid + extension
    file_location = os.path.join(UPLOAD_DIRECTORY, file_name)
    os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(productImage.file, buffer)
    
    try:
        req_obj = ProductCreation(**payload)

        product_id = str(uuid.uuid4())

        query = insert(products).values(
            id=product_id,
            name=req_obj.productName,
            description=req_obj.productDescription,
            price=req_obj.price,
            image=file_name
        )

        await database.execute(query)

        return {"id": product_id, "productName": req_obj.productName, "productDescription": req_obj.productDescription, "price": req_obj.price, "image_filename": file_name}
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())
    except Exception as e:
        logger.exception("Excepción al procesar /products")
        raise HTTPException(status_code=422, detail=str(e))

@app.get("/products", response_model=PaginatedProductResponse)
async def list_products(
    search: Optional[str] = None,
    page: int = 1,
    size: int = 10,
):
    if page < 1:
        page = 1
    if size < 1:
        size = 10
        
    offset = (page - 1) * size
    limit = size

    count_query = select(func.count()).select_from(products)
    select_query = products.select()

    if search:
        search_pattern = f"%{search}%" 
        
        search_filter = or_(
            products.c.name.ilike(search_pattern),
            products.c.description.ilike(search_pattern)
        )
        
        count_query = count_query.where(search_filter)
        select_query = select_query.where(search_filter)
    
    total_count = await database.fetch_val(count_query)
    
    select_query = select_query.order_by(products.c.id).limit(limit).offset(offset)
    records = await database.fetch_all(select_query)

    product_list = [Product.model_validate(dict(record)) for record in records]
    
    return PaginatedProductResponse(
        total=total_count,
        result=product_list
    )


@app.get("/images/{image_filename}")
async def get_product_image(image_filename: str = Path(..., description="Nombre del archivo de la imagen.")):
    """
    Sirve un archivo de imagen estático desde el directorio de uploads.
    """
    
    # 1. Construir la ruta completa del archivo
    file_location = os.path.join(UPLOAD_DIRECTORY, image_filename)
    
    # 2. Verificar que el archivo exista
    if not os.path.exists(file_location):
        logger.warning(f"Intento de acceder a imagen no encontrada: {image_filename}")
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    # 3. Servir el archivo utilizando FileResponse
    # FastAPI/Starlette infiere el Content-Type (MIME type) automáticamente
    return FileResponse(file_location)

@app.post("/products/generation", response_model=ProductGenerationResponse)
async def products_generation(
    request: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    # parse incoming JSON string in `request` into a Pydantic model
    try:
        payload = json.loads(request)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="JSON inválido en el campo 'request'")

    try:
        req_obj = ProductGenerationRequest(**payload)

        if req_obj.requestType == "product_description":
            if image is None:
                raise HTTPException(status_code=400, detail="Se requiere una imagen para 'requestType' = 'image'")
            content = await image.read()
            mime = getattr(image, "content_type", None)

            image_data_uri = process_image_bytes(content, content_type=mime)
            productName, productDescription = analyze_product_image(image_data_uri)

            return ProductGenerationResponse(
                requestType=req_obj.requestType,
                productName=productName,
                productDescription=productDescription,
                image=image_data_uri,
            )
        elif req_obj.requestType == "image":
            image_data_uri = generate_product_image(req_obj.productName, req_obj.productDescription)

            return ProductGenerationResponse(
                requestType=req_obj.requestType,
                productName=req_obj.productName,
                productDescription=req_obj.productDescription,
                image=image_data_uri,
            )
        
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())
    except Exception as e:
        logger.exception("Excepción al procesar /products/generation")
        raise HTTPException(status_code=422, detail=str(e))






