# Документация изменений: Интеграция FastAPI с Open WebUI

## Обзор

Данный документ описывает все изменения, внесенные в чистый Open WebUI для интеграции с FastAPI backend и добавления функциональности работы с черновиками карточек товаров и поиска аналогов.

## Архитектурные отличия

### 1. Двухуровневая архитектура

**Исходная архитектура Open WebUI:**
```
Frontend (Svelte) → Backend (FastAPI/Open WebUI) → LLM API (OpenAI/Ollama)
```

**Новая архитектура:**
```
Frontend (Svelte) → Backend (Open WebUI) → FastAPI Backend → LLM/Бизнес-логика
                    ↓
              (Авторизация, чаты, настройки)
```

### 2. Разделение ответственности

**Open WebUI сохраняет:**
- Авторизацию и управление пользователями
- Хранение чатов и сообщений в БД
- UI/UX компоненты и интерфейс
- Настройки пользователей
- Управление файлами (частично)

**FastAPI Backend обрабатывает:**
- Генерацию ответов чата
- Создание и управление черновиками карточек товаров
- Поиск аналогов и дублей
- Бизнес-логику работы с товарами
- Интеграцию с 1С

### 3. Прямое обращение к FastAPI

Для чата реализовано **двойное обращение**:
- **Через бэкенд Open WebUI** (`backend/open_webui/utils/chat.py`) - для стандартных запросов
- **Напрямую с фронтенда** (`src/lib/apis/severnaya/index.ts`) - для специальных действий (создание карточки, поиск аналогов)

## Сложность сохранения основного функционала Open WebUI

### Проблемы и решения

#### 1. **Обход системы моделей**

**Проблема:** Open WebUI построен вокруг концепции "моделей" (LLM), которые загружаются, проверяются на доступность и используются для генерации ответов.

**Решение:**
- Закомментирована загрузка моделей в `backend/open_webui/main.py` (строки 1530-1534)
- Создается фиктивная модель `{"id": "fastapi", "name": "FastAPI"}` для совместимости с остальным кодом
- Закомментирована проверка существования модели (строки 1555-1576)
- Закомментирована проверка доступа к модели (строки 1564-1576)

**Сложность:** ⭐⭐⭐⭐ (Высокая)
- Требовалось найти все места, где происходит проверка моделей
- Необходимо было сохранить совместимость с кодом, который ожидает объект модели
- Риск поломки других функций, зависящих от системы моделей

#### 2. **Обработка ошибок "Model not found"**

**Проблема:** При обходе проверки моделей возникали ошибки "Model not found", которые отображались пользователю.

**Решение:**
- В `backend/open_webui/main.py` создается фиктивная модель
- В `src/lib/components/chat/Chat.svelte` добавлена фильтрация ошибок:
  - `chatCompletedHandler` - игнорирует ошибки "Model not found"
  - `sendMessageSocket` - проверяет и игнорирует ошибки в catch блоке
  - `handleOpenAIError` - фильтрует ошибки перед показом toast

**Сложность:** ⭐⭐⭐ (Средняя)
- Необходимо было найти все места обработки ошибок
- Важно было не скрыть реальные ошибки FastAPI

#### 3. **Сохранение формата ответов**

**Проблема:** Open WebUI ожидает ответы в формате OpenAI API (streaming и non-streaming).

**Решение:**
- FastAPI должен возвращать ответы в формате OpenAI API
- В `backend/open_webui/utils/chat.py` функция `generate_fastapi_chat_completion` преобразует ответы FastAPI в нужный формат
- Поддержка как streaming (SSE), так и non-streaming ответов

**Сложность:** ⭐⭐ (Низкая-Средняя)
- Требуется соответствие формату OpenAI API
- Необходимо правильно обрабатывать streaming ответы

#### 4. **Интеграция с системой файлов**

**Проблема:** Open WebUI имеет свою систему загрузки и обработки файлов, которая требует конфигурацию `DOCUMENT_INTELLIGENCE_MODEL`.

**Решение:**
- При выборе действия "Создать карточку" файлы не проходят через стандартную обработку Open WebUI
- Файлы сохраняются как `File` объекты и отправляются напрямую в FastAPI через FormData
- В `src/lib/components/chat/MessageInput.svelte` добавлена логика обхода стандартной загрузки файлов

**Сложность:** ⭐⭐⭐⭐ (Высокая)
- Необходимо было понять поток обработки файлов в Open WebUI
- Важно было сохранить функциональность для обычных чатов
- Требовалось правильно сохранять `File` объекты для последующей отправки

#### 5. **Сохранение чатов в БД Open WebUI**

**Проблема:** Сообщения с виджетами должны сохраняться в БД Open WebUI для истории чатов.

**Решение:**
- Виджеты встраиваются в markdown сообщения как code blocks с `lang="widget"`
- В `src/lib/components/chat/Messages/CodeBlock.svelte` добавлена обработка виджетов
- Виджеты рендерятся как обычные компоненты Svelte внутри сообщений

**Сложность:** ⭐⭐⭐ (Средняя)
- Необходимо было найти правильное место для рендеринга виджетов
- Важно было сохранить совместимость с существующими code blocks

## Ключевые отличия соединения с FastAPI

### 1. Два пути обращения к FastAPI

#### Путь 1: Через бэкенд Open WebUI (стандартный чат)

**Файл:** `backend/open_webui/utils/chat.py`

```python
async def generate_fastapi_chat_completion(
    request: Request,
    form_data: dict,
    user: Any,
):
    # Подготовка payload для FastAPI (в формате OpenAI API)
    payload = {
        "messages": form_data.get("messages", []),
        "model": form_data.get("model", ""),
        "stream": stream,
    }
    
    # Прокидываем токен авторизации
    headers = {
        "Content-Type": "application/json",
        "authorization": request.headers.get("authorization")
    }
    
    # Отправка в FastAPI
    async with session.post(FASTAPI_CHAT_URL, json=payload, headers=headers) as response:
        # Обработка ответа...
```

**Особенности:**
- Все запросы проходят через бэкенд Open WebUI
- Авторизация обрабатывается Open WebUI
- Метаданные (user_id, chat_id, message_id) передаются в FastAPI
- Поддержка streaming и non-streaming ответов

#### Путь 2: Напрямую с фронтенда (специальные действия)

**Файл:** `src/lib/apis/severnaya/index.ts`

```typescript
export const generateFastAPIChatCompletion = async (
    token: string,
    body: {
        messages: Array<any>;
        model?: string;
        stream?: boolean;
        params?: Record<string, any>;
        metadata?: {...};
    }
): Promise<Response> => {
    const response = await fetch(FASTAPI_CHAT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    return response;
};
```

**Особенности:**
- Прямое обращение к FastAPI, минуя бэкенд Open WebUI
- Используется для специальных действий (создание карточки, поиск аналогов)
- Токен передается напрямую с фронтенда

### 2. Отправка FormData для специальных действий

**Файл:** `src/lib/components/chat/Chat.svelte`

При выборе действия "Создать карточку" или "Поиск аналогов":

```typescript
if (actionType === 'ingest' || actionType === 'search') {
    const userMessageContent = userMessage?.content || '';
    const file = userMessage?.files?.find(...)?.file;
    
    if (actionType === 'ingest') {
        // Отправка FormData на /ingest
        const response = await ingestWithFormData(token, userMessageContent, file);
        // Создание виджета в ответе
    } else if (actionType === 'search') {
        // Отправка FormData на /search/analogs
        const response = await searchAnalogsWithFormData(token, userMessageContent, file);
    }
}
```

**Особенности:**
- Текст и файл отправляются вместе в одной FormData
- Разные эндпоинты для разных действий
- Виджеты создаются программно в streaming ответе

### 3. Мок-данные для разработки

**Файл:** `src/lib/apis/severnaya/mock.ts`

Реализована система мок-данных для разработки без backend:

```typescript
export const USE_MOCK_DATA = false; // Флаг для переключения

export const mockIngestUrlResponse = async (url: string): Promise<IngestResponse> => {
    await delay(MOCK_DELAY);
    return {
        draft_id: mockDraftCard.id,
        status: 'new',
        source_type: 'url',
        source_payload: url
    };
};
```

**Особенности:**
- Все API функции проверяют `USE_MOCK_DATA` флаг
- Мок-данные возвращают реалистичные ответы с задержкой
- Легко переключиться на реальный API, установив флаг в `false`

## Виджеты

### 1. Виджет создания карточки (DraftCard)

**Файл:** `src/lib/components/severnaya/DraftCard.svelte`

#### Функциональность

Виджет отображает черновик карточки товара с возможностью редактирования и отправки в 1С.

**Основные компоненты:**
- **ImageSlider** - слайдер изображений товара (Swiper.js)
- **FormField** - поля формы для редактирования данных
- **Button** - кнопки действий

**Поля формы:**
- Название товара (с кнопкой генерации)
- Источник
- Вид номенклатуры
- Тип / категория
- Бренд / производитель
- Артикул

**Действия:**
- **Генерация названия** (`onGenerateTitle`) - вызывает API `generateName`
- **Сохранение изменений** (`onSave`) - вызывает API `updateDraft`
- **Отправка в 1С** (`onSendTo1C`) - вызывает API `commitDraft`

#### Интеграция в чат

**Файл:** `src/lib/components/chat/Messages/CodeBlock.svelte`

Виджет встраивается в сообщения через markdown code block:

```markdown
```widget
{
  "type": "widget",
  "widget_type": "draft",
  "widget_data": {
    "draft": { "id": "draft_id" },
    "meta": {
      "can_edit": true,
      "can_commit": true,
      "source_label": "Файл",
      "created_at": "2025-01-15T10:30:00Z"
    }
  }
}
```
```

**Обработка:**
1. `CodeBlock.svelte` проверяет `lang === 'widget'`
2. Парсит JSON из code block
3. Загружает данные черновика через API `getDraft`
4. Рендерит компонент `DraftCard` с данными

**Особенности:**
- Виджет загружается асинхронно после рендеринга сообщения
- Обработка ошибок загрузки данных
- Поддержка редактирования и сохранения изменений
- Интеграция с API для всех действий

### 2. Виджет поиска аналогов (DuplicatesWidget)

**Файл:** `src/lib/components/severnaya/DuplicatesWidget.svelte`

#### Функциональность

Виджет отображает список найденных аналогов и дублей товара.

**Основные компоненты:**
- **DuplicateCard** - карточка отдельного аналога/дубля
- **FormField** - поле поиска по тексту
- **Button** - кнопки действий

**Функции:**
- **Обновление по черновику** (`onRefreshByDraft`) - вызывает API `searchAnalogs` с `draft_id`
- **Поиск по тексту** (`onSearchByText`) - вызывает API `searchAnalogs` с текстовым запросом
- **Пагинация** - отображение результатов постранично

**Отображаемая информация:**
- Название товара
- Тип совпадения (duplicate/analog/related)
- Score (степень совпадения)
- Изображение товара (если есть)

#### Интеграция в чат

Виджет может быть встроен в сообщения аналогично `DraftCard`, но в текущей реализации результаты поиска отображаются как текстовый список в streaming ответе.

**Планируемая интеграция:**
- Встраивание через markdown code block с `lang="widget"` и `widget_type="duplicates"`
- Асинхронная загрузка данных
- Интерактивные действия (обновление, поиск)

## API клиент для работы с черновиками

**Файл:** `src/lib/apis/severnaya/index.ts`

### Основные функции

#### 1. Создание черновиков

```typescript
// По URL
ingestUrl(token: string, url: string): Promise<IngestResponse>

// По тексту
ingestText(token: string, text: string): Promise<IngestResponse>

// По файлу
ingestFile(token: string, file: File): Promise<IngestResponse>

// По тексту и файлу (FormData)
ingestWithFormData(token: string, text: string, file?: File): Promise<IngestResponse>
```

#### 2. Управление черновиками

```typescript
// Получение черновика
getDraft(token: string, draftId: string): Promise<DraftCard>

// Обновление черновика
updateDraft(token: string, draftId: string, finalData: Record<string, any>): Promise<DraftCard>

// Генерация названия
generateName(token: string, draftId: string): Promise<GenerateNameResponse>

// Отправка в 1С
commitDraft(token: string, draftId: string): Promise<{ status: string }>
```

#### 3. Поиск аналогов

```typescript
// Поиск с опциями
searchAnalogs(token: string, options: {
    draft_id?: string;
    query?: string;
    file?: File;
}): Promise<SearchAnalogsResponse>

// Поиск с FormData (текст + файл)
searchAnalogsWithFormData(token: string, text: string, file?: File): Promise<SearchAnalogsResponse>
```

### Особенности реализации

1. **Единая точка конфигурации:**
   - `FASTAPI_BASE_URL` - базовый URL FastAPI
   - `FASTAPI_CHAT_URL` - URL для чата
   - Настраивается через переменные окружения

2. **Обработка ошибок:**
   - Все функции обрабатывают ошибки HTTP
   - Возвращают понятные сообщения об ошибках
   - Логирование ошибок в консоль

3. **Поддержка мок-данных:**
   - Все функции проверяют `USE_MOCK_DATA` флаг
   - Легко переключиться между мок и реальным API

## Изменения в UI/UX

### 1. Радиогруппа действий в MessageInput

**Файл:** `src/lib/components/chat/MessageInput.svelte`

Добавлена радиогруппа для выбора действия:
- **Создать карточку** (`actionType = 'ingest'`)
- **Поиск аналогов** (`actionType = 'search'`)

**Особенности:**
- Визуальная индикация выбранного действия
- Отображение только при выборе специального действия
- Сохранение выбранного действия в состоянии компонента

### 2. Обработка файлов для специальных действий

**Файл:** `src/lib/components/chat/MessageInput.svelte`

При выборе действия "Создать карточку" или "Поиск аналогов":
- Файлы не проходят через стандартную обработку Open WebUI
- Файлы сохраняются как `File` объекты
- Файлы отправляются напрямую в FastAPI через FormData

### 3. Брендинг

**Изменения:**
- `APP_NAME` изменен с "Open WebUI" на "Северная ИИ"
- Обновлены заголовки страниц
- Обновлены уведомления
- Обновлен сайдбар

**Файлы:**
- `src/lib/constants.ts` - изменение `APP_NAME`
- `src/routes/+layout.svelte` - обновление уведомлений
- `src/lib/components/channel/Channel.svelte` - обновление заголовков каналов
- `src/app.html` - обновление базового заголовка

## Отключенные функции

### 1. Временный чат (Temporary Chat)

**Причина:** Не используется в текущей реализации

**Изменения:**
- Добавлен `false &&` к условиям отображения элементов временного чата
- Отключена логика сохранения временных чатов

**Файлы:**
- `src/lib/components/chat/Chat.svelte`
- `src/lib/components/chat/Navbar.svelte`
- `src/routes/(app)/+layout.svelte`
- `src/lib/components/chat/ChatPlaceholder.svelte`
- `src/lib/components/chat/Placeholder.svelte`

### 2. Кнопка диктовки

**Причина:** Не используется в текущей реализации

**Изменения:**
- Заменен HTML комментарий на Svelte `{#if false}` блок

**Файл:** `src/lib/components/chat/MessageInput.svelte`

### 3. Уведомления об обновлении версии

**Причина:** Не нужны в текущей реализации

**Изменения:**
- Добавлен `false &&` к условию отображения `UpdateInfoToast`

**Файл:** `src/routes/(app)/+layout.svelte`

## Технические детали

### Формат данных виджетов

Виджеты передаются в сообщениях через markdown code blocks:

```json
{
  "type": "widget",
  "widget_type": "draft" | "duplicates",
  "widget_data": {
    "draft": {
      "id": "string",
      "status": "string",
      "final_data": {...}
    },
    "meta": {
      "can_edit": boolean,
      "can_commit": boolean,
      "source_label": "string",
      "created_at": "ISO 8601 string"
    }
  }
}
```

### Streaming ответы

Для создания виджетов в streaming ответах используется `ReadableStream`:

```typescript
const stream = new ReadableStream({
    async start(controller) {
        const encoder = new TextEncoder();
        // Отправка текста
        controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Текст' } }] })}\n\n`)
        );
        // Отправка виджета
        controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: widgetMarkdown } }] })}\n\n`)
        );
        // Завершение
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
    }
});
```

### Обработка ошибок

Все API вызовы обрабатывают ошибки:

```typescript
try {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: await response.text() }));
        throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
    }
    return await response.json();
} catch (err) {
    console.error('Error:', err);
    throw err;
}
```

## Восстановление стандартной функциональности

Для возврата к стандартной логике Open WebUI:

1. **Восстановление работы с моделями:**
   - В `backend/open_webui/main.py` раскомментировать загрузку моделей
   - Раскомментировать проверку моделей
   - Удалить создание фиктивной модели

2. **Восстановление стандартного чата:**
   - В `backend/open_webui/utils/chat.py` раскомментировать стандартную логику в `generate_chat_completion`
   - Закомментировать вызов `generate_fastapi_chat_completion`

3. **Удаление специальных действий:**
   - Удалить радиогруппу действий из `MessageInput.svelte`
   - Удалить логику обработки `actionType` из `Chat.svelte`
   - Удалить API функции из `severnaya/index.ts` (или оставить для других целей)

## Onboarding Overlay (Оверлей первой сессии)

**Файл:** `src/lib/components/severnaya/OnboardingOverlay.svelte`

### Описание

Интерактивный оверлей для обучения пользователей при первом входе в систему. Показывает два варианта использования системы и пример виджета карточки товара.

### Функциональность

#### Два шага обучения:

1. **Шаг 1: Варианты использования**
   - Описание действия "Создать карточку" с инструкциями
   - Описание действия "Поиск аналогов" с инструкциями
   - Визуальная индикация выбора действия в поле ввода

2. **Шаг 2: Пример виджета**
   - Демонстрация виджета `DraftCard` с моковыми данными
   - Рабочая кнопка генерации названия (с анимацией загрузки)
   - Описание функций виджета (генерация названия, редактирование, отправка в 1С)

#### Особенности:

- **Моковые изображения** - используются изображения из `static/assets/images/` (adam.jpg, earth.jpg, galaxy.jpg)
- **Интерактивность** - демонстрация генерации названия с имитацией загрузки
- **Навигация** - кнопки "Назад", "Далее", "Пропустить", "Начать работу"
- **Индикатор шагов** - визуальные точки показывают текущий шаг

### Механизм показа

**Файл:** `src/lib/components/severnaya/OnboardingOverlay.svelte`

```typescript
// Флаг для продакшена
const SHOW_ALWAYS = false; // false = показывать только при первом показе

// Привязка к пользователю
export let userId: string | null = null;

// Логика показа
if (userId) {
    const storageKey = `severnaya_onboarding_seen_${userId}`;
    const hasSeenOnboarding = localStorage.getItem(storageKey);
    if (!hasSeenOnboarding) {
        showOverlay = true;
    }
}
```

**Особенности:**
- Показывается только один раз при первом логине пользователя
- Использует localStorage с привязкой к `userId` для отслеживания показа
- Ключ в localStorage: `severnaya_onboarding_seen_${userId}`
- При закрытии оверлея флаг сохраняется, и оверлей больше не показывается

### Интеграция

**Файл:** `src/lib/components/chat/Chat.svelte`

```svelte
<OnboardingOverlay userId={$user?.id || null} />
```

Оверлей интегрирован в компонент `Chat.svelte` и показывается при загрузке чата, если пользователь еще не видел его.

### Тестирование

Для тестирования можно установить `SHOW_ALWAYS = true` в `OnboardingOverlay.svelte`, чтобы оверлей показывался всегда.

### Восстановление показа

Для сброса показа оверлея для конкретного пользователя нужно удалить ключ из localStorage:
```javascript
localStorage.removeItem(`severnaya_onboarding_seen_${userId}`);
```

## Заключение

Интеграция FastAPI с Open WebUI потребовала значительных изменений в архитектуре, но при этом удалось сохранить основной функционал Open WebUI:

✅ **Сохранено:**
- Авторизация и управление пользователями
- Хранение чатов и сообщений
- UI/UX компоненты
- Настройки пользователей
- Система файлов (для обычных чатов)

✅ **Добавлено:**
- Интеграция с FastAPI для генерации ответов
- Виджеты для работы с черновиками
- API клиент для работы с черновиками
- Специальные действия (создание карточки, поиск аналогов)
- Мок-данные для разработки

⚠️ **Требует внимания:**
- Система моделей полностью обойдена (может повлиять на другие функции)
- Обработка ошибок "Model not found" скрывает некоторые ошибки
- Формат ответов FastAPI должен соответствовать OpenAI API

**Сложность интеграции:** ⭐⭐⭐⭐ (Высокая)

Основная сложность заключалась в обходе системы моделей Open WebUI при сохранении совместимости с остальным кодом, а также в интеграции виджетов в систему сообщений.

