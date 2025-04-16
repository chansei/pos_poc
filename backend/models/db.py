from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

DATABASE_URL = "sqlite:///./orders.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)


class Menu(Base):
    __tablename__ = "menu"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    price = Column(Integer)


class OrderHeader(Base):
    __tablename__ = "order_header"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending")
    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_item"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("order_header.id"))
    menu_id = Column(Integer, ForeignKey("menu.id"))
    quantity = Column(Integer)
    order = relationship("OrderHeader", back_populates="items")
    units = relationship("OrderItemUnit", back_populates="order_item", cascade="all, delete-orphan")


class OrderItemUnit(Base):
    __tablename__ = "order_item_unit"
    id = Column(Integer, primary_key=True, index=True)
    order_item_id = Column(Integer, ForeignKey("order_item.id"))
    status = Column(String, default="pending")  # pending / cooking / done
    order_item = relationship("OrderItem", back_populates="units")


def init_db():
    Base.metadata.create_all(bind=engine)
