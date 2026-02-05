<script lang="ts">
	import FormField from '$lib/components/severnaya/FormField.svelte';
	import ImageSlider from '$lib/components/severnaya/ImageSlider.svelte';
	import Button from '$lib/components/severnaya/Button.svelte';
	import Sparkles from '$lib/components/icons/Sparkles.svelte';
	import FloppyDisk from '$lib/components/icons/FloppyDisk.svelte';

	export let images: Array<{ src: string; alt?: string }> = [];
	export let title: string = ''; // generated_name
	export let kind: string = '';
	export let type: string = '';
	export let brand: string = '';
	export let article: string = '';
	export let description: string = '';
	export let specs: Record<string, string> = {}; // Характеристики
	export let status: string = ''; // Статус черновика: new, processing, ready_for_review, synced, error
	export let isProcessing: boolean = false; // Флаг для отображения loading состояния
	export let onGenerateTitle: (() => void) | null = null;
	// onSave принимает текущие значения полей формы и возвращает true если успешно
	export let onSave: ((data: {
		generated_name: string;
		kind: string;
		type: string;
		brand: string;
		article: string;
		description: string;
		specs: Record<string, string>;
	}) => Promise<boolean>) | null = null;
	export let loadingSave: boolean = false;
	export let loadingGenerateTitle: boolean = false;
	export let predictions: {
		gau?: { code: string; confidence: number };
		duplicates?: {
			count: number;
			last_checked_at?: string;
		};
	} | undefined = undefined;
	
	// Состояние сохранения
	let saved: boolean = false;
	let saving: boolean = false;
	
	// Состояние аккордиона specs
	let specsExpanded: boolean = false;
	
	// Форматирование даты последней проверки аналогов
	const formatLastChecked = (dateStr?: string): string => {
		if (!dateStr) return '';
		try {
			const date = new Date(dateStr);
			return date.toLocaleDateString('ru-RU', { 
				day: '2-digit', 
				month: '2-digit', 
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return dateStr;
		}
	};
	
	// Проверка, устарели ли данные об аналогах (нет данных или сброшены)
	$: duplicatesOutdated = predictions?.duplicates?.count === undefined || 
		predictions?.duplicates?.count === null ||
		!predictions?.duplicates?.last_checked_at;
	
	// Определяем, нужно ли показывать loading состояние
	$: showLoading = isProcessing || status === 'new' || status === 'processing' || status === 'queued';

	// Локальные значения для редактирования
	let titleValue = title;
	let kindValue = kind;
	let typeValue = type;
	let brandValue = brand;
	let articleValue = article;
	let descriptionValue = description;
	let specsValue: Record<string, string> = { ...specs };
	
	// Исходные значения для сравнения (обновляются только при загрузке и после сохранения)
	let originalTitle = title;
	let originalKind = kind;
	let originalType = type;
	let originalBrand = brand;
	let originalArticle = article;
	let originalDescription = description;
	let originalSpecs: Record<string, string> = { ...specs };
	
	// Флаг инициализации (чтобы не перезаписывать локальные значения после первой загрузки)
	let initialized = false;

	// Синхронизация с пропсами только при первой загрузке или смене draft_id
	$: if (!initialized && (title || kind || type || brand || article || description || Object.keys(specs).length > 0)) {
		titleValue = title;
		kindValue = kind;
		typeValue = type;
		brandValue = brand;
		articleValue = article;
		descriptionValue = description;
		specsValue = { ...specs };
		
		originalTitle = title;
		originalKind = kind;
		originalType = type;
		originalBrand = brand;
		originalArticle = article;
		originalDescription = description;
		originalSpecs = { ...specs };
		
		initialized = true;
		saved = false;
	}
	
	// Отслеживаем изменение title извне (после генерации названия)
	$: if (initialized && title && title !== originalTitle && title !== titleValue) {
		titleValue = title;
		originalTitle = title;
	}
	
	// Сравнение объектов specs
	const specsEqual = (a: Record<string, string>, b: Record<string, string>): boolean => {
		const keysA = Object.keys(a);
		const keysB = Object.keys(b);
		if (keysA.length !== keysB.length) return false;
		return keysA.every(key => a[key] === b[key]);
	};
	
	// Проверяем, были ли внесены изменения
	$: hasChanges = 
		titleValue !== originalTitle ||
		kindValue !== originalKind ||
		typeValue !== originalType ||
		brandValue !== originalBrand ||
		articleValue !== originalArticle ||
		descriptionValue !== originalDescription ||
		!specsEqual(specsValue, originalSpecs);

	$: {
		console.log('[DraftCard] Images:', images, 'length:', images?.length);
	}
	
	$: specsKeys = Object.keys(specsValue);
	
	// Обновить исходные значения после успешного сохранения
	const updateOriginalValues = () => {
		originalTitle = titleValue;
		originalKind = kindValue;
		originalType = typeValue;
		originalBrand = brandValue;
		originalArticle = articleValue;
		originalDescription = descriptionValue;
		originalSpecs = { ...specsValue };
	};

	const handleSave = async () => {
		if (onSave && !saving && hasChanges) {
			saving = true;
			try {
				// Передаём актуальные значения из формы
				const success = await onSave({
					generated_name: titleValue,
					kind: kindValue,
					type: typeValue,
					brand: brandValue,
					article: articleValue,
					description: descriptionValue,
					specs: specsValue
				});
				if (success) {
					// Обновляем исходные значения после успешного сохранения
					updateOriginalValues();
					saved = true;
					// Сбрасываем флаг saved через 3 секунды, чтобы кнопка снова появилась если будут новые изменения
					setTimeout(() => {
						saved = false;
					}, 3000);
				}
			} catch (e) {
				console.error('Error saving draft:', e);
			} finally {
				saving = false;
			}
		}
	};

	const handleGenerateTitleClick = () => {
		if (onGenerateTitle) {
			onGenerateTitle();
		} else {
			console.log('Generate title clicked');
		}
	};
	
	const updateSpecValue = (key: string, value: string) => {
		specsValue = { ...specsValue, [key]: value };
	};
	
	const addNewSpec = () => {
		const newKey = `spec_${Date.now()}`;
		specsValue = { ...specsValue, [newKey]: '' };
	};
	
	const removeSpec = (key: string) => {
		const { [key]: _, ...rest } = specsValue;
		specsValue = rest;
	};
	
	const updateSpecKey = (oldKey: string, newKey: string) => {
		if (oldKey === newKey || !newKey.trim()) return;
		const value = specsValue[oldKey];
		const { [oldKey]: _, ...rest } = specsValue;
		specsValue = { ...rest, [newKey]: value };
	};
</script>

<div
	class="mx-auto shadow-3xl min-w-fit min-h-fit scrollbar-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg border border-white dark:border-gray-850 max-w-[500px] overflow-hidden relative"
>
	{#if showLoading}
		<!-- Loading overlay -->
		<div class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
			<div class="relative">
				<div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
			</div>
			<p class="mt-4 text-gray-600 dark:text-gray-300 text-sm font-medium">
				Обработка черновика...
			</p>
			<p class="mt-1 text-gray-400 dark:text-gray-500 text-xs">
				Это может занять некоторое время
			</p>
		</div>
	{/if}

	{#if images && images.length > 0}
		<div class="w-full mx-auto flex justify-center">
			<ImageSlider {images} width={500} height={300} />
		</div>
	{/if}

	<!-- Форма-->
	<form class="p-3 flex flex-col gap-1" class:opacity-50={showLoading} class:pointer-events-none={showLoading}>
		<!-- Название товара (generated_name) -->
		<FormField
			id="title-input"
			label="Название товара"
			type="text"
			required={true}
			showButton={true}
			buttonIcon={Sparkles}
			onButtonClick={handleGenerateTitleClick}
			buttonLoading={loadingGenerateTitle}
			bind:value={titleValue}
		/>

		<!-- Основные поля -->
		<div class="grid grid-cols-2 gap-2">
			<FormField id="kind-input" label="Вид" type="text" bind:value={kindValue} />
			<FormField id="type-input" label="Тип" type="text" bind:value={typeValue} />
		</div>
		
		<div class="grid grid-cols-2 gap-2">
			<FormField id="brand-input" label="Бренд" type="text" bind:value={brandValue} />
			<FormField id="article-input" label="Артикул" type="text" bind:value={articleValue} />
		</div>

		<!-- Описание -->
		<div class="mt-2">
			<label for="description-input" class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
				Описание
			</label>
			<textarea
				id="description-input"
				bind:value={descriptionValue}
				rows="3"
				class="w-full px-4 py-2 text-sm text-gray-900 dark:text-gray-300 bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-850 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
				placeholder="Описание товара..."
			></textarea>
		</div>

		<!-- Характеристики (specs) - Аккордион -->
		{#if specsKeys.length > 0 || !showLoading}
			<div class="mt-3 border border-gray-100 dark:border-gray-850 rounded-lg overflow-hidden">
				<button
					type="button"
					on:click={() => specsExpanded = !specsExpanded}
					class="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
				>
					<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
						Характеристики
						{#if specsKeys.length > 0}
							<span class="text-gray-400 dark:text-gray-500 font-normal">({specsKeys.length})</span>
						{/if}
					</span>
					<svg 
						class="w-4 h-4 text-gray-500 transition-transform duration-200"
						class:rotate-180={specsExpanded}
						fill="none" 
						viewBox="0 0 24 24" 
						stroke="currentColor"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>
				
				{#if specsExpanded}
					<div class="p-3 space-y-2 bg-white dark:bg-gray-900/95">
						{#each specsKeys as key (key)}
							<div class="flex items-center gap-2">
								<input
									type="text"
									value={key}
									on:blur={(e) => updateSpecKey(key, e.currentTarget.value)}
									class="flex-1 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-300 bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-850 rounded-lg outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-600"
									placeholder="Название"
								/>
								<input
									type="text"
									value={specsValue[key]}
									on:input={(e) => updateSpecValue(key, e.currentTarget.value)}
									class="flex-[2] px-3 py-1.5 text-sm text-gray-900 dark:text-gray-300 bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-850 rounded-lg outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-600"
									placeholder="Значение"
								/>
								<button
									type="button"
									on:click={() => removeSpec(key)}
									class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
									title="Удалить"
								>
									<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						{/each}
						
						{#if specsKeys.length === 0}
							<p class="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
								Нет характеристик
							</p>
						{/if}
						
						<button
							type="button"
							on:click={addNewSpec}
							class="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
						>
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
							Добавить характеристику
						</button>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Predictions (классификация и аналоги) - временно скрыто -->
		<!--
		{#if predictions && !showLoading}
			<div class="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
				{#if predictions.gau}
					<div class="flex items-center justify-between text-sm">
						<span class="text-gray-600 dark:text-gray-400">Классификация (GAU):</span>
						<div class="flex items-center gap-2">
							<span class="font-mono font-medium text-gray-900 dark:text-gray-100">{predictions.gau.code}</span>
							<span class="text-xs px-1.5 py-0.5 rounded-full {predictions.gau.confidence >= 0.8 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : predictions.gau.confidence >= 0.5 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}">
								{Math.round(predictions.gau.confidence * 100)}%
							</span>
						</div>
					</div>
				{/if}
				
				<div class="flex items-center justify-between text-sm">
					<span class="text-gray-600 dark:text-gray-400">Аналоги:</span>
					{#if duplicatesOutdated}
						<span class="flex items-center gap-1 text-amber-600 dark:text-amber-400">
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
							<span class="text-xs">Требуется проверка</span>
						</span>
					{:else}
						<div class="flex items-center gap-2">
							<span class="font-medium text-gray-900 dark:text-gray-100">
								{predictions.duplicates?.count || 0}
							</span>
							{#if predictions.duplicates?.last_checked_at}
								<span class="text-xs text-gray-400 dark:text-gray-500">
									{formatLastChecked(predictions.duplicates.last_checked_at)}
								</span>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{/if}
		-->

		<!-- Кнопка сохранения -->
		<div class="mt-4 flex justify-between">
			{#if saved}
				<div class="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
					</svg>
					<span>Изменения сохранены</span>
				</div>
			{:else}
				<Button
					variant="primary"
					icon={FloppyDisk}
					iconPosition="left"
					loading={saving || loadingSave}
					disabled={!hasChanges}
					on:click={handleSave}
				>
					Сохранить изменения
				</Button>
			{/if}
		</div>
	</form>
</div>
