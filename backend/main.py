from fastapi import FastAPI
from models.db import init_db
from routes import order
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # ← Reactの開発サーバー
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(order.router, prefix="/api")


@app.on_event("startup")
def startup_event():
    init_db()
