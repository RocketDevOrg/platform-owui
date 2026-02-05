<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { mobile } from '$lib/stores';

	export let messages: Array<{ id: string; role: string }> = [];
	export let container: HTMLElement | null = null;

	let currentIndex = 0;
	let isHovered = false;
	let scrollbarElement: HTMLElement;

	// Отслеживание видимого сообщения при скролле
	const updateCurrentIndex = () => {
		if (!container) return;

		const containerRect = container.getBoundingClientRect();
		const containerTop = containerRect.top;
		const containerHeight = containerRect.height;

		// Ищем первое сообщение, которое видно в верхней половине контейнера
		for (let i = 0; i < messages.length; i++) {
			const messageEl = document.getElementById(`message-${messages[i].id}`);
			if (messageEl) {
				const rect = messageEl.getBoundingClientRect();
				const relativeTop = rect.top - containerTop;
				
				// Сообщение считается текущим, если его верхняя часть в верхней половине viewport
				if (relativeTop >= -rect.height / 2 && relativeTop < containerHeight / 2) {
					currentIndex = i;
					return;
				}
			}
		}
	};

	// Скролл к сообщению по индексу
	const scrollToMessage = (index: number) => {
		const message = messages[index];
		if (!message) return;

		const messageEl = document.getElementById(`message-${message.id}`);
		if (messageEl && container) {
			messageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
			currentIndex = index;
		}
	};

	// Обработчик скролла
	let scrollTimeout: ReturnType<typeof setTimeout>;
	const handleScroll = () => {
		clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(updateCurrentIndex, 50);
	};

	onMount(() => {
		if (container) {
			container.addEventListener('scroll', handleScroll);
			updateCurrentIndex();
		}
	});

	onDestroy(() => {
		if (container) {
			container.removeEventListener('scroll', handleScroll);
		}
		clearTimeout(scrollTimeout);
	});

	// Обновляем при изменении контейнера
	$: if (container) {
		container.removeEventListener('scroll', handleScroll);
		container.addEventListener('scroll', handleScroll);
		updateCurrentIndex();
	}

	// Обновляем при изменении сообщений
	$: if (messages.length) {
		tick().then(updateCurrentIndex);
	}
</script>

{#if messages.length > 1 && !$mobile}
	<div
		bind:this={scrollbarElement}
		class="chat-scrollbar fixed right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 py-2 px-1.5 
			   rounded-lg transition-all duration-200 
			   {isHovered ? 'opacity-100 bg-gray-100/50 dark:bg-gray-800/50' : 'opacity-30 hover:opacity-60'}"
		on:mouseenter={() => (isHovered = true)}
		on:mouseleave={() => (isHovered = false)}
		role="navigation"
		aria-label="Message navigation"
	>
		{#each messages as message, i}
			<button
				class="scrollbar-tick rounded-full transition-all duration-150 cursor-pointer
					   {message.role === 'user' 
					   		? 'bg-gray-400 dark:bg-gray-500' 
					   		: 'bg-gray-600 dark:bg-gray-300'}
					   {i === currentIndex 
					   		? 'w-1.5 h-3 opacity-100' 
					   		: 'w-1 h-1.5 opacity-60'}
					   hover:w-1.5 hover:h-2.5 hover:opacity-100"
				on:click={() => scrollToMessage(i)}
				title="{message.role === 'user' ? 'You' : 'Assistant'}"
				aria-current={i === currentIndex ? 'true' : 'false'}
			/>
		{/each}
	</div>
{/if}

<style>
	.chat-scrollbar {
		pointer-events: auto;
	}

	.scrollbar-tick {
		min-height: 4px;
	}
</style>

