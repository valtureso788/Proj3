const API = "/api";

let selectedProductId = 1; // текущий выбранный товар

/* ═══════════════════════════════════════
   ТОВАРЫ  — полностью готово
   ═══════════════════════════════════════ */

const productsBar = document.getElementById("products-bar");

async function loadProducts() {
  try {
    const res  = await fetch(`${API}/products/`);
    const data = await res.json();
    productsBar.innerHTML = "";

    data.forEach((p) => {
      const btn = document.createElement("button");
      btn.className = "product-btn" + (p.id === selectedProductId ? " active" : "");
      btn.textContent = `${p.image} ${p.name}`;
      btn.addEventListener("click", () => {
        selectedProductId = p.id;
        loadProducts();   // обновить подсветку
        loadReviews();    // загрузить отзывы для товара
        loadStats();      // обновить статистику
      });
      productsBar.append(btn);
    });
  } catch (err) {
    productsBar.innerHTML = "<p style='color:red'>❌ Запусти сервер</p>";
    console.error("loadProducts error:", err);
  }
}

/* ═══════════════════════════════════════
   ОТЗЫВЫ  — задание студента
   ═══════════════════════════════════════ */

const reviewsList = document.getElementById("reviews-list");

// Вспомогательная функция — рендер звёзд
function renderStars(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

async function loadReviews() {
  // ══════════════════════════════════════════════════════════════
  // ЗАДАНИЕ — loadReviews:
  //
  // 1. Сделай fetch на `${API}/reviews/?product_id=${selectedProductId}`
  //
  // 2. Получи массив отзывов
  //
  // 3. Если массив пустой — покажи "Пока нет отзывов"
  //
  // 4. Для каждого отзыва создай карточку:
  //    <div class="review-card">
  //      <div class="review-header">
  //        <span class="review-author">Анна</span>
  //        <span class="review-date">2026-03-20</span>
  //      </div>
  //      <div class="review-stars">★★★★★</div>
  //      <div class="review-text">Отличный звук!</div>
  //    </div>
  //
  // Подсказка: используй renderStars(review.rating) для звёзд
  //
  // 5. При ошибке — покажи сообщение
  //
  // Пример:
  //
  // try {
  //   const res = await fetch(`${API}/reviews/?product_id=${selectedProductId}`);
  //   const data = await res.json();
  //   reviewsList.innerHTML = "";
  //   if (data.length === 0) {
  //     reviewsList.innerHTML = "<p>Пока нет отзывов</p>";
  //     return;
  //   }
  //   data.forEach(r => {
  //     const card = document.createElement("div");
  //     card.className = "review-card";
  //     card.innerHTML = `
  //       <div class="review-header">
  //         <span class="review-author">${r.author}</span>
  //         <span class="review-date">${r.date}</span>
  //       </div>
  //       <div class="review-stars">${renderStars(r.rating)}</div>
  //       <div class="review-text">${r.text}</div>
  //     `;
  //     reviewsList.append(card);
  //   });
  // } catch (err) { ... }
  // ══════════════════════════════════════════════════════════════

  try {
    const res = await fetch(
      `${API}/reviews/?product_id=${selectedProductId}`
    );
    const data = await res.json();

    reviewsList.innerHTML = "";
    if (data.length === 0) {
      reviewsList.innerHTML = "<p>Пока нет отзывов</p>";
      return;
    }

    data.forEach((r) => {
      const card = document.createElement("div");
      card.className = "review-card";
      card.innerHTML = `
        <div class="review-header">
          <span class="review-author">${r.author}</span>
          <span class="review-date">${r.date}</span>
        </div>
        <div class="review-stars">${renderStars(r.rating)}</div>
        <div class="review-text">${r.text}</div>
      `;
      reviewsList.append(card);
    });
  } catch (err) {
    reviewsList.innerHTML = "<p style='color:red'>❌ Не удалось загрузить отзывы</p>";
    console.error("loadReviews error:", err);
  }
}

/* ═══════════════════════════════════════
   СТАТИСТИКА  — задание студента
   ═══════════════════════════════════════ */

const avgNum        = document.getElementById("avg-num");
const avgStars      = document.getElementById("avg-stars");
const breakdown     = document.getElementById("stars-breakdown");
const totalReviews  = document.getElementById("total-reviews");

async function loadStats() {
  // ══════════════════════════════════════════════════════════════
  // ЗАДАНИЕ — loadStats:
  //
  // 1. Сделай fetch на `${API}/reviews/stats?product_id=${selectedProductId}`
  //
  // 2. Получи объект: { product_id, total_reviews, average_rating, stars: {"5":1, ...} }
  //
  // 3. Обнови элементы:
  //    avgNum.textContent = data.average_rating.toFixed(1);
  //    avgStars.textContent = renderStars(Math.round(data.average_rating));
  //    totalReviews.textContent = `${data.total_reviews} отзывов`;
  //
  // 4. Для breakdown (полоски 5★ → 1★) создай строки:
  //    for (let i = 5; i >= 1; i--) {
  //      const count = data.stars[String(i)];
  //      const percent = data.total_reviews ? (count / data.total_reviews * 100) : 0;
  //      // создай <div class="star-row"> с label, bar-fill (width=percent%), num
  //    }
  //
  // Пример строки:
  //   <div class="star-row">
  //     <span class="label">5★</span>
  //     <div class="star-bar"><div class="star-bar-fill" style="width:50%"></div></div>
  //     <span class="num">1</span>
  //   </div>
  // ══════════════════════════════════════════════════════════════

  try {
    const res = await fetch(
      `${API}/reviews/stats?product_id=${selectedProductId}`
    );
    const data = await res.json();

    avgNum.textContent = Number(data.average_rating).toFixed(1);
    avgStars.textContent = renderStars(Math.round(data.average_rating));
    totalReviews.textContent = `${data.total_reviews} отзывов`;

    breakdown.innerHTML = "";
    for (let i = 5; i >= 1; i--) {
      const count = data.stars[String(i)];
      const percent = data.total_reviews
        ? (count / data.total_reviews) * 100
        : 0;

      const row = document.createElement("div");
      row.className = "star-row";
      row.innerHTML = `
        <span class="label">${i}★</span>
        <div class="star-bar">
          <div class="star-bar-fill" style="width:${percent}%"></div>
        </div>
        <span class="num">${count}</span>
      `;
      breakdown.append(row);
    }
  } catch (err) {
    avgNum.textContent = "0.0";
    avgStars.textContent = renderStars(0);
    totalReviews.textContent = "0 отзывов";
    breakdown.innerHTML = "";
    console.error("loadStats error:", err);
  }
}

/* ═══════════════════════════════════════
   ФОРМА ОТЗЫВА  — задание студента
   ═══════════════════════════════════════ */

const starPicker = document.getElementById("star-picker");
const ratingInput = document.getElementById("review-rating");

let currentRating = 0;

if (starPicker && ratingInput) {
  starPicker.addEventListener("click", (e) => {
    if (!e.target.classList.contains("pick-star")) return;

    currentRating = Number(e.target.dataset.value);
    ratingInput.value = currentRating;

    document.querySelectorAll(".pick-star").forEach((s) => {
      s.classList.toggle(
        "lit",
        Number(s.dataset.value) <= currentRating
      );
    });
  });
}

const reviewForm = document.getElementById("review-form");
const reviewAuthor = document.getElementById("review-author");
const reviewText = document.getElementById("review-text");

if (reviewForm && reviewAuthor && reviewText) {
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (currentRating === 0) {
      alert("Выбери рейтинг!");
      return;
    }

    try {
      const res = await fetch(`${API}/reviews/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProductId,
          author: reviewAuthor.value.trim(),
          text: reviewText.value.trim(),
          rating: currentRating,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        alert(msg || "Ошибка при отправке отзыва");
        return;
      }
    } catch (err) {
      alert("Ошибка при отправке отзыва");
      console.error("submit review error:", err);
      return;
    }

    reviewForm.reset();
    currentRating = 0;
    if (ratingInput) ratingInput.value = 0;
    document.querySelectorAll(".pick-star").forEach((s) =>
      s.classList.remove("lit")
    );

    loadReviews();
    loadStats();
  });
}

/* ── Старт ── */
loadProducts();
loadReviews();
loadStats();
