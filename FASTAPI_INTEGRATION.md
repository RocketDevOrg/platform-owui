# Интеграция FastAPI с Open WebUI

## Описание

Интеграция позволяет использовать FastAPI backend для генерации ответов чата вместо стандартных LLM API (OpenAI/Ollama). Open WebUI используется для авторизации, настроек и хранения чатов, а все запросы на генерацию ответов перенаправляются в FastAPI.

## Настройка

### Переменные окружения

Добавьте следующие переменные в `.env` файл:

```bash
# URL базового FastAPI backend
FASTAPI_BASE_URL=http://localhost:8000/api/v1

# URL для чата в FastAPI (если отличается от базового)
FASTAPI_CHAT_URL=http://localhost:8000/api/v1/chat/completions

# Примечание: USE_FASTAPI_FOR_CHAT больше не используется
# FastAPI теперь используется всегда, выбор модели отключен
```

**Важно:** В текущей версии FastAPI используется всегда для всех запросов чата. Опция выбора модели отключена. Старая логика работы с моделями закомментирована в коде для возможности восстановления.

### Формат ответа FastAPI

FastAPI должен возвращать ответы в формате OpenAI API:

#### Non-streaming ответ:
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "ответ от FastAPI"
    }
  }]
}
```

#### Streaming ответ (SSE):
```
data: {"choices": [{"delta": {"content": "часть"}}]}

data: {"choices": [{"delta": {"content": " ответа"}}]}

data: [DONE]
```

## API клиент для работы с черновиками

Создан API клиент в `src/lib/apis/severnaya/index.ts` для работы с эндпоинтами FastAPI:

- `ingestUrl(token, url)` - создание черновика по URL
- `ingestText(token, text)` - создание черновика по тексту
- `ingestFile(token, file)` - создание черновика по файлу
- `getDraft(token, draftId)` - получение черновика
- `updateDraft(token, draftId, finalData)` - обновление черновика
- `generateName(token, draftId)` - генерация названия товара
- `commitDraft(token, draftId)` - отправка черновика в 1С
- `searchAnalogs(token, options)` - поиск аналогов и дублей

### Использование на фронтенде

```typescript
import { ingestUrl, getDraft, updateDraft } from '$lib/apis/severnaya';

// Создание черновика
const response = await ingestUrl(token, 'https://example.com/product');

// Получение черновика
const draft = await getDraft(token, response.draft_id);

// Обновление черновика
const updated = await updateDraft(token, draft.id, {
  brand: 'New Brand',
  article: '12345'
});
```

## Виджеты

Виджеты для работы с черновиками находятся в `src/lib/components/severnaya/`:

- `DraftCard.svelte` - виджет черновика карточки товара
- `DuplicatesWidget.svelte` - виджет списка дублей/аналогов

## Архитектура

1. **Авторизация и настройки** - обрабатываются Open WebUI
2. **Хранение чатов** - сохраняются в БД Open WebUI
3. **Генерация ответов** - все запросы идут в FastAPI через `generate_fastapi_chat_completion()`

## Восстановление стандартной логики

Чтобы вернуться к стандартным LLM API с выбором моделей:

1. В файле `backend/open_webui/utils/chat.py` найдите функцию `generate_chat_completion`
2. Раскомментируйте закомментированный блок кода со стандартной логикой работы с моделями
3. Закомментируйте или удалите строки, которые всегда вызывают FastAPI
4. Установите переменную окружения `USE_FASTAPI_FOR_CHAT=false` (если используется проверка)

