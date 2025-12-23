/**
 * API functions for direct communication with n8n
 */

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

export const sendMessageToN8N = async (
	messages: Array<{ role: string; content: string }>,
	signal?: AbortSignal
): Promise<Response | null> => {
	if (!N8N_WEBHOOK_URL) {
		throw new Error('N8N_WEBHOOK_URL is not configured');
	}

	const response = await fetch(N8N_WEBHOOK_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			messages
		}),
		signal
	}).catch((err) => {
		console.error('Error sending message to n8n:', err);
		return null;
	});

	if (!response || !response.ok) {
		throw new Error(`Failed to send message to n8n: ${response?.statusText || 'Unknown error'}`);
	}

	return response;
};

