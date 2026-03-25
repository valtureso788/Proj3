const API = "/api";


const movieList  = document.getElementById("movie-list");
const movieForm  = document.getElementById("movie-form");
const movieTitle = document.getElementById("movie-title");
const movieGenre = document.getElementById("movie-genre");
const movieYear  = document.getElementById("movie-year");

async function loadMovies() {
  try {
    const res  = await fetch(`${API}/movies/`);
    const data = await res.json();
    movieList.innerHTML = "";

    data.forEach((m) => {
      const li = document.createElement("li");

      const info = document.createElement("div");
      info.className = "info";
      info.innerHTML = `
        <span class="title">${m.title}</span>
        <div class="meta">${m.genre} · ${m.year}</div>
      `;

      const btn = document.createElement("button");
      btn.textContent = "✕";
      btn.addEventListener("click", () => deleteMovie(m.id));

      li.append(info, btn);
      movieList.append(li);
    });

    // Обновить выпадающие списки фильмов (для сеансов)
    updateMovieSelects(data);
  } catch (err) {
    movieList.innerHTML = "<li style='color:red'>❌ Ошибка загрузки. Запущен ли сервер?</li>";
    console.error("loadMovies error:", err);
  }
}

movieForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  await fetch(`${API}/movies/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: movieTitle.value.trim(),
      genre: movieGenre.value.trim(),
      year:  Number(movieYear.value),
    }),
  });
  movieForm.reset();
  loadMovies();
});

async function deleteMovie(id) {
  await fetch(`${API}/movies/${id}`, { method: "DELETE" });
  loadMovies();
  loadSessions();  // сеансы тоже могут измениться
}

/** Заполнить <select> фильмами (для формы и фильтра сеансов) */
function updateMovieSelects(movies) {
  const filterSelect = document.getElementById("filter-movie");

  // Фильтр
  const currentFilter = filterSelect.value;
  filterSelect.innerHTML = '<option value="">Все сеансы</option>';
  movies.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.title;
    filterSelect.append(opt);
  });
  filterSelect.value = currentFilter;

  // Форма добавления сеанса (если раскомментирована)
  const sessionMovie = document.getElementById("session-movie");
  if (sessionMovie) {
    const currentVal = sessionMovie.value;
    sessionMovie.innerHTML = '<option value="">Выбери фильм...</option>';
    movies.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = m.title;
      sessionMovie.append(opt);
    });
    sessionMovie.value = currentVal;
  }
}

/* ═══════════════════════════════════════
   СЕАНСЫ  — задание студента
   ═══════════════════════════════════════ */

const sessionList  = document.getElementById("session-list");
const filterMovie  = document.getElementById("filter-movie");

// Фильтр — при смене загружаем сеансы заново
filterMovie.addEventListener("change", () => loadSessions());

async function loadSessions() {
  // ══════════════════════════════════════════════════════════════
  // ЗАДАНИЕ — loadSessions:
  //
  // 1. Определи URL для запроса:
  //    - если filterMovie.value не пустой:
  //        `${API}/sessions/?movie_id=${filterMovie.value}`
  //    - иначе: `${API}/sessions/`
  //
  // 2. Сделай fetch и получи массив сеансов
  //
  // 3. Для каждого сеанса создай карточку:
  //    <div class="session-card">
  //      <div class="session-info">
  //        <div class="session-time">18:00</div>
  //        <div class="session-meta">Фильм ID: 1 · 450 ₽ · 50 мест</div>
  //      </div>
  //      <button>✕</button>  ← вызывает deleteSession(session.id)
  //    </div>
  //    и добавь в sessionList
  //
  // 4. При ошибке — покажи сообщение в sessionList
  //
  // Подсказка — посмотри как сделана loadMovies()
  // ══════════════════════════════════════════════════════════════
  try {
    // Если выбран фильм — фильтруем сеансы по нему
    const movieId = filterMovie.value;
    const url = movieId
      ? `${API}/sessions/?movie_id=${movieId}`
      : `${API}/sessions/`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    sessionList.innerHTML = "";

    if (data.length === 0) {
      sessionList.innerHTML = "<p style='color:#999'>Пока нет сеансов</p>";
      return;
    }

    data.forEach((s) => {
      const card = document.createElement("div");
      card.className = "session-card";

      const info = document.createElement("div");
      info.className = "session-info";

      const time = document.createElement("div");
      time.className = "session-time";
      time.textContent = s.time;

      const meta = document.createElement("div");
      meta.className = "session-meta";
      meta.textContent = `Фильм ID: ${s.movie_id} · ${s.price} ₽ · ${s.seats} мест`;

      info.append(time, meta);

      const btn = document.createElement("button");
      btn.textContent = "✕";
      btn.addEventListener("click", () => deleteSession(s.id));

      card.append(info, btn);
      sessionList.append(card);
    });
  } catch (err) {
    sessionList.innerHTML = "<p style='color:red'>❌ Ошибка загрузки. Запущен ли сервер?</p>";
    console.error("loadSessions error:", err);
  }
}

async function deleteSession(id) {
  // ЗАДАНИЕ: отправь DELETE на /api/sessions/${id} и вызови loadSessions()
  try {
    await fetch(`${API}/sessions/${id}`, { method: "DELETE" });
  } catch (err) {
    console.error("deleteSession error:", err);
  }
  loadSessions();
}

// Форма добавления сеанса (если она подключена в index.html)
const sessionForm = document.getElementById("session-form");
if (sessionForm) {
  const sessionMovie = document.getElementById("session-movie");
  const sessionTime = document.getElementById("session-time");
  const sessionPrice = document.getElementById("session-price");
  const sessionSeats = document.getElementById("session-seats");

  sessionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const movie_id = Number(sessionMovie.value);
      const time = sessionTime.value.trim();
      const price = Number(sessionPrice.value);
      const seats = Number(sessionSeats.value);

      await fetch(`${API}/sessions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movie_id,
          time,
          price,
          seats,
        }),
      });

      sessionForm.reset();
      loadSessions();
    } catch (err) {
      console.error("add session error:", err);
      sessionList.innerHTML = "<p style='color:red'>❌ Ошибка добавления сеанса</p>";
    }
  });
}

/* ── Старт ── */
loadMovies();
loadSessions();
