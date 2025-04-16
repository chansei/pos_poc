from fastapi import APIRouter, Depends, Path, HTTPException
from sqlalchemy.orm import Session
from models.db import SessionLocal, Menu, OrderHeader, OrderItem, OrderItemUnit
from models.schema import OrderCreate, MenuCreate, MenuUpdate, MenuDeleteRequest
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from datetime import datetime
import os

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/menu")
def get_menu(db: Session = Depends(get_db)):
    items = db.query(Menu).all()
    return jsonable_encoder(items)


@router.post("/menu")
def create_menu(menu: MenuCreate, db: Session = Depends(get_db)):
    new_item = Menu(name=menu.name, price=menu.price)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"id": new_item.id, "name": new_item.name, "price": new_item.price}


@router.put("/menu/{menu_id}")
def update_menu(menu_id: int, updated: MenuCreate, db: Session = Depends(get_db)):
    menu = db.query(Menu).filter(Menu.id == menu_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")

    menu.name = updated.name
    menu.price = updated.price
    db.commit()
    return {"message": "updated"}


@router.delete("/menu/{menu_id}")
def delete_menu(menu_id: int, request: MenuDeleteRequest, db: Session = Depends(get_db)):
    # パスワードチェック
    correct_password = os.getenv("ADMIN_PASSWORD")
    if request.password != correct_password:
        raise HTTPException(status_code=403, detail="認証失敗：パスワードが正しくありません")

    menu = db.query(Menu).filter(Menu.id == menu_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="メニューが見つかりません")

    db.delete(menu)
    db.commit()
    return {"message": "削除しました"}
