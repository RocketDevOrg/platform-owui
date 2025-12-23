<script lang="ts">
	import { getContext } from 'svelte';
	import { WEBUI_NAME, showSidebar, mobile } from '$lib/stores';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import Sidebar from '$lib/components/icons/Sidebar.svelte';
	import DraftCard from '$lib/components/severnaya/DraftCard.svelte';
	import DuplicatesWidget from '$lib/components/severnaya/DuplicatesWidget.svelte';

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

	const i18n: any = getContext('i18n');

	let loadingSave = false;
	let loadingSendTo1C = false;
	let loadingGenerateTitle = false;

	const handleGenerateTitle = () => {
		// TODO: Здесь будет логика генерации названия через AI
		console.log('Generate title clicked');
		loadingGenerateTitle = true;
		setTimeout(() => {
			loadingGenerateTitle = false;
		}, 2000);
	};

	const handleSave = () => {
		console.log('Save changes clicked');
		loadingSave = true;
		setTimeout(() => {
			loadingSave = false;
		}, 2000);
	};

	const handleSendTo1C = () => {
		console.log('Отправка черновика в 1С');
		loadingSendTo1C = true;
		setTimeout(() => {
			loadingSendTo1C = false;
		}, 2000);
	};

	// Тестовые данные для DuplicatesWidget
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
		},
		{
			name: 'Мышь Logitech M170 черный',
			matchType: 'duplicate' as const,
			score: 0.95,
			refKey: '550e8400-e29b-41d4-a716-446655440003',
			imageUrl:
				'https://dartoffice.ru/12626110-tm_large_default/mysh-kompyuternaya-logitech-910-004642-wireless-mouse-m170.jpg'
		},
		{
			name: 'Беспроводная мышь Logitech M170 серый',
			matchType: 'analog' as const,
			score: 0.88,
			refKey: '550e8400-e29b-41d4-a716-446655440004',
			imageUrl: 'https://i-vse.ru/wa-data/public/shop/img/m171-feature-2-1.jpg'
		},
		{
			name: 'Мышь Logitech M171 серый',
			matchType: 'related' as const,
			score: 0.75,
			refKey: '550e8400-e29b-41d4-a716-446655440005',
			imageUrl:
				'https://dartoffice.ru/12626110-tm_large_default/mysh-kompyuternaya-logitech-910-004642-wireless-mouse-m170.jpg'
		},
		{
			name: 'Logitech M170 Wireless серый',
			matchType: 'duplicate' as const,
			score: 0.92,
			refKey: '550e8400-e29b-41d4-a716-446655440006',
			imageUrl: 'https://i-vse.ru/wa-data/public/shop/img/m171-feature-2-1.jpg'
		}
	];

	let currentPage = 1;

	let duplicatesLoading = false;

	const handleRefreshDuplicates = () => {
		console.log('Refresh duplicates by draft');
		duplicatesLoading = true;
		setTimeout(() => {
			duplicatesLoading = false;
		}, 2000);
	};

	const handleSearchDuplicates = (query: string) => {
		console.log('Search duplicates by text:', query);
		duplicatesLoading = true;
		setTimeout(() => {
			duplicatesLoading = false;
		}, 2000);
	};
</script>

<svelte:head>
	<title>UI Kit • {$WEBUI_NAME}</title>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css" />
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
					<h1 class="text-lg font-medium px-1.5">UI Kit</h1>
				</div>
			</div>
		</div>
	</nav>

	<div class="flex-1 max-h-full overflow-y-auto">
		<div class="w-full max-w-5xl mx-auto px-4 py-6 space-y-8">
			<!-- Здесь будет верстка компонентов -->
			<div class="space-y-8">
				<div class="text-center text-gray-500 dark:text-gray-400">
					<p class="mb-4">UI Kit для виджетов Северная</p>

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
				</div>

				<div>
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
							console.log('Page changed to:', page);
						}}
					/>
				</div>
			</div>
		</div>
	</div>
</div>
