[README.md](https://github.com/user-attachments/files/21695663/README.md)
# TON Games Bot (Telegram WebApp) — v0.1 (RPS ready)

Готовый к запуску каркас игрового приложения:
- Telegram **WebApp** (React/Vite) с **TonConnect v2** подключением кошелька
- **NestJS** backend (Auth, Wallet, Lobby, Matches, RPS bo3)
- **On-chain escrow** контракт (Tact) с методами LOCK/SETTLE/CANCEL/TIMEOUT_REFUND
- **Postgres + Redis** (docker-compose)
- i18n RU/EN, тёмная/светлая тема
- RPS (камень-ножницы-бумага) — commit-reveal, bo3 — реализовано end-to-end
- Дурак/Шашки/Шахматы — заглушки (интерфейсы + роуты), включим во v0.2

> Цель: **запуск на testnet за ~10 минут**: WebApp + Backend + БД + Контракт в тестовой сети TON.

---

## Быстрый старт (Dev, без Telegram)
> Режим для локальной проверки логики без Telegram-контейнера и домена.

1) Требования: Node 18+, Docker, Docker Compose
2) Среда:
```bash
cp .env.example .env
# заполните BOT_TOKEN позже (для Telegram-режима), пока не обязательно
```
3) Поднимите инфраструктуру:
```bash
docker compose up -d db redis
```
4) Backend:
```bash
cd backend
npm i
npm run dev
```
5) WebApp:
```bash
cd ../webapp
npm i
npm run dev
```
6) Откройте WebApp в браузере (dev-мок для Telegram initData включён):  
http://localhost:5173

> Подключите TON-кошелёк через TonConnect UI, создайте комнату RPS и сыграйте bo3.  
> В этом режиме кошелёк и транзакции работают, но **контракт должен быть задеплоен** (см. ниже).

---

## Полный запуск (Telegram Mini App + Testnet TON)
### A. Настроить домен и WebApp в BotFather
1) Подготовьте HTTPS-домен (рекомендую Cloudflare Tunnel/Pages, либо любой ваш).
2) Укажите домен в `BotFather` → **Edit Menu** → **Web App** → URL вашего фронта (например, `https://games.example.com/`).
3) Сохраните `BOT_TOKEN`.

### B. .env
Скопируйте `.env.example` в `.env` и заполните:
- `BOT_TOKEN`
- `RAKE_ADDRESS` (ваш TON адрес для рейка)
- при желании `NETWORK=testnet` (по умолчанию testnet)

### C. Контракт Escrow (Tact, testnet)
1) Установите Tact CLI глобально:
```bash
npm i -g @tact-lang/cli
```
2) Соберите контракт:
```bash
cd contracts
npm i
npm run build
```
3) Деплой (упрощённо): в `contracts/blueprint.config.json` укажите сеть `testnet` и ключи. Затем:
```bash
npm run deploy
```
Скрипт покажет адрес контракта; пропишите его в `.env` → `ESCROW_ADDRESS` (и перезапустите backend).

> Альтернатива: задеплойте через **toncli/toncenter** или ваш любимый тулчейн. Контракт простой, только убедитесь, что адрес платформы для рейка и проценты заданы корректно.

### D. Поднять всё в Docker
```bash
docker compose up -d --build
```
- **api**: http://localhost:3000
- **webapp** (прод): http://localhost:8080
- **db**: localhost:5432 (postgres/postgres)
- **redis**: localhost:6379

### E. Телеграм
1) В боте `/start` появится кнопка «Open WebApp».  
2) Авторизация происходит через `initData` (валидируется на бэке).  
3) Подключите кошелёк → создайте комнату → внесите ставку → commit-reveal → settle.

---

## Игры
- **RPS**: реализовано полностью (commit → reveal, bo3, 15 сек).
- **Дурак/Шашки/Шахматы**: роуты/сущности/экраны есть, логика в следующих релизах.

---

## Переменные окружения
См. `.env.example` (описано в комментариях).

---

## Скрипты
- `docker compose up -d db redis` — инфраструктура
- **Backend**: `npm run dev` (watch), `npm run start:prod`
- **WebApp**: `npm run dev` (Vite), `npm run build && npm run serve`
- **Contracts**: `npm run build`, `npm run deploy`

---

## Тесты
- Backend: unit для RPS commit-reveal, интеграционные e2e для deposit→match→settle (частично).
- Запуск: `cd backend && npm run test`

---

## Замечания безопасности
- Идемпотентность платёжных запросов, rate-limit, строгая валидация Telegram initData.
- Контракт защищён от повторных settle и несоответствий сумм.
- Все ходы/итоги — в Postgres; на чейне — только итог (resultHash + matchId).

---

## Roadmap
- v0.2: Дурак (подкидной/переводной) с валидатором, контроль 30 сек.
- v0.3: Шашки (обязательный бой) 5+0, Шахматы 3+2.
- Анти-коллюзия, расширенная админка, алерты, метрики.

