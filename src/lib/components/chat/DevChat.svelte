<script lang="ts">
	// @ts-ignore
	import { v4 as uuidv4 } from 'uuid';
	import { onMount, tick, getContext } from 'svelte';
	import { fade } from 'svelte/transition';

	const i18n: any = getContext('i18n');

	import {
		WEBUI_NAME,
		showSidebar,
		mobile,
		settings,
		user
	} from '$lib/stores';

	import { createMessagesList } from '$lib/utils';

	import MessageInput from '$lib/components/chat/MessageInput.svelte';
	import DevMessages from '$lib/components/chat/DevMessages.svelte';
	import Tooltip from '../common/Tooltip.svelte';
	import Sidebar from '../icons/Sidebar.svelte';

	let messageInput: any;
	let autoScroll = true;
	let generating = false;
	let messagesContainerElement: HTMLDivElement;

	let history: any = {
		messages: {},
		currentId: null
	};

	let prompt = '';
	let files: any[] = [];

	const onChange = () => {};
	const showMessage = async () => {};
	const regenerateResponse = async () => {};
	const mergeResponses = async () => {};
	const chatActionHandler = async () => {};
	const addMessages = async () => {};
	const onSelect = async () => {};

	const scrollToBottom = () => {
		if (messagesContainerElement) {
			messagesContainerElement.scrollTop = messagesContainerElement.scrollHeight;
		}
	};

	const sendMessage = async (_history: any, parentId: string) => {
		if (autoScroll) {
			scrollToBottom();
		}

		// Create assistant message
		let responseMessageId = uuidv4();
		let responseMessage = {
			id: responseMessageId,
			parentId: parentId,
			childrenIds: [],
			role: 'assistant',
			content: 'Processing your request...',
			timestamp: Math.floor(Date.now() / 1000),
			done: true
		};

		_history.messages[responseMessageId] = responseMessage;
		_history.messages[parentId].childrenIds.push(responseMessageId);
		_history.currentId = responseMessageId;
		
		// Force reactivity update
		history = _history;

		await tick();
		if (autoScroll) {
			scrollToBottom();
		}
	};

	const submitMessage = async (parentId: any, userPrompt: string) => {
		let userMessageId = uuidv4();

		let userMessage = {
			id: userMessageId,
			parentId: parentId,
			childrenIds: [],
			role: 'user',
			content: userPrompt,
			timestamp: Math.floor(Date.now() / 1000)
		};

		if (parentId !== null) {
			history.messages[parentId].childrenIds = [
				...history.messages[parentId].childrenIds,
				userMessageId
			];
		}

		history.messages[userMessageId] = userMessage;
		history.currentId = userMessageId;
		
		// Force reactivity update
		history = { ...history };

		await tick();

		if (autoScroll) {
			scrollToBottom();
		}

		prompt = '';
		files = [];
		messageInput?.setText('');

		await sendMessage(history, userMessageId);
	};

	const stopResponse = async () => {
		generating = false;
	};

	const createMessagePair = async (userPrompt: string) => {
		if (userPrompt || files.length > 0) {
			await submitMessage(null, userPrompt || '');
		}
	};

	onMount(() => {
		const chatInput = document.getElementById('chat-input');
		chatInput?.focus();
	});
</script>

<svelte:head>
	<title>Dev Chat • {$WEBUI_NAME}</title>
</svelte:head>

<div
	class="flex flex-col w-full h-screen max-h-[100dvh] transition-width duration-200 ease-in-out {$showSidebar
		? 'md:max-w-[calc(100%-260px)]'
		: ''} max-w-full"
>
	<nav class="px-2.5 pt-1.5 backdrop-blur-xl w-full drag-region">
		<div class="flex items-center">
			{#if $mobile}
				<div class="{$showSidebar ? 'md:hidden' : ''} flex flex-none items-center self-end">
					<Tooltip
						content={$showSidebar ? i18n.t('Close Sidebar') : i18n.t('Open Sidebar')}
						interactive={true}
					>
						<button
							id="sidebar-toggle-button"
							class="cursor-pointer flex rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 transition"
							on:click={() => {
								showSidebar.set(!$showSidebar);
							}}
						>
							<div class="self-center p-1.5">
								<Sidebar />
							</div>
						</button>
					</Tooltip>
				</div>
			{/if}

			<div class="flex w-full">
				<div class="flex items-center gap-1">
					<h1 class="text-lg font-medium px-1.5">Dev Chat</h1>
				</div>
			</div>
		</div>
	</nav>

	<div class="flex flex-col flex-auto z-10 w-full @container overflow-hidden">
		<div
			class="pb-2.5 flex flex-col justify-between w-full flex-auto overflow-auto h-0 max-w-full z-10 scrollbar-hidden"
			id="messages-container"
			bind:this={messagesContainerElement}
			on:scroll={(e) => {
				autoScroll =
					messagesContainerElement.scrollHeight - messagesContainerElement.scrollTop <=
					messagesContainerElement.clientHeight + 5;
			}}
		>
			<div class="h-full w-full flex flex-col">
				{#if createMessagesList(history, history.currentId).length > 0}
					<DevMessages
						chatId="devchat"
						bind:history
						bind:autoScroll
						selectedModels={['']}
						topPadding={true}
						bottomPadding={files.length > 0}
						user={$user}
					/>
				{/if}
			</div>
		</div>

		<div class="pb-2 z-10 flex-shrink-0">
			<MessageInput
				bind:this={messageInput}
				onChange={onChange}
				{createMessagePair}
				{stopResponse}
				{autoScroll}
				{generating}
				history={history}
				selectedModels={['']}
				atSelectedModel={undefined}
				bind:prompt
				bind:files
				on:submit={async (e) => {
					if (e.detail || files.length > 0) {
						await tick();
						await createMessagePair(e.detail?.replaceAll('\n\n', '\n') || prompt);
					}
				}}
			/>
		</div>
	</div>
</div>

