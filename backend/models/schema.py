from pydantic import BaseModel
from typing import List


class OrderItemIn(BaseModel):
    menu_id: int
    quantity: int


class OrderCreate(BaseModel):
    items: List[OrderItemIn]
