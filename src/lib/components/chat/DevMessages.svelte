<script lang="ts">
	import { tick, getContext } from 'svelte';
	const i18n: any = getContext('i18n');

	import Message from './Messages/Message.svelte';
	import DevResponseMessage from './DevResponseMessage.svelte';
	import UserMessage from './Messages/UserMessage.svelte';

	export let className = 'h-full flex pt-8';
	export let chatId = '';
	export let user: any;
	export let history: any = {};
	export let selectedModels: any;

	let messages: any[] = [];

	export let readOnly = false;
	export let editCodeBlock = true;
	export let topPadding = false;
	export let bottomPadding = false;
	export let autoScroll: any;

	$: if (history.currentId) {
		let _messages = [];
		let message = history.messages[history.currentId];
		while (message) {
			_messages.unshift({ ...message });
			message = message.parentId !== null ? history.messages[message.parentId] : null;
		}
		messages = _messages;
	} else {
		messages = [];
	}

	$: if (autoScroll && bottomPadding) {
		(async () => {
			await tick();
			scrollToBottom();
		})();
	}

	const scrollToBottom = () => {
		const element = document.getElementById('messages-container');
		if (element) {
			element.scrollTop = element.scrollHeight;
		}
	};

	const gotoMessage = () => {};
	const showPreviousMessage = () => {};
	const showNextMessage = () => {};
	const updateChat = () => {};
	const editMessage = () => {};
	const deleteMessage = () => {};
	const rateMessage = () => {};
	const actionMessage = () => {};
	const saveMessage = () => {};
</script>

<div class={className}>
	{#if messages.length > 0}
		<div class="w-full pt-2">
			<section class="w-full" aria-labelledby="chat-conversation">
				<h2 class="sr-only" id="chat-conversation">{$i18n.t('Chat Conversation')}</h2>
				<ul role="log" aria-live="polite" aria-relevant="additions" aria-atomic="false">
					{#each messages as message, messageIdx (message.id)}
						{#if message.role === 'user'}
							<UserMessage
								{user}
								{chatId}
								{history}
								messageId={message.id}
								isFirstMessage={messageIdx === 0}
								siblings={message.parentId !== null
									? (history.messages[message.parentId]?.childrenIds ?? [])
									: (Object.values(history.messages)
											.filter((m: any) => m.parentId === null)
											.map((m: any) => m.id) ?? [])}
								{gotoMessage}
								{showPreviousMessage}
								{showNextMessage}
								{editMessage}
								{deleteMessage}
								{readOnly}
								{editCodeBlock}
								{topPadding}
							/>
						{:else}
							<div
								class="flex flex-col justify-between px-5 mb-3 w-full max-w-5xl mx-auto rounded-lg group"
							>
								<DevResponseMessage
									message={message}
									{chatId}
									{history}
									{selectedModels}
								/>
							</div>
						{/if}
					{/each}
				</ul>
			</section>
			<div class="pb-18"></div>
			{#if bottomPadding}
				<div class="pb-6"></div>
			{/if}
		</div>
	{/if}
</div>

