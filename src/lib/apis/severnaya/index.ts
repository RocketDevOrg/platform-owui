import { WEBUI_API_BASE_URL } from '$lib/constants';
import {
	USE_MOCK_DATA,
	mockIngestUrlResponse,
	mockIngestTextResponse,
	mockIngestFileResponse,
	mockGetDraftResponse,
	mockUpdateDraftResponse,
	mockGenerateNameResponse,
	mockCommitDraftResponse,
	mockSearchAnalogsResponse,
	mockChatCompletionResponse
} from './mock';

// Базовый URL для FastAPI backend (можно переопределить через переменную окружения)
const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL || 'http://localhost:8000/api/v1';
const FASTAPI_CHAT_URL = import.meta.env.VITE_FASTAPI_CHAT_URL || `${FASTAPI_BASE_URL}/chat/completions`;

/**
 * ВАЖНО: Мок-данные для разработки
 * 
 * Когда контур будет доступен:
 * 1. Установите USE_MOCK_DATA = false в mock.ts
 * 2. Все функции автоматически переключатся на реальные API-вызовы
 * 3. Можно удалить файл mock.ts или оставить для тестирования
 */

export interface DraftCard {
	id: string;
	status: 'new' | 'processing' | 'ready_for_review' | 'synced' | 'error';
	extracted_data?: Record<string, any>;
	final_data?: {
		kind?: string;
		type?: string;
		brand?: string;
		article?: string;
		specs?: Record<string, any>;
		generated_name?: string;
		description?: string;
		images?: Array<{ src: string; alt?: string }>;
	};
	predictions?: {
		gau?: { code: string; confidence: number };
		duplicates?: {
			count: number;
			last_checked_at?: string;
		};
	};
	erp_ref_key?: string | null;
	source_type?: string;
	source_payload?: string;
}

export interface IngestResponse {
	draft_id: string;
	status: string;
	source_type: string;
	source_payload: string;
}

export interface SearchAnalogsResponse {
	results: Array<{
		ref_key: string;
		name: string;
		score: number;
		match_type?: 'duplicate' | 'analog' | 'related';
		imageUrl?: string;
	}>;
}

export interface GenerateNameResponse {
	generated_name: string;
}

/**
 * Создает черновик карточки товара по URL
 * 
 * МОК: Если USE_MOCK_DATA = true, возвращает мок-данные
 */
export const ingestUrl = async (
	token: string,
	url: string
): Promise<IngestResponse> => {
	// МОК: Возвращаем мок-данные если флаг включен
	if (USE_MOCK_DATA) {
		console.log('[MOCK] ingestUrl:', url);
		return await mockIngestUrlResponse(url);
	}

	// Реальный API-вызов
	let error = null;

	const res = await fetch(`${FASTAPI_BASE_URL}/ingest`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			source_type: 'url',
			url: url
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = err;
			console.error('Error ingesting URL:', err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

/**
 * Создает черновик карточки товара по тексту
 * 
 * МОК: Если USE_MOCK_DATA = true, возвращает мок-данные
 */
export const ingestText = async (
	token: string,
	text: string
): Promise<IngestResponse> => {
	// МОК: Возвращаем мок-данные если флаг включен
	if (USE_MOCK_DATA) {
		console.log('[MOCK] ingestText:', text.substring(0, 50) + '...');
		return await mockIngestTextResponse(text);
	}

	// Реальный API-вызов
	let error = null;

	const res = await fetch(`${FASTAPI_BASE_URL}/ingest`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			source_type: 'text',
			text: text
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = err;
			console.error('Error ingesting text:', err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

/**
 * Создает черновик карточки товара по файлу
 * 
 * МОК: Если USE_MOCK_DATA = true, возвращает мок-данные
 */
export const ingestFile = async (
	token: string,
	file: File
): Promise<IngestResponse> => {
	// МОК: Возвращаем мок-данные если флаг включен
	if (USE_MOCK_DATA) {
		console.log('[MOCK] ingestFile:', file.name);
		return await mockIngestFileResponse(file.name);
	}

	// Реальный API-вызов
	let error = null;

	const formData = new FormData();
	formData.append('source_type', 'file');
	formData.append('file', file);

	const res = await fetch(`${FASTAPI_BASE_URL}/ingest`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			authorization: `Bearer ${token}`
		},
		body: formData
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = err;
			console.error('Error ingesting file:', err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

/**
 * Получает черновик по ID
 * 
 * МОК: Если USE_MOCK_DATA = true, возвращает мок-данные
 */
export const getDraft = async (token: string, draftId: string): Promise<DraftCard> => {
	// МОК: Возвращаем мок-данные если флаг включен
	if (USE_MOCK_DATA) {
		console.log('[MOCK] getDraft:', draftId);
		return await mockGetDraftResponse(draftId);
	}

	// Реальный API-вызов
	let error = null;

	const res = await fetch(`${FASTAPI_BASE_URL}/drafts/${draftId}`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			authorization: `Bearer ${token}`
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = err;
			console.error('Error getting draft:', err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

/**
 * Обновляет черновик
 * 
 * МОК: Если USE_MOCK_DATA = true, возвращает мок-данные
 */
export const updateDraft = async (
	token: string,
	draftId: string,
	finalData: Partial<DraftCard['final_data']>
): Promise<{ draft: DraftCard }> => {
	// МОК: Возвращаем мок-данные если флаг включен
	if (USE_MOCK_DATA) {
		console.log('[MOCK] updateDraft:', draftId, finalData);
		return await mockUpdateDraftResponse(draftId, finalData);
	}

	// Реальный API-вызов
	let error = null;

	const res = await fetch(`${FASTAPI_BASE_URL}/drafts/${draftId}`, {
		method: 'PATCH',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			final_data: finalData
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = err;
			console.error('Error updating draft:', err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

/**
 * Генерирует название товара для черновика
 * 
 * МОК: Если USE_MOCK_DATA = true, возвращает мок-данные
 */
export const generateName = async (
	token: string,
	draftId: string
): Promise<GenerateNameResponse> => {
	// МОК: Возвращаем мок-данные если флаг включен
	if (USE_MOCK_DATA) {
		console.log('[MOCK] generateName:', draftId);
		return await mockGenerateNameResponse(draftId);
	}

	// Реальный API-вызов
	let error = null;

	const res = await fetch(`${FASTAPI_BASE_URL}/drafts/${draftId}/generate-name`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = err;
			console.error('Error generating name:', err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

/**
 * Отправляет черновик в 1С
 * 
 * МОК: Если USE_MOCK_DATA = true, возвращает мок-данные
 */
export const commitDraft = async (
	token: string,
	draftId: string
): Promise<{ status: string }> => {
	// МОК: Возвращаем мок-данные если флаг включен
	if (USE_MOCK_DATA) {
		console.log('[MOCK] commitDraft:', draftId);
		return await mockCommitDraftResponse(draftId);
	}

	// Реальный API-вызов
	let error = null;

	const res = await fetch(`${FASTAPI_BASE_URL}/drafts/${draftId}/commit`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = err;
			console.error('Error committing draft:', err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

/**
 * Поиск аналогов и дублей
 * 
 * МОК: Если USE_MOCK_DATA = true, возвращает мок-данные
 */
export const searchAnalogs = async (
	token: string,
	options: {
		draft_id?: string;
		query?: string;
	}
): Promise<SearchAnalogsResponse> => {
	// МОК: Возвращаем мок-данные если флаг включен
	if (USE_MOCK_DATA) {
		console.log('[MOCK] searchAnalogs:', options);
		return await mockSearchAnalogsResponse(options);
	}

	// Реальный API-вызов
	let error = null;

	if (!options.draft_id && !options.query) {
		throw new Error('Either draft_id or query must be provided');
	}

	const res = await fetch(`${FASTAPI_BASE_URL}/search/analogs`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			draft_id: options.draft_id,
			query: options.query
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = err;
			console.error('Error searching analogs:', err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

/**
 * Прямое обращение к FastAPI для генерации ответа чата
 * Обходит бэкенд Open WebUI и обращается напрямую к FastAPI
 * 
 * МОК: Если USE_MOCK_DATA = true, возвращает мок-данные
 */
export const generateFastAPIChatCompletion = async (
	token: string,
	body: {
		messages: Array<any>;
		model?: string;
		stream?: boolean;
		params?: Record<string, any>;
		metadata?: {
			user_id?: string;
			chat_id?: string;
			message_id?: string;
			session_id?: string;
		};
	}
): Promise<Response> => {
	// МОК: Возвращаем мок-данные если флаг включен
	if (USE_MOCK_DATA) {
		console.log('[MOCK] generateFastAPIChatCompletion:', {
			model: body.model,
			stream: body.stream,
			messagesCount: body.messages.length
		});
		return await mockChatCompletionResponse(body);
	}

	// Реальный API-вызов
	const payload: any = {
		messages: body.messages,
		model: body.model || 'fastapi',
		stream: body.stream ?? true
	};

	if (body.params) {
		payload.params = body.params;
	}

	if (body.metadata) {
		payload.metadata = body.metadata;
	}

	const response = await fetch(FASTAPI_CHAT_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		},
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		const errorData = await response.json().catch(async () => ({ detail: await response.text() }));
		throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
	}

	return response;
};
