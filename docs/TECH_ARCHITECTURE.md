# Техническая Архитектура
## Velvet & Stash: Studio 57

---

## 1. СТЕК ТЕХНОЛОГИЙ

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (игра)                       │
│                                                          │
│  Phaser 3.70       — 2D игровой движок (WebGL/Canvas)    │
│  Vite 5.0          — сборщик, HMR, оптимизация бандла   │
│  Web Audio API     — процедурный диско-звук              │
│  Telegram WebApp   — интеграция с TG Mini App API        │
│  localStorage      — оффлайн-сохранения                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
                           │
                    HTTP/WebSocket
                           │
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (будущее)                        │
│                                                          │
│  Node.js + Express — API сервер                          │
│  PostgreSQL        — база данных (прогресс, лидерборды)  │
│  Telegram Bot API  — уведомления, авторизация            │
│  Redis             — кэш лидербордов                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 2. СТРУКТУРА ФАЙЛОВ

```
Studio57/
├── index.html              — точка входа, TG SDK, шрифты
├── package.json            — зависимости
├── vite.config.js          — конфигурация сборки
│
├── src/
│   ├── main.js             — инициализация Phaser
│   ├── GameState.js        — центральное состояние (singleton)
│   ├── SaveSystem.js       — сохранение/загрузка
│   │
│   ├── data/               — статические данные
│   │   ├── locales.js      — RU + EN переводы
│   │   ├── guests.js       — генерация гостей
│   │   ├── celebrities.js  — данные знаменитостей
│   │   ├── events.js       — макро-события
│   │   └── upgrades.js     — апгрейды клуба
│   │
│   ├── systems/            — сервисы
│   │   ├── AudioSystem.js  — Web Audio API диско
│   │   ├── StoreSystem.js  — [будущее] IAP монетизация
│   │   ├── LeaderboardSystem.js — [будущее] лидерборды
│   │   └── TelegramSystem.js    — [будущее] TG Cloud Save
│   │
│   └── scenes/             — Phaser сцены
│       ├── BootScene.js         — загрузка, TG init
│       ├── VersionSelectScene.js — выбор версии контента
│       ├── MenuScene.js         — главное меню
│       ├── NightScene.js        — фейсконтроль (основной геймплей)
│       ├── EventPopupScene.js   — комикс-события
│       ├── EndNightScene.js     — финансовый итог
│       ├── OfficeScene.js       — управление клубом
│       └── GameOverScene.js     — экран проигрыша
│
├── docs/                   — документация проекта
│   ├── STUDIO54_HISTORY.md
│   ├── GAME_CONCEPT.md
│   ├── MECHANICS.md
│   ├── CONTENT_VERSIONS.md
│   ├── MONETIZATION.md
│   ├── CHARACTERS.md
│   ├── TECH_ARCHITECTURE.md    ← этот файл
│   ├── PROGRESSION_NIGHTS.md
│   ├── MULTIPLAYER_CONCEPT.md
│   └── ROADMAP.md
│
└── dist/                   — production билд (gitignore)
```

---

## 3. GAMESTATE — ЦЕНТРАЛЬНАЯ ШИНА ДАННЫХ

```javascript
// src/GameState.js — единственный источник правды
GameState = {
  // META
  lang: 'ru',             // 'ru' | 'en'
  contentVersion: null,   // 'safe' | 'adult' | 'max'

  // PROGRESS
  nightNumber: 1,
  totalNights: 0,

  // FINANCES
  velvetBox: 0,           // текущая касса (облагается налогом)
  stash: 0,               // тайник (не облагается, риск ФБР)
  totalEarned: 0,
  totalTaxPaid: 0,
  bankrupt: false,

  // RISK
  fbiSuspicion: 0,        // 0–100
  policeHeat: 0,          // 0–100
  reputation: 50,         // 0–100

  // UPGRADES
  upgrades: {
    sound: 0,             // 0–3
    bar: 0,               // 0–3
    security: 0,          // 0–3
    lights: 0,            // 0–3
    vipLounge: 0,         // 0–3
  },

  // NIGHT STATS (сбрасывается каждую ночь)
  nightStats: {
    approved: 0,
    rejected: 0,
    fights: 0,
    policeVisits: 0,
    underageSlipped: 0,
    celebsHosted: [],
  },

  // FLAGS
  flags: {
    tutorialDone: false,
    firstCelebSeen: false,
    firstRaidSeen: false,
  },

  // MONETISATION STUBS (не активны в MVP)
  store: {
    premiumSkins: [],
    boosters: [],
    adFreeUnlocked: false,
    unlockedNights: 3,    // free: 1–3, paid: 4–8, 9–15
    unlockedCelebs: ['steel', 'warholder'],
  },
}
```

---

## 4. ПОТОК ДАННЫХ (SCENE LIFECYCLE)

```
Boot → [load save] → Version Select (если нет save) → Menu
                                                         │
                                                    Night Scene
                                                         │
                                              ┌──────────┴──────────┐
                                              │                      │
                                         Normal End              FBI Raid
                                              │                      │
                                         End Night              End Night
                                              │                      │
                                          Office                  GameOver
                                              │
                                     [next Night] → Menu / Night
```

---

## 5. СИСТЕМА СОХРАНЕНИЙ

### Текущая (MVP)
```javascript
// localStorage с ключом по Telegram User ID
const key = `studio57_${TelegramWebApp.user?.id || 'local'}`;
localStorage.setItem(key, JSON.stringify(saveable));
```

### Будущая (с сервером)
```javascript
// Шаг 1: Сохранить локально (мгновенно)
localStorage.setItem(key, JSON.stringify(saveable));

// Шаг 2: Sync с облаком (async, не блокирует)
await fetch('/api/save', {
  method: 'POST',
  headers: { 'Authorization': `TelegramInit ${telegramInitData}` },
  body: JSON.stringify(saveable),
});

// При загрузке: локальное + сверка с облаком
const local = JSON.parse(localStorage.getItem(key));
const cloud = await fetch('/api/save').then(r => r.json());
// Берём более свежее (по timestamp)
const save = local.savedAt > cloud.savedAt ? local : cloud;
```

---

## 6. АУДИО АРХИТЕКТУРА

```
Web Audio API Context
       │
       ▼
  Master Gain (volume control)
       │
  ┌────┴────────────────────────────────────┐
  │            SchedulerLoop (25 Hz)         │
  │                                          │
  │  Beat 0 (Quarter): Kick + Bass          │
  │  Beat 1 (Quarter): HiHat open + Snare   │
  │  Beat 2 (Quarter): Kick + Bass          │
  │  Beat 3 (Quarter): HiHat open + Snare   │
  │  + 8th-note offbeat HiHats (closed)     │
  │                                          │
  │  BASS LINE: C2/C3 octave jump pattern   │
  └─────────────────────────────────────────┘

Параметры:
  BPM: 120 (стандарт) → 145 (финал ночи)
  Scheduling lookahead: 100ms
  Scheduler frequency: 25Hz
```

---

## 7. ПРОЦЕДУРНАЯ ГЕНЕРАЦИЯ ГОСТЕЙ

```javascript
// Ключевые параметры генерации:
{
  age:       [16–38], underage_chance: 6–13% (по ночи)
  fakeId:    65% у несовершеннолетних
  style:     [0–4] по распределению (ультра редко)
  intox:     [0–2] пьяный редко в ночь 1
  skin:      [0–4] 5 вариантов кожи
  hair:      8 типов причёски + 8 цветов
  outfit:    5 палитр по стилю
  revenue:   ticketRevenue × styleMultiplier[style]
}
```

---

## 8. PIXEL ART РЕНДЕРИНГ

Все графики процедурные через `Phaser.Graphics`:

```javascript
// Каждый "пиксель" = 3×3 реальных пикселя
const s = 3;

// Портрет рисуется как набор прямоугольников:
g.fillStyle(skinColor);
g.fillRect(cx - 4*s, cy - 9*s, 8*s, 8*s); // голова
g.fillStyle(hairColor);
g.fillRect(cx - 4*s, cy - 12*s, 8*s, 4*s); // причёска
// ...и т.д.
```

**Преимущества:**
- Нет внешних ассетов → работает полностью оффлайн
- Каждый гость уникален процедурно
- Легко добавлять новые причёски/цвета

---

## 9. TELEGRAM MINI APP ИНТЕГРАЦИЯ

```javascript
// Инициализация (BootScene)
window.Telegram.WebApp.ready();
window.Telegram.WebApp.expand();

// Получение пользователя
const user = window.Telegram.WebApp.initDataUnsafe?.user;
// user.id — уникальный ID для сохранений
// user.username — отображение в лидерборде
// user.photo_url — для аватара персонажа

// Будущее: CloudStorage API
window.Telegram.WebApp.CloudStorage.setItem(key, value, cb);
window.Telegram.WebApp.CloudStorage.getItem(key, cb);

// Будущее: Stars покупки
window.Telegram.WebApp.openInvoice(invoiceLink, cb);

// BackButton
window.Telegram.WebApp.BackButton.show();
window.Telegram.WebApp.BackButton.onClick(() => scene.start('Menu'));
```

---

## 10. СБОРКА ДЛЯ ПЛАТФОРМ

### Telegram Mini App
```bash
npm run build
# dist/ → загружается на статический хостинг (Vercel, Netlify, etc.)
# URL прописывается в @BotFather → Menu Button
```

### Steam (через Electron — будущее)
```bash
# Обернуть dist/ в Electron
electron-forge make
# Результат: .exe / .dmg установщик
# Загружается в Steamworks
```

### PWA (Progressive Web App — будущее)
```javascript
// manifest.json + service worker
// Позволяет «установить» на телефон как приложение
// Работает полностью оффлайн
```
