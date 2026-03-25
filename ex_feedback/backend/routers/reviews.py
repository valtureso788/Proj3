"""Роутер ОТЗЫВОВ

Здесь уже есть:
- Импорты
- Модель данных
- Начальные данные
- Сигнатуры функций с TODO внутри
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/reviews", tags=["reviews"])

# ── Хранилище отзывов ─────────────────────────────────────────
db: list[dict] = [
    {"id": 1, "product_id": 1, "author": "Анна",  "text": "Отличный звук!",         "rating": 5, "date": "2026-03-20"},
    {"id": 2, "product_id": 1, "author": "Борис", "text": "Хорошие, но тяжеловаты", "rating": 4, "date": "2026-03-21"},
    {"id": 3, "product_id": 2, "author": "Вика",  "text": "Печатать одно удовольствие", "rating": 5, "date": "2026-03-22"},
]
next_id = 4


# ── Модель входных данных (готова) ─────────────────────────────
class ReviewIn(BaseModel):
    product_id: int
    author: str
    text: str
    rating: int     # от 1 до 5


# ══════════════════════════════════════════════════════════════
# ЭНДПОИНТ 1: GET /reviews/
#
# Возвращает список отзывов.
# Если передан query-параметр product_id — только для этого товара.
#
# Подсказка по сигнатуре:
#   def get_reviews(product_id: int = Query(default=None)):
#
# Логика:
#   - если product_id не None → фильтруй db
#   - иначе → верни всё
# ══════════════════════════════════════════════════════════════

@router.get("/")
def get_reviews(product_id: int | None = Query(default=None)):
    # Если передан product_id — вернем только отзывы этого товара.
    if product_id is not None:
        return [r for r in db if r["product_id"] == product_id]
    return db


# ══════════════════════════════════════════════════════════════
# ЭНДПОИНТ 2: POST /reviews/
#
# Добавляет новый отзыв.
#
# Валидация:
#   - author не пустой
#   - text не пустой
#   - rating от 1 до 5 (иначе HTTPException(400, "Рейтинг от 1 до 5"))
#   - product_id существует (проверь в products.db!)
#     from routers.products import db as products_db
#
# Создание:
#   - id = next_id (не забудь global next_id и next_id += 1)
#   - date = datetime.now().strftime("%Y-%m-%d")
#   - собери словарь и добавь в db
#   - верни созданный отзыв
#   - status_code=201
# ══════════════════════════════════════════════════════════════

@router.post("/", status_code=201)
def add_review(body: ReviewIn):
    global next_id
    # 1) Проверки
    author = body.author.strip()
    text = body.text.strip()

    if not author:
        raise HTTPException(400, "Имя не должно быть пустым")
    if not text:
        raise HTTPException(400, "Текст отзыва не должен быть пустым")
    if body.rating < 1 or body.rating > 5:
        raise HTTPException(400, "Рейтинг от 1 до 5")

    from routers.products import db as products_db

    product_exists = any(p["id"] == body.product_id for p in products_db)
    if not product_exists:
        raise HTTPException(400, "Товар не найден")

    # 2) Создание
    review = {
        "id": next_id,
        "product_id": body.product_id,
        "author": author,
        "text": text,
        "rating": body.rating,
        "date": datetime.now().strftime("%Y-%m-%d"),
    }
    db.append(review)
    next_id += 1
    return review


# ══════════════════════════════════════════════════════════════
# ЭНДПОИНТ 3: GET /reviews/stats
#
# ВАЖНО: этот маршрут ДОЛЖЕН быть ВЫШЕ маршрута /reviews/{id},
# иначе FastAPI воспримет "stats" как ID.
# Поскольку у нас нет /reviews/{id}, тут всё ок, но запомни!
#
# Принимает query-параметр product_id (обязательный).
#   def get_stats(product_id: int):
#
# Возвращает:
# {
#     "product_id": 1,
#     "total_reviews": 2,
#     "average_rating": 4.5,
#     "stars": { "5": 1, "4": 1, "3": 0, "2": 0, "1": 0 }
# }
#
# Логика:
#   1. Отфильтруй отзывы по product_id
#   2. Посчитай total_reviews (len)
#   3. Посчитай average_rating (sum(ratings)/len), округли до 1 знака
#   4. Посчитай stars — сколько отзывов с каждым рейтингом 1-5
#   5. Если отзывов 0 — average_rating = 0
# ══════════════════════════════════════════════════════════════

@router.get("/stats")
def get_stats(product_id: int):
    reviews = [r for r in db if r["product_id"] == product_id]
    total = len(reviews)

    avg = round((sum(r["rating"] for r in reviews) / total), 1) if total else 0

    stars: dict[str, int] = {}
    for i in range(1, 6):
        stars[str(i)] = sum(1 for r in reviews if r["rating"] == i)

    return {
        "product_id": product_id,
        "total_reviews": total,
        "average_rating": avg,
        "stars": stars,
    }
