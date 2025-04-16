from fastapi import APIRouter, Depends, Path, HTTPException
from sqlalchemy.orm import Session
from models.db import SessionLocal, Menu, OrderHeader, OrderItem, OrderItemUnit
from models.schema import OrderCreate
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class StatusUpdate(BaseModel):
    status: str  # 'pending' | 'cooking' | 'done'


class ItemStatusUpdate(BaseModel):
    status: str  # 'pending', 'cooking', 'done'


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/order")
def create_order(payload: dict, db: Session = Depends(get_db)):
    items = payload.get("items")
    if not items:
        raise HTTPException(status_code=400, detail="注文内容がありません")

    # 注文ヘッダー作成
    order = OrderHeader(created_at=datetime.utcnow(), status="pending")
    db.add(order)
    db.flush()  # order.id を取得

    for item_data in items:
        menu_id = item_data["menu_id"]
        quantity = item_data["quantity"]

        # OrderItem 作成
        order_item = OrderItem(order_id=order.id, menu_id=menu_id, quantity=quantity)
        db.add(order_item)
        db.flush()  # order_item.id を取得

        # quantity 分のユニット（OrderItemUnit）を作成
        for _ in range(quantity):
            unit = OrderItemUnit(order_item_id=order_item.id, status="pending")
            db.add(unit)

    db.commit()
    return {"order_id": order.id}


@router.get("/orders")
def list_orders(db: Session = Depends(get_db)):
    orders = db.query(OrderHeader).all()
    result = []

    for order in orders:
        items = []
        for item in order.items:
            menu = db.query(Menu).filter(Menu.id == item.menu_id).first()

            units = [
                {"id": unit.id, "status": unit.status}
                for unit in item.units
            ]

            items.append({
                "id": item.id,
                "name": menu.name if menu else "不明",
                "quantity": item.quantity,
                "units": units
            })

        result.append({
            "id": order.id,
            "created_at": order.created_at,
            "status": order.status,
            "items": items
        })

    return result


@router.post("/orders/{order_id}/status")
def update_status(order_id: int = Path(...), payload: StatusUpdate = None, db: Session = Depends(get_db)):
    order = db.query(OrderHeader).filter(OrderHeader.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    db.commit()
    return {"status": "updated", "order_id": order_id}


@router.get("/calls")
def get_called_orders(db: Session = Depends(get_db)):
    done_orders = db.query(OrderHeader).filter(OrderHeader.status == "done").all()
    return [{"id": order.id, "created_at": order.created_at} for order in done_orders]


@router.post("/order_item/{item_id}/status")
def update_order_item_status(item_id: int, payload: ItemStatusUpdate, db: Session = Depends(get_db)):
    item = db.query(OrderItem).filter(OrderItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.status = payload.status
    db.commit()

    # ✅ 注文内のすべての商品が done なら、注文全体も done に更新
    sibling_items = db.query(OrderItem).filter(OrderItem.order_id == item.order_id).all()
    if all(i.status == "done" for i in sibling_items):
        order = db.query(OrderHeader).filter(OrderHeader.id == item.order_id).first()
        order.status = "done"
        db.commit()

    return {"status": "updated", "item_id": item_id}


@router.post("/order_item_unit/{unit_id}/status")
def update_unit_status(unit_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
    unit = db.query(OrderItemUnit).filter(OrderItemUnit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="ユニットが見つかりません")

    unit.status = payload.status
    db.commit()

    # ✅ 注文全体の完了判定は「その注文に属する全ユニットが done かどうか」
    order_item = db.query(OrderItem).filter(OrderItem.id == unit.order_item_id).first()
    order_id = order_item.order_id

    # order_id に紐づくすべてのユニットを取得
    all_units = (
        db.query(OrderItemUnit)
        .join(OrderItem)
        .filter(OrderItem.order_id == order_id)
        .all()
    )

    if all(u.status == "done" for u in all_units):
        order = db.query(OrderHeader).filter(OrderHeader.id == order_id).first()
        order.status = "done"
        db.commit()

    return {"status": "updated"}
