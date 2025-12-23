<script lang="ts">
	import DuplicateCard from '$lib/components/severnaya/DuplicateCard.svelte';
	import Button from '$lib/components/severnaya/Button.svelte';
	import FormField from '$lib/components/severnaya/FormField.svelte';
	import Search from '$lib/components/icons/Search.svelte';
	import Refresh from '$lib/components/icons/Refresh.svelte';

	export let items: Array<{
		name: string;
		matchType: 'duplicate' | 'analog' | 'related';
		score: number;
		refKey: string;
		imageUrl?: string | null;
	}> = [];
	export let totalCount: number = 0;
	export let draftId: string | null = null;
	export let onRefreshByDraft: (() => void) | null = null;
	export let onSearchByText: ((query: string) => void) | null = null;
	export let loading: boolean = false;
	export let itemsPerPage: number = 5;
	export let currentPage: number = 1;
	export let onPageChange: ((page: number) => void) | null = null;

	let searchQuery = '';

	$: totalPages = Math.ceil(items.length / itemsPerPage);
	$: startIndex = (currentPage - 1) * itemsPerPage;
	$: endIndex = startIndex + itemsPerPage;
	$: paginatedItems = items.slice(startIndex, endIndex);

	const handlePageClick = (page: number) => {
		if (onPageChange) {
			onPageChange(page);
		} else {
			currentPage = page;
		}
	};

	const handleRefresh = () => {
		if (onRefreshByDraft) {
			onRefreshByDraft();
		} else {
			console.log('Refresh by draft clicked');
		}
	};

	const handleSearch = () => {
		if (onSearchByText && searchQuery.trim()) {
			onSearchByText(searchQuery.trim());
		} else {
			console.log('Search by text clicked', searchQuery);
		}
	};

	$: displayedCount = paginatedItems.length;
</script>

<div
	class="max-w-3xl w-full mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 md:p-6 space-y-4"
>
	<!-- Заголовок -->
	<div class="space-y-1">
		<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
			Найденные дубли и аналоги
		</h2>
		<p class="text-sm text-gray-500 dark:text-gray-400">
			Показаны {displayedCount} из {totalCount}
		</p>
	</div>

	<!-- Панель действий -->
	<div class="flex flex-col sm:flex-row gap-3">
		{#if draftId}
			<Button
				variant="ghost"
				size="sm"
				icon={Refresh}
				iconPosition="left"
				loading={loading}
				on:click={handleRefresh}
			>
				Обновить по черновику
			</Button>
		{/if}

		<div class="flex-1 flex gap-2">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Введите текст для поиска..."
				class="flex-1 rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100 dark:border-gray-850 bg-white text-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						handleSearch();
					}
				}}
			/>
			<Button
				variant="secondary"
				size="sm"
				icon={Search}
				iconPosition="left"
				loading={loading}
				on:click={handleSearch}
			>
				Искать по тексту
			</Button>
		</div>
	</div>

	<!-- Список карточек -->
	<div class="space-y-2">
		{#if loading && items.length === 0}
			<!-- Skeleton карточки -->
			{#each Array(3) as _}
				<div
					class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-3 md:p-4 animate-pulse"
				>
					<div class="flex items-start justify-between gap-3 mb-2">
						<div class="h-4 bg-gray-200 dark:bg-gray-800 rounded flex-1"></div>
						<div class="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
					</div>
					<div class="h-3 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-2"></div>
					<div class="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
				</div>
			{/each}
		{:else if paginatedItems.length > 0}
			{#each paginatedItems as item (item.refKey)}
				<DuplicateCard
					name={item.name}
					matchType={item.matchType}
					score={item.score}
					refKey={item.refKey}
					imageUrl={item.imageUrl || null}
				/>
			{/each}
		{:else}
			<div class="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
				Дубли и аналоги не найдены
			</div>
		{/if}
	</div>

	<!-- Пагинация -->
	{#if items.length > 0 && totalPages > 1}
		<div class="flex justify-center items-center gap-2 pt-4">
			{#each Array(totalPages) as _, index}
				{@const page = index + 1}
				<button
					type="button"
					class="severnaya-pagination-bullet {currentPage === page
						? 'severnaya-pagination-bullet-active'
						: ''}"
					on:click={() => handlePageClick(page)}
					aria-label="Page {page}"
				></button>
			{/each}
		</div>
	{/if}
</div>

<style>
	:global(.severnaya-pagination-bullet) {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: white;
		opacity: 1;
		cursor: pointer;
		transition: background-color 0.2s;
		border: none;
		padding: 0;
	}

	:global(.severnaya-pagination-bullet:hover) {
		background: #e5e7eb;
	}

	:global(.severnaya-pagination-bullet-active) {
		background: black;
	}

	:global(.dark .severnaya-pagination-bullet) {
		background: white;
	}

	:global(.dark .severnaya-pagination-bullet:hover) {
		background: #d1d5db;
	}

	:global(.dark .severnaya-pagination-bullet-active) {
		background: black;
	}
</style>

