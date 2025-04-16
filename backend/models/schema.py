from pydantic import BaseModel
from typing import List


class OrderItemIn(BaseModel):
    menu_id: int
    quantity: int


class OrderCreate(BaseModel):
    items: List[OrderItemIn]


class MenuCreate(BaseModel):
    name: str
    price: int


class MenuUpdate(BaseModel):
    name: str
    price: int


class MenuDeleteRequest(BaseModel):
    password: str
