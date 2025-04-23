from fastapi import FastAPI
from models.db import init_db
from routes import order, menu, sale
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

app = FastAPI()

# CORS を許可するオリジンを列挙
origins = [
    "http://192.168.2.113:5173",  # Vite のデベロップサーバー
    "http://localhost:5173",
]

# ミドルウェアの追加
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # または ["*"] ですべてのオリジンを許可
    allow_credentials=True,       # クッキー／認証情報を含める場合
    allow_methods=["*"],          # GET, POST, PUT… すべてのメソッドを許可
    allow_headers=["*"],          # すべてのヘッダを許可
)


app.include_router(order.router, prefix="/api")
app.include_router(menu.router, prefix="/api")
app.include_router(sale.router, prefix="/api")


@app.on_event("startup")
def startup_event():
    init_db()
