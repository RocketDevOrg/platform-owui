# Мок-данные для разработки

## Текущее состояние

**ВКЛЮЧЕНО**: Мок-данные используются для разработки без backend.

## Как переключиться на реальный API

Когда контур будет доступен, выполните следующие шаги:

### 1. Отключить мок-данные

Откройте файл `src/lib/apis/severnaya/mock.ts` и измените:

```typescript
// Было:
export const USE_MOCK_DATA = true;

// Стало:
export const USE_MOCK_DATA = false;
```

### 2. Проверить настройки API

Убедитесь, что переменные окружения настроены правильно:

- `VITE_FASTAPI_BASE_URL` - базовый URL для FastAPI backend (по умолчанию: `http://localhost:8000/api/v1`)
- `VITE_FASTAPI_CHAT_URL` - URL для chat completions (по умолчанию: `${FASTAPI_BASE_URL}/chat/completions`)

### 3. Удалить мок-данные (опционально)

Если хотите полностью удалить мок-данные:

1. Удалите файл `src/lib/apis/severnaya/mock.ts`
2. Удалите импорты из `src/lib/apis/severnaya/index.ts`:
   - Удалите строки с импортом из `./mock`
   - Удалите проверки `if (USE_MOCK_DATA)` из всех функций

## Структура мок-данных

Мок-данные находятся в файле `src/lib/apis/severnaya/mock.ts`:

- `mockDraftCard` - пример черновика карточки товара
- `mockIngestUrlResponse` - мок-ответ для создания черновика по URL
- `mockIngestTextResponse` - мок-ответ для создания черновика по тексту
- `mockIngestFileResponse` - мок-ответ для создания черновика по файлу
- `mockGetDraftResponse` - мок-ответ для получения черновика
- `mockUpdateDraftResponse` - мок-ответ для обновления черновика
- `mockGenerateNameResponse` - мок-ответ для генерации названия
- `mockCommitDraftResponse` - мок-ответ для отправки в 1С
- `mockSearchAnalogsResponse` - мок-ответ для поиска аналогов
- `mockChatCompletionResponse` - мок-ответ для chat completions (`/chat/completions`)

### Особенности мок-ответа для chat completions

Мок-ответ для `generateFastAPIChatCompletion`:
- Поддерживает как streaming, так и non-streaming режимы
- Автоматически определяет, нужно ли создавать черновик (по ключевым словам или URL в сообщении)
- Возвращает виджет черновика в формате markdown code block с типом `widget`
- Имитирует задержку сети для более реалистичного тестирования

## Задержка запросов

Мок-функции имитируют сетевую задержку (800 мс) для более реалистичного тестирования UI.

## Логирование

При использовании мок-данных в консоли браузера будут видны сообщения с префиксом `[MOCK]` для отладки.

