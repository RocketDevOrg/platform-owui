<script lang="ts">
	import { WEBUI_BASE_URL } from '$lib/constants';
	import ChatBubbleOval from '$lib/components/icons/ChatBubbleOval.svelte';

	export let className = 'size-8';
	export let src = `${WEBUI_BASE_URL}/static/favicon.png`;
	export let modelId: string | undefined = undefined;

	let imageError = false;

	// Проверяем, является ли это моделью fastapi (помощник)
	$: isFastAPIModel = modelId === 'fastapi' || (src && (src.includes('id=fastapi') || src.includes('&id=fastapi') || src.includes('?id=fastapi')));
	
	// Сбрасываем ошибку при изменении src или modelId
	$: if (src || modelId) {
		imageError = false;
	}

	const handleImageError = () => {
		// Если изображение не загрузилось и это модель fastapi, показываем иконку
		if (modelId === 'fastapi' || (src && (src.includes('id=fastapi') || src.includes('&id=fastapi') || src.includes('?id=fastapi')))) {
			imageError = true;
		}
	};
</script>

{#if isFastAPIModel || imageError}
	<!-- Иконка для модели помощника вместо изображения -->
	<div class="{className} flex items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30">
		<ChatBubbleOval className="size-5 text-sky-600 dark:text-sky-400" strokeWidth="2" />
	</div>
{:else}
	<img
		aria-hidden="true"
		src={src === ''
			? `${WEBUI_BASE_URL}/static/favicon.png`
			: src.startsWith(WEBUI_BASE_URL) ||
				  src.startsWith('https://www.gravatar.com/avatar/') ||
				  src.startsWith('data:') ||
				  src.startsWith('/')
				? src
				: `${WEBUI_BASE_URL}/user.png`}
		class=" {className} object-cover rounded-full"
		alt="profile"
		draggable="false"
		on:error={handleImageError}
	/>
{/if}
