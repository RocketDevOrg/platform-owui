/**
 * Мок-данные для разработки без backend
 * 
 * ВАЖНО: Когда контур будет доступен, нужно:
 * 1. Установить USE_MOCK_DATA = false в index.ts
 * 2. Удалить этот файл или оставить для тестирования
 */

import type { DraftCard, IngestResponse, GenerateNameResponse } from './index';

// Флаг для переключения между мок-данными и реальным API
export const USE_MOCK_DATA = false;

// Задержка для имитации сетевого запроса (мс)
const MOCK_DELAY = 800;

// Вспомогательная функция для задержки
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Мок-данные для черновика карточки товара
 */
export const mockDraftCard: DraftCard = {
	id: '550e8400-e29b-41d4-a716-446655440000',
	status: 'new',
	extracted_data: {
		data: {
			name: 'Компьютерная мышь Logitech MX Master 3S',
			price: '8990',
			description: 'Беспроводная мышь для работы и творчества с точным сенсором и эргономичным дизайном'
		}
	},
	final_data: {
		kind: 'Товар',
		type: 'Компьютерная периферия',
		brand: 'Logitech',
		article: 'MX-MASTER-3S',
		specs: {
			'Тип подключения': 'Беспроводная',
			'Интерфейс': 'USB, Bluetooth',
			'Разрешение сенсора': '8000 DPI',
			'Количество кнопок': '7',
			'Время работы от батареи': 'до 70 дней',
			'Цвет': 'Черный'
		},
		description: 'Беспроводная мышь для работы и творчества с точным сенсором и эргономичным дизайном. Идеально подходит для длительной работы за компьютером.',
		generated_name: 'Компьютерная мышь Logitech MX Master 3S',
		images: [
			{
				src: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
				alt: 'Logitech MX Master 3S'
			},
			{
				src: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
				alt: 'Logitech MX Master 3S вид сбоку'
			}
		]
	},
	predictions: {
		gau: {
			code: '001',
			confidence: 0.95
		},
		duplicates: {
			count: 3,
			last_checked_at: '2025-01-15T10:30:00Z'
		}
	},
	erp_ref_key: null,
	source_type: 'url',
	source_payload: 'https://example.com/product/logitech-mx-master-3s'
};

/**
 * Мок-ответ для создания черновика по URL
 */
export const mockIngestUrlResponse = async (url: string): Promise<IngestResponse> => {
	await delay(MOCK_DELAY);
	return {
		draft_id: mockDraftCard.id,
		status: 'new',
		source_type: 'url',
		source_payload: url
	};
};

/**
 * Мок-ответ для создания черновика по тексту
 */
export const mockIngestTextResponse = async (text: string): Promise<IngestResponse> => {
	await delay(MOCK_DELAY);
	return {
		draft_id: mockDraftCard.id,
		status: 'new',
		source_type: 'text',
		source_payload: text.substring(0, 100) // Первые 100 символов
	};
};

/**
 * Мок-ответ для создания черновика по файлу
 */
export const mockIngestFileResponse = async (fileName: string): Promise<IngestResponse> => {
	await delay(MOCK_DELAY);
	return {
		draft_id: mockDraftCard.id,
		status: 'new',
		source_type: 'file',
		source_payload: fileName
	};
};

/**
 * Мок-ответ для получения черновика
 */
export const mockGetDraftResponse = async (draftId: string): Promise<DraftCard> => {
	await delay(MOCK_DELAY);
	return {
		...mockDraftCard,
		id: draftId
	};
};

/**
 * Мок-ответ для обновления черновика
 */
export const mockUpdateDraftResponse = async (
	draftId: string,
	finalData: Partial<DraftCard['final_data']>
): Promise<{ draft: DraftCard }> => {
	await delay(MOCK_DELAY);
	return {
		draft: {
			...mockDraftCard,
			id: draftId,
			final_data: {
				...mockDraftCard.final_data,
				...finalData
			}
		}
	};
};

/**
 * Мок-ответ для генерации названия
 */
export const mockGenerateNameResponse = async (draftId: string): Promise<GenerateNameResponse> => {
	await delay(MOCK_DELAY);
	return {
		generated_name: 'Компьютерная мышь Logitech MX Master 3S беспроводная черная'
	};
};

/**
 * Мок-ответ для отправки в 1С
 */
export const mockCommitDraftResponse = async (draftId: string): Promise<{ status: string }> => {
	await delay(MOCK_DELAY);
	return {
		status: 'ready_to_sync'
	};
};

/**
 * Мок-ответ для поиска аналогов
 */
export const mockSearchAnalogsResponse = async (options: {
	draft_id?: string;
	query?: string;
}): Promise<{
	results: Array<{
		ref_key: string;
		name: string;
		score: number;
		match_type?: 'duplicate' | 'analog' | 'related';
		imageUrl?: string;
	}>;
}> => {
	await delay(MOCK_DELAY);
	return {
		results: [
			{
				ref_key: '550e8400-e29b-41d4-a716-446655440001',
				name: 'Мышь Logitech MX Master 3S',
				score: 0.98,
				match_type: 'duplicate',
				imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=200'
			},
			{
				ref_key: '550e8400-e29b-41d4-a716-446655440002',
				name: 'Мышь Logitech MX Master 3',
				score: 0.85,
				match_type: 'analog',
				imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200'
			},
			{
				ref_key: '550e8400-e29b-41d4-a716-446655440003',
				name: 'Мышь беспроводная Logitech',
				score: 0.72,
				match_type: 'related',
				imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=200'
			}
		]
	};
};

/**
 * Мок-ответ для chat completions
 * Возвращает Response с мок-данными, включая виджет черновика
 */
export const mockChatCompletionResponse = async (
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
	await delay(MOCK_DELAY);

	const stream = body.stream ?? true;
	const lastMessageObj = body.messages[body.messages.length - 1];
	
	// Извлекаем текст из сообщения (может быть строкой или объектом с content)
	let lastMessage = '';
	if (typeof lastMessageObj?.content === 'string') {
		lastMessage = lastMessageObj.content;
	} else if (Array.isArray(lastMessageObj?.content)) {
		// Если content - массив, ищем текстовые элементы
		lastMessage = lastMessageObj.content
			.filter((item: any) => item.type === 'text')
			.map((item: any) => item.text || '')
			.join(' ');
	}
	
	// Определяем, нужно ли создавать черновик (если в сообщении есть URL или запрос на создание карточки)
	const messageLower = lastMessage.toLowerCase();
	const shouldCreateDraft = 
		messageLower.includes('создай карточку') ||
		messageLower.includes('создать карточку') ||
		messageLower.includes('создай черновик') ||
		messageLower.includes('создать черновик') ||
		messageLower.includes('ingest') ||
		messageLower.includes('карточка') ||
		messageLower.includes('черновик') ||
		lastMessage.match(/https?:\/\/[^\s]+/) ||
		// Для тестирования: всегда создавать виджет в мок-режиме
		true; // ВРЕМЕННО: всегда показывать виджет для тестирования
	
	console.log('[MOCK] Chat completion:', {
		lastMessage: lastMessage.substring(0, 100),
		shouldCreateDraft,
		stream,
		messagesCount: body.messages.length
	});

	if (stream) {
		// Streaming ответ
		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();
				
				// Отправляем начальное сообщение
				const initialMessage = shouldCreateDraft
					? `Черновик карточки товара создан. Виджет загружается...\n\n`
					: `Это мок-ответ от FastAPI. Ваш запрос: "${lastMessage.substring(0, 50)}..."\n\n`;
				
				controller.enqueue(
					encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: initialMessage } }] })}\n\n`)
				);

				// Если нужно создать черновик, отправляем данные виджета
				if (shouldCreateDraft) {
					await delay(300);
					
					// Отправляем данные виджета в специальном формате
					const widgetData = {
						type: 'widget',
						widget_type: 'draft',
						widget_data: {
							draft: mockDraftCard,
							meta: {
								can_edit: true,
								can_commit: true,
								source_label: 'Ссылка',
								created_at: new Date().toISOString()
							}
						}
					};
					
					// Формируем виджет в формате markdown code block
					const widgetMarkdown = `\n\n\`\`\`widget\n${JSON.stringify(widgetData, null, 2)}\n\`\`\`\n\n`;
					
					console.log('[MOCK] Sending widget:', widgetMarkdown.substring(0, 200));
					
					controller.enqueue(
						encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: widgetMarkdown } }] })}\n\n`)
					);
				} else {
					// Обычный текстовый ответ
					const responseText = `Это мок-ответ от FastAPI для разработки.\n\nВаш запрос был обработан, но backend пока недоступен.\n\nДля переключения на реальный API установите USE_MOCK_DATA = false в mock.ts`;
					
					// Отправляем текст по частям для имитации streaming
					const words = responseText.split(' ');
					for (let i = 0; i < words.length; i++) {
						await delay(50);
						const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
						controller.enqueue(
							encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`)
						);
					}
				}

				// Завершаем поток
				await delay(100);
				controller.enqueue(encoder.encode('data: [DONE]\n\n'));
				controller.close();
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive'
			}
		});
	} else {
		// Non-streaming ответ
		const responseData = shouldCreateDraft
			? {
					id: 'mock-chat-' + Date.now(),
					object: 'chat.completion',
					created: Math.floor(Date.now() / 1000),
					model: body.model || 'fastapi',
					choices: [
						{
							index: 0,
							message: {
								role: 'assistant',
								content: `Черновик карточки товара создан.\n\n\`\`\`widget\n${JSON.stringify({
									type: 'widget',
									widget_type: 'draft',
									widget_data: {
										draft: mockDraftCard,
										meta: {
											can_edit: true,
											can_commit: true,
											source_label: 'Ссылка',
											created_at: new Date().toISOString()
										}
									}
								})}\n\`\`\``
							},
							finish_reason: 'stop'
						}
					],
					usage: {
						prompt_tokens: 10,
						completion_tokens: 20,
						total_tokens: 30
					}
				}
			: {
					id: 'mock-chat-' + Date.now(),
					object: 'chat.completion',
					created: Math.floor(Date.now() / 1000),
					model: body.model || 'fastapi',
					choices: [
						{
							index: 0,
							message: {
								role: 'assistant',
								content: `Это мок-ответ от FastAPI для разработки.\n\nВаш запрос был обработан, но backend пока недоступен.\n\nДля переключения на реальный API установите USE_MOCK_DATA = false в mock.ts`
							},
							finish_reason: 'stop'
						}
					],
					usage: {
						prompt_tokens: 10,
						completion_tokens: 20,
						total_tokens: 30
					}
				};

		return new Response(JSON.stringify(responseData), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
};

