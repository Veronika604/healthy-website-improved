// =================================================================
// Veronika_health — основной JS
// =================================================================
// 1) Данные пользователя хранятся в localStorage под ключом userData
// 2) Выбранное меню — под ключом currentMenu
// 3) Отмеченные тренировки — под ключом workoutProgress
// =================================================================


// ============ 1. БАЗА МЕНЮ ============
const allMenus = [
  {
    id: 0,
    diets: ['normal', 'vegetarian', 'vegan'],
    allergens: ['gluten'],
    meals: [
      {meal:"Завтрак", name:"Овсянка с ягодами",  kcal:320, protein:10, fat:6,  carbs:55, img:"images/oatmeal_berries.jpg"},
      {meal:"Обед",    name:"Боул с киноа",       kcal:450, protein:15, fat:12, carbs:65, img:"images/fish_kinoa.webp"},
      {meal:"Ужин",    name:"Запечённые овощи",   kcal:280, protein:6,  fat:10, carbs:40, img:"images/roasted_vegies.jpg"}
    ]
  },
  {
    id: 1,
    diets: ['normal', 'vegetarian', 'vegan', 'glutenfree'],
    allergens: ['soy'],
    meals: [
      {meal:"Завтрак", name:"Смузи боул",         kcal:310, protein:8,  fat:5,  carbs:50, img:"images/smosie_bowl.jpg"},
      {meal:"Обед",    name:"Салат с нутом",      kcal:420, protein:18, fat:14, carbs:52, img:"images/nut.jpg"},
      {meal:"Ужин",    name:"Тофу с овощами",     kcal:300, protein:20, fat:10, carbs:30, img:"images/tofu.jpg"}
    ]
  },
  {
    id: 2,
    diets: ['normal'],
    allergens: ['dairy'],
    meals: [
      {meal:"Завтрак", name:"Йогурт с фруктами",  kcal:290, protein:12, fat:4,  carbs:48, img:"images/yogurt.jpg"},
      {meal:"Обед",    name:"Куриный салат",      kcal:480, protein:30, fat:18, carbs:40, img:"images/chicken_salad.jpg"},
      {meal:"Ужин",    name:"Рататуй",            kcal:310, protein:8,  fat:12, carbs:35, img:"images/ratattoi.jpg"}
    ]
  },
  {
    id: 3,
    diets: ['normal', 'pescetarian'],
    allergens: ['fish', 'gluten'],
    meals: [
      {meal:"Завтрак", name:"Авокадо-тост",       kcal:350, protein:10, fat:20, carbs:30, img:"images/avocado_toast.jpg"},
      {meal:"Обед",    name:"Лосось с киноа",     kcal:500, protein:35, fat:20, carbs:40, img:"images/salmon.jpg"},
      {meal:"Ужин",    name:"Суп-пюре из тыквы",  kcal:260, protein:6,  fat:8,  carbs:38, img:"images/pumpkin_soup.jpg"}
    ]
  }
];


// ============ 2. ДАННЫЕ ПОЛЬЗОВАТЕЛЯ ============
function getUserData() {
  return JSON.parse(localStorage.getItem('userData') || '{}');
}
function saveUserData(data) {
  localStorage.setItem('userData', JSON.stringify(data));
}


// ============ 3. ФИЛЬТРАЦИЯ МЕНЮ ============
function parseAllergens(text) {
  const t = (text || '').toLowerCase();
  const map = {
    'глютен':'gluten','gluten':'gluten','пшениц':'gluten',
    'молок':'dairy','лактоз':'dairy','dairy':'dairy',
    'рыб':'fish','fish':'fish','морепрод':'fish',
    'соя':'soy','soy':'soy','тофу':'soy'
  };
  const found = new Set();
  for (const key in map) if (t.includes(key)) found.add(map[key]);
  return found;
}

function getSuitableMenus() {
  const u = getUserData();
  const diet = u.diet || 'normal';
  const userAllergens = parseAllergens(u.allergies);
  return allMenus.filter(menu => {
    if (!menu.diets.includes(diet)) return false;
    for (const a of menu.allergens) if (userAllergens.has(a)) return false;
    return true;
  });
}

function adjustForGoal(menu) {
  const u = getUserData();
  const goal = u.goal || 'maintain';
  const mul = goal === 'lose' ? 0.85 : goal === 'gain' ? 1.2 : 1.0;
  return {
    ...menu,
    meals: menu.meals.map(m => ({
      ...m,
      kcal:    Math.round(m.kcal    * mul),
      protein: Math.round(m.protein * mul),
      fat:     Math.round(m.fat     * mul),
      carbs:   Math.round(m.carbs   * mul)
    }))
  };
}

function getCurrentMenu() {
  const suitable = getSuitableMenus();
  const pool = suitable.length > 0 ? suitable : allMenus;
  let index = parseInt(localStorage.getItem('currentMenu') || '0');
  if (index >= pool.length || index < 0) index = 0;
  return {
    menu: adjustForGoal(pool[index]),
    index,
    total: pool.length,
    fallback: suitable.length === 0
  };
}


// ============ 4. СТРАНИЦА МЕНЮ (menu.html) ============
function renderMenuPage() {
  const grid = document.getElementById('meal-grid');
  if (!grid) return;

  const { menu, index, total, fallback } = getCurrentMenu();

  grid.innerHTML = '';
  menu.meals.forEach(item => {
    const card = document.createElement('article');
    card.className = 'meal';
    card.innerHTML = `
      <div class="meal-image">
        <img src="${item.img}" alt="${item.name}" onerror="this.style.display='none'">
      </div>
      <div class="meal-body">
        <span class="meal-type">${item.meal}</span>
        <h3 class="meal-name">${item.name}</h3>
        <div class="meal-kcal">${item.kcal}<small>ккал</small></div>
        <div class="meal-macros">
          <span>Белки <strong>${item.protein}г</strong></span>
          <span>Жиры <strong>${item.fat}г</strong></span>
          <span>Углеводы <strong>${item.carbs}г</strong></span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  const info = document.getElementById('menu-info');
  if (info) {
    info.textContent = fallback
      ? 'Под твою анкету ничего не подошло — показываем стандартное меню'
      : `Вариант ${index + 1} из ${total} — подобрано под твою анкету`;
  }
}

function changeMenu() {
  const suitable = getSuitableMenus();
  const pool = suitable.length > 0 ? suitable : allMenus;
  if (pool.length <= 1) {
    alert('Это единственное меню, которое подходит под твою анкету 🙂');
    return;
  }
  let index = parseInt(localStorage.getItem('currentMenu') || '0');
  index = (index + 1) % pool.length;
  localStorage.setItem('currentMenu', index);
  renderMenuPage();
}


// ============ 5. ЛИЧНЫЙ КАБИНЕТ (profile.html) ============

const LABELS = {
  diet: {
    normal:'Обычное', vegan:'Веган', vegetarian:'Вегетарианец',
    pescetarian:'Пескетарианец', glutenfree:'Без глютена', keto:'Кето'
  },
  goal: { lose:'Похудеть', maintain:'Поддерживать', gain:'Набрать' },
  activity: { low:'Низкая', medium:'Средняя', high:'Высокая' }
};

// Подсчёт ИМТ и позиция на шкале (от 15 до 35)
function calcBMI(height, weight) {
  if (!height || !weight) return null;
  return weight / Math.pow(height / 100, 2);
}
function bmiPosition(bmi) {
  // Шкала от 15 до 35 = 0% → 100%
  const min = 15, max = 35;
  return Math.max(0, Math.min(100, ((bmi - min) / (max - min)) * 100));
}
function bmiCategory(bmi) {
  if (bmi < 18.5) return 'Недовес';
  if (bmi < 25)   return 'Норма';
  if (bmi < 30)   return 'Избыточный';
  return 'Ожирение';
}

function renderDashboardHead() {
  const u = getUserData();
  const head = document.getElementById('dash-head');
  if (!head) return;
  head.innerHTML = `
    <h1>Привет, ${u.username || 'друг'}</h1>
    <p>Твой план на сегодня</p>
  `;
}

function renderStats() {
  const container = document.getElementById('stats');
  if (!container) return;
  const u = getUserData();
  const bmi = calcBMI(u.height, u.weight);
  const { menu } = getCurrentMenu();
  const totalKcal = menu.meals.reduce((s, m) => s + m.kcal, 0);

  container.innerHTML = `
    <div class="stat">
      <div class="stat-label">Вес</div>
      <div class="stat-value">${u.weight || '—'}<small>кг</small></div>
      ${u.goal_weight ? `<div class="stat-sub">Цель: ${u.goal_weight} кг</div>` : ''}
    </div>
    <div class="stat">
      <div class="stat-label">ИМТ</div>
      <div class="stat-value">${bmi ? bmi.toFixed(1) : '—'}</div>
      ${bmi ? `<div class="stat-sub">${bmiCategory(bmi)}</div>` : ''}
    </div>
    <div class="stat">
      <div class="stat-label">Калории</div>
      <div class="stat-value">${totalKcal}<small>ккал</small></div>
      <div class="stat-sub">на сегодня</div>
    </div>
    <div class="stat">
      <div class="stat-label">Цель</div>
      <div class="stat-value" style="font-size: 22px;">${LABELS.goal[u.goal] || '—'}</div>
      <div class="stat-sub">${LABELS.activity[u.activity] || ''} активность</div>
    </div>
  `;
}

function renderBMIBlock() {
  const container = document.getElementById('bmi-block');
  if (!container) return;
  const u = getUserData();
  const bmi = calcBMI(u.height, u.weight);

  if (!bmi) {
    container.innerHTML = '<h3 class="card-title">ИМТ</h3><p style="color:var(--muted)">Заполни рост и вес в анкете</p>';
    return;
  }

  const pos = bmiPosition(bmi);
  container.innerHTML = `
    <h3 class="card-title">ИМТ <span class="aside">${bmi.toFixed(1)} · ${bmiCategory(bmi)}</span></h3>
    <div class="bmi-scale">
      <div class="bmi-marker" style="left: ${pos}%;"></div>
    </div>
    <div class="bmi-legend">
      <span>Недовес</span><span>Норма</span><span>Избыток</span><span>Ожирение</span>
    </div>
  `;
}

function renderGoalBlock() {
  const container = document.getElementById('goal-block');
  if (!container) return;
  const u = getUserData();

  if (!u.weight || !u.goal_weight) {
    container.innerHTML = '<h3 class="card-title">Прогресс к цели</h3><p style="color:var(--muted)">Укажи цель веса в анкете</p>';
    return;
  }

  const current = parseFloat(u.weight);
  const target  = parseFloat(u.goal_weight);
  const diff    = Math.abs(current - target);

  // Условный «стартовый» вес — текущий + разница (для отображения прогресса)
  // Так как стартового веса нет, покажем просто разницу до цели
  const direction = target < current ? 'похудеть на' : target > current ? 'набрать' : 'поддерживать';
  const dirShort  = target < current ? 'Похудеть' : target > current ? 'Набрать' : 'Поддерживать';

  container.innerHTML = `
    <h3 class="card-title">Цель</h3>
    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:4px;">
      <div>
        <div style="font-family: var(--font-display); font-size: 36px; color: var(--forest);">
          ${current} → ${target}<small style="font-size:14px; color:var(--muted); font-family:var(--font-body);"> кг</small>
        </div>
      </div>
      <div style="text-align:right; color:var(--muted); font-size:14px;">
        ${dirShort}<br>
        <strong style="color:var(--forest); font-family:var(--font-display); font-size:18px;">${diff.toFixed(1)} кг</strong>
      </div>
    </div>
    <p style="color:var(--muted); font-size:14px; margin-top:12px;">
      Нужно ${direction} ${diff.toFixed(1)} кг. План меню и тренировок настроен под это.
    </p>
  `;
}

function renderMenuCard() {
  const container = document.getElementById('menu-card');
  if (!container) return;
  const { menu, fallback } = getCurrentMenu();
  const total = menu.meals.reduce((s, m) => s + m.kcal, 0);

  let html = `<h3 class="card-title">Меню на сегодня <span class="aside">${total} ккал</span></h3>`;
  html += '<div class="mini-meals">';
  menu.meals.forEach(m => {
    html += `
      <div class="mini-meal">
        <span class="mini-meal-type">${m.meal}</span>
        <span class="mini-meal-name">${m.name}</span>
        <span class="mini-meal-kcal">${m.kcal} ккал</span>
      </div>
    `;
  });
  html += '</div>';
  if (fallback) {
    html += '<p style="color:var(--muted); font-size:12px; margin-top:12px;">Под твои ограничения не нашлось — стандартное меню</p>';
  }
  container.innerHTML = html;
}

function renderWorkouts() {
  const container = document.getElementById('workouts-card');
  if (!container) return;
  const u = getUserData();
  const activity = u.activity || 'low';
  const goal     = u.goal     || 'maintain';

  let workouts;
  if (activity === 'low') {
    workouts = ['Утренняя зарядка 10 мин', 'Прогулка 20 мин', 'Растяжка 10 мин'];
  } else if (activity === 'medium') {
    workouts = ['Утренняя зарядка 15 мин', 'Прогулка 40 мин', 'Лёгкое кардио 20 мин', 'Растяжка 15 мин'];
  } else {
    workouts = ['Утренняя зарядка 15 мин', 'Кардио 40 мин', 'Силовая 30 мин', 'Растяжка 15 мин'];
  }
  if (goal === 'lose')      workouts.push('Дополнительное кардио 15 мин');
  else if (goal === 'gain') workouts.push('Силовая с отягощением 20 мин');

  // Восстановим галочки из localStorage
  const saved = JSON.parse(localStorage.getItem('workoutProgress') || '{}');
  const today = new Date().toDateString();
  const todayData = saved[today] || {};

  const done = workouts.filter((w, i) => todayData[i]).length;
  const pct = Math.round((done / workouts.length) * 100);

  let html = `
    <h3 class="card-title">Тренировки <span class="aside">${done} из ${workouts.length}</span></h3>
    <div class="progress"><div class="progress-fill" style="width: ${pct}%;"></div></div>
    <div class="workouts-list" style="margin-top:16px;">
  `;
  workouts.forEach((w, i) => {
    const checked = todayData[i] ? 'checked' : '';
    html += `
      <label class="workout">
        <input type="checkbox" data-idx="${i}" ${checked}>
        <span class="workout-name">${w}</span>
      </label>
    `;
  });
  html += '</div>';
  container.innerHTML = html;

  // Привязываем обработчики галочек
  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const idx = e.target.dataset.idx;
      const saved = JSON.parse(localStorage.getItem('workoutProgress') || '{}');
      saved[today] = saved[today] || {};
      saved[today][idx] = e.target.checked;
      localStorage.setItem('workoutProgress', JSON.stringify(saved));
      renderWorkouts(); // перерисовать прогресс
    });
  });
}

function renderProfileInfo() {
  const container = document.getElementById('profile-info');
  if (!container) return;
  const u = getUserData();

  const items = [];
  if (u.email)          items.push({k:'Email', v:u.email});
  if (u.height)         items.push({k:'Рост', v:u.height + ' см'});
  if (u.diet)           items.push({k:'Тип питания', v: LABELS.diet[u.diet] || u.diet});
  if (u.allergies)      items.push({k:'Аллергии', v:u.allergies});
  if (u.favorite_foods) items.push({k:'Любимое', v:u.favorite_foods});

  let html = '<h3 class="card-title">Твоя анкета</h3><div class="profile-info-grid">';
  items.forEach(it => {
    html += `<div class="profile-info-item"><span class="k">${it.k}</span><span class="v">${it.v}</span></div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

function logout() {
  if (!confirm('Выйти и удалить все данные?')) return;
  localStorage.removeItem('userData');
  localStorage.removeItem('currentMenu');
  localStorage.removeItem('workoutProgress');
  window.location.href = 'index.html';
}


// ============ 6. ГЛАВНЫЙ ЗАПУСК ============
document.addEventListener("DOMContentLoaded", () => {
  // Sticky nav
  const nav = document.getElementById('nav');
  if (nav && !nav.classList.contains('solid')) {
    const onScroll = () => {
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Детектор страницы
  const u = getUserData();

  // Страница профиля
  if (document.getElementById('dash-head')) {
    if (!u.username) { window.location.href = 'register.html'; return; }
    renderDashboardHead();
    renderStats();
    renderBMIBlock();
    renderGoalBlock();
    renderMenuCard();
    renderWorkouts();
    renderProfileInfo();
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    return;
  }

  // Страница меню
  if (document.getElementById('meal-grid')) {
    if (!u.username) { window.location.href = 'register.html'; return; }
    renderMenuPage();
  }
});
