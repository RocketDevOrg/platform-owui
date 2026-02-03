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
	
	// Состояние сохранения - после успешного сохранения скрываем кнопку
	let saved: boolean = false;
	let saving: boolean = false;
	
	// Состояние аккордиона specs
	let specsExpanded: boolean = false;
	
	// Определяем, нужно ли показывать loading состояние
	$: showLoading = isProcessing || status === 'new' || status === 'processing';

	// Локальные значения для редактирования
	let titleValue = title;
	let kindValue = kind;
	let typeValue = type;
	let brandValue = brand;
	let articleValue = article;
	let descriptionValue = description;
	let specsValue: Record<string, string> = { ...specs };

	// Синхронизация с пропсами
	$: {
		titleValue = title;
		kindValue = kind;
		typeValue = type;
		brandValue = brand;
		articleValue = article;
		descriptionValue = description;
		specsValue = { ...specs };
	}

	$: {
		console.log('[DraftCard] Images:', images, 'length:', images?.length);
	}
	
	$: specsKeys = Object.keys(specsValue);

	const handleSave = async () => {
		if (onSave && !saving && !saved) {
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
					saved = true;
				}
			} catch (e) {
				console.error('Error saving draft:', e);
			} finally {
				saving = false;
			}
		} else {
			console.log('Save changes clicked');
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

		<!-- Кнопка сохранения -->
		<div class="mt-4 flex justify-between">
			{#if !saved}
				<Button
					variant="primary"
					icon={FloppyDisk}
					iconPosition="left"
					loading={saving || loadingSave}
					on:click={handleSave}
				>
					Сохранить изменения
				</Button>
			{:else}
				<div class="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
					</svg>
					<span>Изменения сохранены</span>
				</div>
			{/if}
		</div>
	</form>
</div>
