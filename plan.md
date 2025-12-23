# Реализация Draft Widget для OpenWebUI

## Цель

Создать виджет для отображения и редактирования черновика карточки товара, который интегрируется с backend API через Tool функции OpenWebUI и рендерится через Svelte компоненты.

## Архитектура решения

### 1. Backend Tool функции (Python)

Создать Python Tool модуль `procurement_api` с функциями:

- `ingest_url(url: str)` - создание черновика по ссылке
- `update_draft(draft_id: str, final_data: dict)` - обновление черновика
- `generate_name(draft_id: str)` - генерация названия товара
- `commit_draft(draft_id: str)` - отправка черновика в 1С
- `search_analogs(draft_id: str, query: str = None)` - поиск аналогов

Tool функции будут вызывать backend API (`http://backend:8001/api/v1/...`) и возвращать JSON с данными виджета.

### 2. Frontend компоненты (Svelte)

Создать компоненты:

- `DraftWidget.svelte` - основной компонент виджета
- `DraftWidgetSkeleton.svelte` - состояние загрузки
- Интеграция в систему рендеринга сообщений

### 3. Интеграция в систему сообщений

Расширить Markdown рендеринг для поддержки специальных токенов виджетов или использовать механизм embeds.

## План реализации

### Этап 1: Backend Tool функции

1. Создать Python модуль `procurement_api.py` в структуре Tools OpenWebUI
2. Реализовать функции для работы с backend API
3. Настроить обработку ответов и ошибок
4. Добавить конфигурацию для URL backend и токена

### Этап 2: Frontend компонент DraftWidget

1. Создать `src/lib/components/severnaya/DraftWidget.svelte`
2. Реализовать структуру UI согласно спецификации:

   - Заголовок с названием и статусом
   - Блок основных реквизитов (kind, type, brand, article)
   - Блок описания (description)
   - Блок характеристик (specs) - read-only для MVP
   - Блок прогнозов (GAU, duplicates_count)
   - Панель действий (кнопки)

3. Реализовать состояния: loading, error, success
4. Добавить Skeleton компонент

### Этап 3: Интеграция в рендеринг сообщений

1. Расширить `MarkdownTokens.svelte` для обработки специальных токенов виджетов
2. Или использовать механизм embeds для встраивания виджетов
3. Настроить передачу JSON данных от Tool функций к компонентам

### Этап 4: Интерактивность

1. Реализовать обработчики действий (кнопки)
2. Интегрировать вызовы Tool функций через API
3. Реализовать обновление виджета после действий
4. Добавить обработку ошибок и toast-уведомления

### Этап 5: Стилизация

1. Применить Tailwind CSS классы согласно спецификации
2. Реализовать адаптивность (мобильная/десктоп версии)
3. Поддержка темной темы
4. Реализовать компоненты дизайн-системы (Badge, Button, Form controls)

## Файлы для создания/изменения

### Backend:

- `backend/open_webui/tools/procurement_api.py` (новый файл)

### Frontend:

- `src/lib/components/severnaya/DraftWidget.svelte` (новый)
- `src/lib/components/severnaya/DraftWidgetSkeleton.svelte` (новый)
- `src/lib/components/severnaya/widgets.ts` (новый - утилиты)
- `src/lib/components/chat/Messages/Markdown/MarkdownTokens.svelte` (изменить - добавить обработку виджетов)
- `src/lib/apis/severnaya.ts` (новый - API клиент для вызова Tool функций)

## Детали реализации

### Tool функция - пример структуры:

```python
async def ingest_url(url: str, __request__: Request = None) -> dict:
    """Создает черновик карточки товара по URL"""
    # HTTP запрос к backend API
    # Возврат JSON с widget_data
```

### Компонент DraftWidget - основные пропсы:

- `draftData: DraftCard` - данные черновика
- `onUpdate: Function` - callback для обновления
- `onAction: Function` - callback для действий

### Интеграция в Markdown:

Использовать специальный формат в ответе Tool функции:

```json
{
  "widget_type": "draft",
  "widget_data": { ... },
  "message": "Черновик создан"
}
```

И обработать в `MarkdownTokens.svelte` как новый тип токена.