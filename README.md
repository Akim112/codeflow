## CodeFlow

Онлайн-сервис для изучения программирования с элементами геймификации.

## Структура репозитория

- **frontend/** — SPA (React, TypeScript, Vite)
- **backend/** — API (ASP.NET Core 8, C#)
- **.github/workflows/** — CI (frontend и backend)
- **docker-compose.yml** — PostgreSQL + API для локального запуска

## Требования

- Node.js 20+ (для frontend)
- .NET 8 SDK (для backend)
- Docker и Docker Compose (опционально, для БД и API)

## Быстрый запуск

- **1. БД и Backend**

```bash
docker-compose up -d
```

- **Или по отдельности:**
- **2. База данных (PostgreSQL)**
  - Через Docker:

```bash
docker-compose up -d postgres
```



- **3. Backend (API)**

```bash
cd backend
dotnet restore
dotnet run --project CodeFlow.Api
```

API: `http://localhost:5001`, Swagger: `http://localhost:5001/swagger`.

- **3. Frontend**

```bash
cd frontend
npm install
npm run dev
```

Фронт: `http://localhost:5173`.

## Тесты

```bash
# Backend (xUnit)
cd backend
dotnet test

# Frontend (Vitest)
cd frontend
npm test
```

## Что сейчас сделано

- **Фронтенд**
  - SPA на React + TypeScript + Vite.
  - Экран курса и урока, редактор кода, JWT-авторизация.
  - Проверка Python-кода выполняется на бэкенде; геймификация (XP, прогресс, достижения, магазин) синхронизируется с API.

- **Бэкенд**
  - ASP.NET Core 8 API, PostgreSQL (EF Core), JWT‑аутентификация.
  - Курсы, уроки, прогресс, рейтинг, достижения, фракции, магазин, уведомления.
  - Роли `User/Teacher/Admin`, админ‑эндпоинты для курсов, уроков и пользователей.
  - Проверка Python‑кода: синхронно и асинхронно через очередь и фоновый воркер.
  - Экспорт отчётов по прогрессу и рейтингу в CSV и PDF.
