import { WEBUI_API_BASE_URL } from '$lib/constants';

// Базовый URL для FastAPI backend (можно переопределить через переменную окружения)
const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL || 'http://localhost:8000/api/v1';
const FASTAPI_CHAT_URL = import.meta.env.VITE_FASTAPI_CHAT_URL || `${FASTAPI_BASE_URL}/chat/completions`;

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
		imageUrl?: string;
	}>;
}

export interface GenerateNameResponse {
	generated_name: string;
}

/**
 * Создает черновик карточки товара по URL
 */
export const ingestUrl = async (
	token: string,
	url: string
): Promise<IngestResponse> => {
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
 */
export const ingestText = async (
	token: string,
	text: string
): Promise<IngestResponse> => {
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
 */
export const ingestFile = async (
	token: string,
	file: File
): Promise<IngestResponse> => {
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
 */
export const getDraft = async (token: string, draftId: string): Promise<DraftCard> => {
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
 */
export const updateDraft = async (
	token: string,
	draftId: string,
	finalData: Partial<DraftCard['final_data']>
): Promise<{ draft: DraftCard }> => {
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
 */
export const generateName = async (
	token: string,
	draftId: string
): Promise<GenerateNameResponse> => {
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
 */
export const commitDraft = async (
	token: string,
	draftId: string
): Promise<{ status: string }> => {
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
 */
export const searchAnalogs = async (
	token: string,
	options: {
		draft_id?: string;
		query?: string;
	}
): Promise<SearchAnalogsResponse> => {
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
