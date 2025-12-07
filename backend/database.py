from databases import Database
from sqlalchemy import create_engine, MetaData, Column, Integer, String, Table, DateTime, Float
import os

DATABASE_URL = os.getenv("DATABASE_URL")


database = Database(DATABASE_URL)
metadata = MetaData()

products = Table(
    "products",
    metadata,
    Column("id", String, primary_key=True),
    Column("name", String, nullable=False),
    Column("description", String),
    Column("image", String),
    Column("price", Float, nullable=False),
)

engine = create_engine(DATABASE_URL)
metadata.create_all(engine)