<script lang="ts">
	import { getContext } from 'svelte';
	import ContentRenderer from './Messages/ContentRenderer.svelte';
	import Skeleton from './Messages/Skeleton.svelte';
	import Error from './Messages/Error.svelte';
	import DraftCard from '../severnaya/DraftCard.svelte';
	import DuplicatesWidget from '../severnaya/DuplicatesWidget.svelte';
	import Name from './Messages/Name.svelte';
	import ProfileImage from './Messages/ProfileImage.svelte';
	import Tooltip from '../common/Tooltip.svelte';
	import { settings } from '$lib/stores';
	import { WEBUI_API_BASE_URL } from '$lib/constants';

	const i18n: any = getContext('i18n');

	export let message: any;
	export let chatId: string;
	export let history: any;
	export let selectedModels: any;

	// Тестовые данные для виджетов
	const productImages = [
		{
			src: 'https://dartoffice.ru/12626110-tm_large_default/mysh-kompyuternaya-logitech-910-004642-wireless-mouse-m170.jpg',
			alt: 'Мышь беспроводная Logitech M170'
		},
		{
			src: 'https://i-vse.ru/wa-data/public/shop/img/m171-feature-2-1.jpg',
			alt: 'Мышь беспроводная Logitech M170'
		}
	];

	const duplicateItems = [
		{
			name: 'Мышь беспроводная Logitech M170 910-004646 серый',
			matchType: 'duplicate' as const,
			score: 0.98,
			refKey: '550e8400-e29b-41d4-a716-446655440000',
			imageUrl:
				'https://dartoffice.ru/12626110-tm_large_default/mysh-kompyuternaya-logitech-910-004642-wireless-mouse-m170.jpg'
		},
		{
			name: 'Мышь Logitech M170 Wireless Mouse серый',
			matchType: 'analog' as const,
			score: 0.85,
			refKey: '550e8400-e29b-41d4-a716-446655440001',
			imageUrl: 'https://i-vse.ru/wa-data/public/shop/img/m171-feature-2-1.jpg'
		},
		{
			name: 'Компьютерная мышь Logitech M171 беспроводная',
			matchType: 'related' as const,
			score: 0.72,
			refKey: '550e8400-e29b-41d4-a716-446655440002',
			imageUrl:
				'https://dartoffice.ru/12626110-tm_large_default/mysh-kompyuternaya-logitech-910-004642-wireless-mouse-m170.jpg'
		}
	];

	let loadingSave = false;
	let loadingSendTo1C = false;
	let loadingGenerateTitle = false;
	let currentPage = 1;
	let duplicatesLoading = false;

	const handleGenerateTitle = () => {
		loadingGenerateTitle = true;
		setTimeout(() => {
			loadingGenerateTitle = false;
		}, 2000);
	};

	const handleSave = () => {
		loadingSave = true;
		setTimeout(() => {
			loadingSave = false;
		}, 2000);
	};

	const handleSendTo1C = () => {
		loadingSendTo1C = true;
		setTimeout(() => {
			loadingSendTo1C = false;
		}, 2000);
	};

	const handleRefreshDuplicates = () => {
		duplicatesLoading = true;
		setTimeout(() => {
			duplicatesLoading = false;
		}, 2000);
	};

	const handleSearchDuplicates = (query: string) => {
		duplicatesLoading = true;
		setTimeout(() => {
			duplicatesLoading = false;
		}, 2000);
	};
</script>

<div class="flex w-full message-{message.id}" id="message-{message.id}" dir={($settings.chatDirection || 'auto') as 'ltr' | 'rtl' | 'auto'}>
	<div class="shrink-0 ltr:mr-3 rtl:ml-3 hidden @lg:flex mt-1">
		<ProfileImage
			src={`${WEBUI_API_BASE_URL}/models/model/profile/image?id=default&lang=${i18n.language}`}
			className={'size-8 assistant-message-profile-image'}
		/>
	</div>

	<div class="flex-auto w-0 pl-1 relative">
		<Name>
			<Tooltip content="Assistant" placement="top-start">
				<span id="response-message-model-name" class="line-clamp-1 text-black dark:text-white">
					Assistant
				</span>
			</Tooltip>
		</Name>

		<div>
			<div class="chat-{message.role} w-full min-w-full markdown-prose">
				<div>
					<div
						class="w-full flex flex-col relative"
						id="response-content-container"
					>
						{#if message.content === '' && !message.error}
							<Skeleton />
						{:else if message.content && message.error !== true}
							<ContentRenderer
								id={`${chatId}-${message.id}`}
								messageId={message.id}
								{history}
								{selectedModels}
								content={message.content}
								sources={message.sources}
								floatingButtons={false}
								save={false}
								preview={false}
								editCodeBlock={true}
								topPadding={false}
								done={message?.done ?? false}
								model={undefined}
							/>

							<!-- Виджеты после ответа -->
							{#if message.done || message.content}
								<div class="mt-6 space-y-6">
									<DraftCard
										images={productImages}
										title="Мышь беспроводная Logitech M170 910-004646 серый"
										source="https://example.com/product"
										kind=""
										type=""
										brand="Logitech"
										article="910-004646"
										onGenerateTitle={handleGenerateTitle}
										onSave={handleSave}
										onSendTo1C={handleSendTo1C}
										loadingSave={loadingSave}
										loadingSendTo1C={loadingSendTo1C}
										loadingGenerateTitle={loadingGenerateTitle}
									/>

									<DuplicatesWidget
										items={duplicateItems}
										totalCount={10}
										draftId="test-draft-id"
										onRefreshByDraft={handleRefreshDuplicates}
										onSearchByText={handleSearchDuplicates}
										loading={duplicatesLoading}
										itemsPerPage={3}
										bind:currentPage={currentPage}
										onPageChange={(page) => {
											currentPage = page;
										}}
									/>
								</div>
							{/if}
						{/if}

						{#if message?.error}
							<Error content={message?.error?.content ?? message.content} />
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

