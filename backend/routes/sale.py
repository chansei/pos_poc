from fastapi import APIRouter, Depends, Path, HTTPException
from sqlalchemy.orm import Session
from models.db import SessionLocal, Menu, OrderHeader, OrderItem, OrderItemUnit
from models.schema import OrderCreate
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from collections import defaultdict

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_today_utc():
    jst = timezone(timedelta(hours=9))
    now_jst = datetime.now(jst)
    today_jst = now_jst.replace(hour=0, minute=0, second=0, microsecond=0)
    return today_jst.astimezone(timezone.utc)


@router.get("/sale/today")
def get_today_sales(db: Session = Depends(get_db)):
    today_utc = get_today_utc()

    rows = (
        db.query(
            Menu.name.label("name"),
            func.sum(OrderItem.quantity).label("total_quantity")
        )
        .select_from(OrderItem)
        .join(OrderHeader, OrderItem.order_id == OrderHeader.id)
        .join(Menu, OrderItem.menu_id == Menu.id)
        .filter(OrderHeader.created_at >= today_utc)
        .group_by(Menu.name)
        .order_by(Menu.name)
        .all()
    )

    return [
        {"name": name, "count": total_quantity}
        for name, total_quantity in rows
    ]


class SaleByTimeMenu(BaseModel):
    time: str     # "HH:MM"（JST）
    name: str     # メニュー名
    count: int    # 売上個数


@router.get("/sale/test")
def test_sale(db: Session = Depends(get_db)):
    today_utc = get_today_utc()

    # 1) 当日の「done」ユニット分の生データを取得
    rows = (
        db.query(
            OrderHeader.created_at,
            Menu.name,
            OrderItem.quantity
        )
        .select_from(OrderItemUnit)
        .join(OrderItem, OrderItem.id == OrderItemUnit.order_item_id)
        .join(Menu, Menu.id == OrderItem.menu_id)
        .join(OrderHeader, OrderHeader.id == OrderItem.order_id)
        .filter(
            OrderItemUnit.status == "done",
            OrderHeader.created_at >= today_utc
        )
        .all()
    )

    return [
        {"name": name, "created_at": created_at, "qty": quantity}
        for name, created_at, quantity in rows]

    # 2) 集計用のネストド辞書を用意
    #    summary[ 時間ラベル ][ メニュー名 ] = 個数
    summary: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))

    for created_at, name, qty in rows:
        # tz情報がない場合は UTC とみなして付与
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        # JST に変換
        jst_dt = created_at.astimezone(timezone(timedelta(hours=9)))
        # 30分単位に丸め
        bucket = jst_dt.replace(
            minute=(jst_dt.minute // 30) * 30,
            second=0, microsecond=0
        )
        label = bucket.strftime("%H:%M")
        # メニューごとに個数を加算
        summary[label][name] += qty

    # 3) ソートしてフラットなリストに変換
    result: list[SaleByTimeMenu] = []
    for time_label in sorted(summary.keys()):
        for name, count in summary[time_label].items():
            result.append(SaleByTimeMenu(
                time=time_label,
                name=name,
                count=count
            ))

    return result


@router.post("/sale/reset")
def reset_today_sales(db: Session = Depends(get_db)):
    today_utc = get_today_utc()
    # OrderHeader単位でリセット
    db.query(OrderHeader).filter(OrderHeader.created_at >= today_utc).delete()
    db.commit()
    return {"message": "本日の売上データをリセットしました"}
