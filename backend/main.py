from fastapi import FastAPI
from models.db import init_db
from routes import order, menu
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # ← Reactの開発サーバー
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(order.router, prefix="/api")
app.include_router(menu.router, prefix="/api")


@app.on_event("startup")
def startup_event():
    init_db()
