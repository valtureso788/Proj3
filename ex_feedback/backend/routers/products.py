"""Роутер ПРОДУКТОВ — ГОТОВ.
Простой список товаров, к которым привязываются отзывы."""

from fastapi import APIRouter

router = APIRouter(prefix="/products", tags=["products"])

db: list[dict] = [
    {"id": 1, "name": "Наушники Sony WH-1000XM5", "image": "🎧"},
    {"id": 2, "name": "Клавиатура Keychron K2",   "image": "⌨️"},
    {"id": 3, "name": "Мышь Logitech MX Master",  "image": "🖱"},
]


@router.get("/")
def get_products():
    return db


@router.get("/{product_id}")
def get_product(product_id: int):
    for p in db:
        if p["id"] == product_id:
            return p
    from fastapi import HTTPException
    raise HTTPException(404, "Товар не найден")
