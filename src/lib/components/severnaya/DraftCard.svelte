<script lang="ts">
	import FormField from '$lib/components/severnaya/FormField.svelte';
	import ImageSlider from '$lib/components/severnaya/ImageSlider.svelte';
	import Button from '$lib/components/severnaya/Button.svelte';
	import Sparkles from '$lib/components/icons/Sparkles.svelte';
	import FloppyDisk from '$lib/components/icons/FloppyDisk.svelte';

	export let images: Array<{ src: string; alt?: string }> = [];
	export let title: string = '';
	export let source: string = '';
	export let kind: string = '';
	export let type: string = '';
	export let brand: string = '';
	export let article: string = '';
	export let status: string = ''; // Статус черновика: new, processing, ready_for_review, synced, error
	export let isProcessing: boolean = false; // Флаг для отображения loading состояния
	export let onGenerateTitle: (() => void) | null = null;
	export let onSave: (() => void) | null = null;
	export let onSendTo1C: (() => void) | null = null;
	export let loadingSave: boolean = false;
	export let loadingSendTo1C: boolean = false;
	export let loadingGenerateTitle: boolean = false;
	
	// Определяем, нужно ли показывать loading состояние
	$: showLoading = isProcessing || status === 'new' || status === 'processing';

	let titleValue = title;
	let sourceValue = source;
	let kindValue = kind;
	let typeValue = type;
	let brandValue = brand;
	let articleValue = article;

	$: {
		titleValue = title;
		sourceValue = source;
		kindValue = kind;
		typeValue = type;
		brandValue = brand;
		articleValue = article;
	}

	$: {
		console.log('[DraftCard] Images:', images, 'length:', images?.length);
	}

	const handleSave = () => {
		if (onSave) {
			onSave();
		} else {
			console.log('Save changes clicked');
		}
	};

	const handleSendTo1C = () => {
		if (onSendTo1C) {
			onSendTo1C();
		} else {
			console.log('Отправка черновика в 1С');
		}
	};

	const handleGenerateTitleClick = () => {
		if (onGenerateTitle) {
			onGenerateTitle();
		} else {
			console.log('Generate title clicked');
		}
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
				Processing draft...
			</p>
			<p class="mt-1 text-gray-400 dark:text-gray-500 text-xs">
				This may take a moment
			</p>
		</div>
	{/if}

	{#if images && images.length > 0}
		<div class="w-full mx-auto flex justify-center">
			<ImageSlider {images} width={500} height={300} />
		</div>
	{/if}

	<!-- Форма-->
	<form class="p-3 flex flex-col" class:opacity-50={showLoading} class:pointer-events-none={showLoading}>
		<!-- Основные поля формы -->
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

		<FormField id="source-input" label="Источник" type="text" bind:value={sourceValue} />

		<FormField id="kind-input" label="Вид номенклатуры" type="text" bind:value={kindValue} />

		<FormField id="type-input" label="Тип / категория" type="text" bind:value={typeValue} />

		<FormField
			id="brand-input"
			label="Бренд / производитель"
			type="text"
			bind:value={brandValue}
		/>

		<FormField
			id="article-input"
			label="Артикул поставщика"
			type="text"
			bind:value={articleValue}
		/>

		<div class="mt-4 flex justify-between">
			<Button
				variant="primary"
				icon={FloppyDisk}
				iconPosition="left"
				loading={loadingSave}
				on:click={handleSave}
			>
				Сохранить изменения
			</Button>
			<Button
				variant="secondary"
				icon={FloppyDisk}
				iconPosition="left"
				loading={loadingSendTo1C}
				on:click={handleSendTo1C}
			>
				Отправка черновика в 1С
			</Button>
		</div>
	</form>
</div>

