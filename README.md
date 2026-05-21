# Baby Experience

Веб-приложение с рекомендациями вещей для мамы и новорождённого.

## Локальный запуск

1. Установить зависимости:

   ```bash
   npm install
   ```

2. Создать `.env` на основе `.env.example` и заполнить минимум:

   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/babyexperience"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="local-long-random-secret"
   ```

   `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` можно оставить пустыми: в текущем MVP социальный вход отключён feature flag.
   `BLOB_READ_WRITE_TOKEN` нужен только если загрузка изображений в админке должна идти через Vercel Blob. Без него сайт, публичные страницы и ручной ввод `imageUrl` продолжают работать.

3. Подготовить Prisma:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

   Seed наполняет базу стартовыми категориями, опубликованными вещами, примерами, комментариями, медиа-ассетами и примером сохранённого списка. Если нужно создать локального админа для входа по email/password, перед seed заполните:

   ```bash
   SEED_ADMIN_EMAIL="admin@example.com"
   SEED_ADMIN_PASSWORD="local-long-password"
   ```

   Публичная регистрация сохранена в кодовой базе для следующей версии, но в MVP скрыта feature flag. Роль `ADMIN` задаётся только через seed или прямое изменение записи в базе.

4. Запустить dev-сервер:

   ```bash
   npm run dev
   ```

## Публичный релиз на Vercel

Первая публичная версия рассчитана на Vercel-домен и Neon PostgreSQL. Публично доступны витрина сайта и отдельный вход в админку. Пользовательская регистрация, личный кабинет, комментарии, сохранённые списки и социальный вход остаются в кодовой базе, но скрыты feature flags до следующей версии.

### Что создать вручную

1. Vercel Project для этого репозитория.
2. Neon PostgreSQL database.
3. Vercel Blob Store в том же Vercel account/project, только если в MVP нужен production upload изображений из админки.

Реальные значения секретов не хранятся в репозитории. Их нужно добавить только в Vercel Project Settings → Environment Variables и, при необходимости, в локальный `.env`.

### Production env

Минимально обязательные runtime env для Vercel Production:

- `DATABASE_URL` — Neon connection string с `sslmode=require`.
- `NEXTAUTH_URL` — публичный URL приложения на Vercel, например `https://babyexperience.vercel.app`.
- `NEXTAUTH_SECRET` — длинный случайный секрет для NextAuth. Он нужен MVP, потому что `/admin` защищён NextAuth.

Обязательные env для первого admin setup, но не для runtime Vercel:

- `SEED_ADMIN_EMAIL` — email первого администратора.
- `SEED_ADMIN_PASSWORD` — пароль первого администратора.

Задайте их в shell перед `npm run prisma:seed`, направленным на production `DATABASE_URL`. Если не задать эти переменные, seed создаст стартовый контент, но admin-пользователь будет пропущен.

Опциональные env для текущего MVP:

- `BLOB_READ_WRITE_TOKEN` — нужен только если загрузка изображений из админки должна сохранять файлы в Vercel Blob. Без него публичная витрина, админка контента и ручной ввод `imageUrl` продолжают работать.

Сохранённые для следующей версии env:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

В текущем MVP Google OAuth отключён через `MVP_USER_FEATURES.socialLogin: false`, поэтому эти переменные не нужны для deploy и могут оставаться пустыми.

Сгенерировать `NEXTAUTH_SECRET` можно локально:

```bash
openssl rand -base64 32
```

### Google OAuth callback

Этот шаг не нужен для текущего MVP. Когда социальный вход вернётся в публичный сценарий, в Google Cloud Console нужно будет добавить Authorized redirect URI для Vercel-домена:

```text
https://your-vercel-domain.vercel.app/api/auth/callback/google
```

Для локальной разработки можно также оставить:

```text
http://localhost:3000/api/auth/callback/google
```

### Vercel настройки

Vercel должен auto-detect framework как Next.js.

- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: оставить пустым / framework default
- Node.js Version: используйте поддерживаемую Vercel версию Node.js 22.x или 24.x; не используйте 18.x для production deploy.

`postinstall` запускает `prisma generate`, поэтому Prisma Client будет сгенерирован во время deploy. Миграции не запускаются автоматически в build step: их нужно выполнить отдельной командой после подключения production `DATABASE_URL`.

### Порядок первого production setup

1. Создать Neon database и скопировать production `DATABASE_URL` с `sslmode=require`.
2. Создать Vercel Project.
3. Добавить минимальные MVP runtime env в Vercel Project Settings: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.
4. Если нужен production upload из админки, создать Vercel Blob Store и добавить `BLOB_READ_WRITE_TOKEN`.
5. Задеплоить проект на Vercel.
6. Выполнить миграции против production Neon:

   ```bash
   npm run prisma:migrate:deploy
   ```

7. Запустить seed/admin setup против production Neon:

   ```bash
   npm run prisma:seed
   ```

8. Открыть Vercel URL и пройти MVP production smoke test ниже.

Для команд из пунктов 6-7 нужен shell, где `DATABASE_URL`, `SEED_ADMIN_EMAIL` и `SEED_ADMIN_PASSWORD` указывают на production Neon и production admin. Не коммитьте эти значения.

Seed можно запускать повторно: он использует `upsert` для стартовых категорий, вещей, примеров, комментариев, медиа-ассетов, стартового списка и admin-пользователя. Связи seed-вещей с seed-категориями и seed-списком пересобираются идемпотентно.

### MVP production smoke test

1. Открыть главную страницу Vercel-домена.
2. Открыть страницу категории.
3. Открыть карточку опубликованной вещи.
4. Проверить, что `DRAFT` и `ARCHIVED` вещи не открываются публично и не видны в категориях.
5. Открыть `/login` и войти production admin-аккаунтом, созданным через `SEED_ADMIN_EMAIL` и `SEED_ADMIN_PASSWORD`.
6. Проверить, что `/admin` доступен только пользователю с ролью `ADMIN`.
7. В админке создать новую вещь, убедиться, что она стартует как `DRAFT`, затем опубликовать.
8. Если задан `BLOB_READ_WRITE_TOKEN`, загрузить изображение в админке через Vercel Blob и сохранить Blob URL в примере вещи.
9. Проверить, что `/dashboard` редиректит на главную: пользовательский кабинет скрыт в MVP.

### Troubleshooting

- `DATABASE_URL`: для Neon используйте production connection string, проверьте `sslmode=require`, имя базы и пароль. Если миграции не применяются, сначала выполните `npm run prisma:generate`, затем `npm run prisma:migrate:deploy`.
- `NEXTAUTH_URL`: значение должно точно совпадать с публичным Vercel URL без trailing slash, например `https://babyexperience.vercel.app`.
- `NEXTAUTH_SECRET`: должен быть задан в Vercel Production env; без него auth-сессии в production будут нестабильны.
- Google callback: для текущего MVP не настраивается. Он понадобится, когда `MVP_USER_FEATURES.socialLogin` будет включён для следующей версии.
- Blob token: если production upload должен работать через Vercel Blob, проверьте, что Blob Store создан, `BLOB_READ_WRITE_TOKEN` добавлен в Vercel Production env, и после добавления env сделан redeploy.
- Admin seed: если `/admin` недоступен, проверьте, что `SEED_ADMIN_EMAIL` и `SEED_ADMIN_PASSWORD` были заданы в shell перед `npm run prisma:seed`, а пользователь входит именно этим email/password.

`npm run build` должен проходить без Google OAuth keys и без `BLOB_READ_WRITE_TOKEN`. Для минимального MVP deploy нужны только Neon/Vercel значения из обязательного набора.

## Загрузка изображений через Vercel Blob

Администратор может загрузить одно изображение для примера вещи на странице редактирования вещи в блоке “Примеры вещей”. Upload принимает JPEG, PNG, WebP и GIF до 4.5 MB. Если задан `BLOB_READ_WRITE_TOKEN`, файл сохраняется в Vercel Blob; без токена остаётся ручной ввод `imageUrl` как production-safe fallback.

После успешной загрузки URL автоматически подставляется в поле `Image URL`; пример всё равно сохраняется обычной кнопкой “Создать” или “Сохранить”. Ручной `Image URL` остаётся fallback-сценарием.

Если `BLOB_READ_WRITE_TOKEN` не задан, приложение не падает: production upload не использует Vercel Blob, а остальной сайт, админка контента и ручной ввод `imageUrl` продолжают работать.

## Проверка авторизации

В текущем MVP публичная регистрация, обычный user-login, Google OAuth и `/dashboard` скрыты feature flags.

1. Создайте администратора через `SEED_ADMIN_EMAIL` и `SEED_ADMIN_PASSWORD`, запустите `npm run prisma:seed`, войдите этим аккаунтом на `/login` и откройте `/admin`.
2. Проверьте, что гость при открытии `/admin` попадает на `/login`.
3. Проверьте, что `/dashboard` редиректит на главную.
4. `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` можно оставить пустыми: кнопка Google не входит в MVP-сценарий.

## Проверка комментариев

Комментарии относятся к следующей публичной user-версии и в текущем MVP скрыты feature flags. Для MVP production env не нужно добавлять отдельные переменные под этот сценарий.

## Проверка админки контента

Админка доступна по `/admin` только пользователю с ролью `ADMIN`. Локального администратора можно создать через seed: перед `npm run prisma:seed` задайте `SEED_ADMIN_EMAIL` и `SEED_ADMIN_PASSWORD`, затем войдите на `/login` этим email/password.

1. Откройте `/admin`: на обзоре должны быть счётчики категорий, вещей, черновиков, архива и комментариев.
2. Откройте `/admin/categories/new`, создайте категорию, затем отредактируйте `name`, `slug`, `description`, `hero`, `accent`, `order` на странице категории.
3. Попробуйте удалить категорию с привязанными вещами: админка должна показать ошибку. Категория без вещей удаляется.
4. Откройте `/admin/items/new`, создайте вещь с одной или несколькими категориями. Новая вещь всегда создаётся в статусе `DRAFT`.
5. Проверьте, что `DRAFT` вещь не открывается публично по `/items/:slug`.
6. На странице редактирования вещи нажмите “Опубликовать”: вещь со статусом `PUBLISHED` должна появиться на публичной странице и в своей категории.
7. Нажмите “Архивировать”: вещь со статусом `ARCHIVED` должна снова пропасть из публичных страниц.
8. В блоке “Примеры вещей” добавьте пример с `kind = IMAGE`: можно вручную заполнить `imageUrl` или выбрать файл в “Загрузить изображение”. После upload Blob URL подставится в `Image URL`; для `LINK` нужен `url`, для `BOTH` нужны оба поля.
9. Откройте `/admin/comments` и проверьте кнопки “Скрыть” / “Показать”.
10. Гость при открытии `/admin` должен попадать на `/login`; не-admin пользовательский сценарий скрыт в MVP.

## Проверка сохранённых списков

Сохранённые списки относятся к следующей публичной user-версии и в текущем MVP скрыты feature flags. Для MVP production env не нужно добавлять отдельные переменные под этот сценарий.

## Что уже есть

- Публичная главная страница с категориями и подборкой вещей.
- Страницы категорий и карточек вещей.
- Отдельный вход в админку по email/password.
- Защищённая `/admin` с проверкой роли `ADMIN`.
- Регистрация, обычный user-login, Google OAuth, `/dashboard`, комментарии и сохранённые списки сохранены в кодовой базе, но скрыты для MVP.
- Простая рабочая админка для категорий, вещей, примеров вещей, статусов публикации и модерации комментариев.
- Prisma-схема под PostgreSQL, пользователей, категории, вещи, примеры, комментарии и сохранённые списки.

## Что нужно получить для production запуска

1. Vercel Project URL вида `https://your-vercel-domain.vercel.app`.
2. Neon `DATABASE_URL` с `sslmode=require`.
3. `NEXTAUTH_SECRET`, сгенерированный для production.
4. `SEED_ADMIN_EMAIL` и `SEED_ADMIN_PASSWORD` для первого admin-пользователя в seed shell.
5. Vercel Blob `BLOB_READ_WRITE_TOKEN`, только если включаем production upload из админки.
6. Google OAuth `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` не нужны для MVP и сохранены для следующей версии.

## Основная модель

- `User` с ролью `USER` или `ADMIN`.
- `Category` для разделения сценариев.
- `Category.hero` для короткого публичного заголовка раздела.
- `Item` для каждой рекомендации.
- `Item.tags` и `Item.featured` для тегов и подборки на главной.
- `ItemExample` для ссылки и/или фотографии конкретной вещи.
- `Comment` для обсуждений.
- `SavedList` и `SavedItem` для личных подборок.
