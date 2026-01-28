<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import DraftCard from './DraftCard.svelte';
	import Button from './Button.svelte';
	import Document from '$lib/components/icons/Document.svelte';
	import Search from '$lib/components/icons/Search.svelte';
	import Sparkles from '$lib/components/icons/Sparkles.svelte';
	import XMark from '$lib/components/icons/XMark.svelte';
	import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
	import { WEBUI_BASE_URL } from '$lib/constants';

	// Флаг для продакшена: показывать всегда (true) или только при первом показе (false)
	// В продакшене установить в false и использовать localStorage для отслеживания
	const SHOW_ALWAYS = false;

	export let onClose: (() => void) | null = null;
	export let userId: string | null = null; // ID пользователя для отслеживания показа оверлея

	let showOverlay = false;
	let currentStep = 0; // 0 - варианты использования, 1 - пример виджета
	let generatingTitle = false;
	let demoTitle = 'Компьютерная мышь Logitech MX Master 3S';
	
	// Моковые изображения из ассетов
	const demoImages: Array<{ src: string; alt: string }> = [
		{
			src: `${WEBUI_BASE_URL}/assets/images/adam.jpg`,
			alt: 'Logitech MX Master 3S - вид спереди'
		},
		{
			src: `${WEBUI_BASE_URL}/assets/images/earth.jpg`,
			alt: 'Logitech MX Master 3S - вид сбоку'
		},
		{
			src: `${WEBUI_BASE_URL}/assets/images/galaxy.jpg`,
			alt: 'Logitech MX Master 3S - вид сверху'
		}
	];

	const demoData = {
		images: demoImages,
		title: demoTitle,
		source: 'https://example.com/product',
		kind: 'Товар',
		type: 'Компьютерная периферия',
		brand: 'Logitech',
		article: 'MX-MASTER-3S'
	};

	onMount(() => {
		// Проверяем, нужно ли показывать оверлей
		if (SHOW_ALWAYS) {
			// Пока показываем всегда (для тестирования)
			showOverlay = true;
		} else {
			// В продакшене: проверяем localStorage с привязкой к пользователю
			if (userId) {
				const storageKey = `severnaya_onboarding_seen_${userId}`;
				const hasSeenOnboarding = localStorage.getItem(storageKey);
				if (!hasSeenOnboarding) {
					showOverlay = true;
				}
			} else {
				// Если userId не передан, используем общий ключ
				const hasSeenOnboarding = localStorage.getItem('severnaya_onboarding_seen');
				if (!hasSeenOnboarding) {
					showOverlay = true;
				}
			}
		}
	});

	const handleClose = () => {
		showOverlay = false;
		// В продакшене: сохраняем флаг, что пользователь видел оверлей
		if (!SHOW_ALWAYS) {
			if (userId) {
				const storageKey = `severnaya_onboarding_seen_${userId}`;
				localStorage.setItem(storageKey, 'true');
			} else {
				localStorage.setItem('severnaya_onboarding_seen', 'true');
			}
		}
		if (onClose) {
			onClose();
		}
	};

	const handleGenerateTitle = async () => {
		generatingTitle = true;
		// Имитация генерации названия
		await new Promise((resolve) => setTimeout(resolve, 1500));
		demoTitle = 'Беспроводная компьютерная мышь Logitech MX Master 3S для работы и творчества';
		generatingTitle = false;
	};

	const handleSave = () => {
		console.log('Save demo draft');
	};

	const handleSendTo1C = () => {
		console.log('Send to 1C demo');
	};

	const handleNextStep = () => {
		if (currentStep === 0) {
			currentStep = 1;
		}
	};

	const handlePrevStep = () => {
		if (currentStep === 1) {
			currentStep = 0;
		}
	};
</script>

{#if showOverlay}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		transition:fade={{ duration: 300 }}
		role="dialog"
		aria-modal="true"
		aria-labelledby="onboarding-title"
	>
		<div
			class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto scrollbar-thin"
			transition:fly={{ y: 20, duration: 300 }}
		>
			<!-- Header -->
			<div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
				<h2 id="onboarding-title" class="text-xl font-semibold text-gray-900 dark:text-gray-100">
					Добро пожаловать в Северная ИИ
				</h2>
				<button
					type="button"
					on:click={handleClose}
					class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
					aria-label="Закрыть"
				>
					<XMark className="size-5 text-gray-500 dark:text-gray-400" />
				</button>
			</div>

			<!-- Content -->
			<div class="p-6 space-y-6">
				{#if currentStep === 0}
					<!-- Шаг 1: Варианты использования -->
					<div class="space-y-6">
						<div class="text-center space-y-2">
							<h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
								Два способа работы с системой
							</h3>
							<p class="text-gray-600 dark:text-gray-400">
								Выберите действие в поле ввода сообщения
							</p>
						</div>

						<div class="grid md:grid-cols-2 gap-6">
							<!-- Создание карточки -->
							<div
								class="p-6 rounded-xl border-2 border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-900/20 hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
							>
								<div class="flex items-center gap-3 mb-4">
									<div
										class="p-3 rounded-lg bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400"
									>
										<Document className="size-6" strokeWidth="2" />
									</div>
									<h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
										Создать карточку
									</h4>
								</div>
								<p class="text-gray-700 dark:text-gray-300 mb-4">
									Создайте черновик карточки товара из текста, URL или файла. Система автоматически
									извлечет данные и создаст структурированную карточку.
								</p>
								<ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
									<li class="flex items-start gap-2">
										<span class="text-sky-500 mt-1">•</span>
										<span>Введите описание товара или URL</span>
									</li>
									<li class="flex items-start gap-2">
										<span class="text-sky-500 mt-1">•</span>
										<span>Загрузите файл с информацией о товаре</span>
									</li>
									<li class="flex items-start gap-2">
										<span class="text-sky-500 mt-1">•</span>
										<span>Система создаст черновик для редактирования</span>
									</li>
								</ul>
							</div>

							<!-- Поиск аналогов -->
							<div
								class="p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
							>
								<div class="flex items-center gap-3 mb-4">
									<div
										class="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
									>
										<Search className="size-6" strokeWidth="2" />
									</div>
									<h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
										Поиск аналогов
									</h4>
								</div>
								<p class="text-gray-700 dark:text-gray-300 mb-4">
									Найдите дубли и аналоги товара в базе данных. Система проанализирует описание и
									найдет похожие товары.
								</p>
								<ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
									<li class="flex items-start gap-2">
										<span class="text-purple-500 mt-1">•</span>
										<span>Введите описание товара для поиска</span>
									</li>
									<li class="flex items-start gap-2">
										<span class="text-purple-500 mt-1">•</span>
										<span>Загрузите файл с информацией о товаре</span>
									</li>
									<li class="flex items-start gap-2">
										<span class="text-purple-500 mt-1">•</span>
										<span>Получите список найденных аналогов и дублей</span>
									</li>
								</ul>
							</div>
						</div>

						<!-- Инструкция -->
						<div
							class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
						>
							<p class="text-sm text-gray-700 dark:text-gray-300">
								<span class="font-semibold">Как использовать:</span> В поле ввода сообщения выберите
								действие с помощью кнопок "Создать карточку" или "Поиск аналогов", затем введите текст
								или загрузите файл и нажмите "Отправить".
							</p>
						</div>
					</div>
				{:else if currentStep === 1}
					<!-- Шаг 2: Пример виджета -->
					<div class="space-y-6">
						<div class="text-center space-y-2">
							<h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
								Пример виджета карточки товара
							</h3>
							<p class="text-gray-600 dark:text-gray-400">
								После создания карточки вы увидите интерактивный виджет для редактирования
							</p>
						</div>

						<!-- Демо виджет -->
						<div class="flex justify-center">
							<DraftCard
								images={demoData.images}
								title={demoTitle}
								source={demoData.source}
								kind={demoData.kind}
								type={demoData.type}
								brand={demoData.brand}
								article={demoData.article}
								onGenerateTitle={handleGenerateTitle}
								onSave={handleSave}
								onSendTo1C={handleSendTo1C}
								loadingGenerateTitle={generatingTitle}
								loadingSave={false}
								loadingSendTo1C={false}
							/>
						</div>

						<!-- Описание функций -->
						<div class="grid md:grid-cols-3 gap-4">
							<div
								class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
							>
								<div class="flex items-center gap-2 mb-2">
									<Sparkles className="size-5 text-sky-500" strokeWidth="2" />
									<h4 class="font-semibold text-gray-900 dark:text-gray-100">Генерация названия</h4>
								</div>
								<p class="text-sm text-gray-600 dark:text-gray-400">
									Нажмите кнопку с иконкой <Sparkles className="size-4 inline" strokeWidth="2" /> рядом с
									полем "Название товара" для автоматической генерации названия на основе данных карточки.
								</p>
							</div>

							<div
								class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
							>
								<div class="flex items-center gap-2 mb-2">
									<Document className="size-5 text-green-500" strokeWidth="2" />
									<h4 class="font-semibold text-gray-900 dark:text-gray-100">Редактирование</h4>
								</div>
								<p class="text-sm text-gray-600 dark:text-gray-400">
									Все поля карточки можно редактировать. После внесения изменений нажмите "Сохранить
									изменения" для обновления черновика.
								</p>
							</div>

							<div
								class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
							>
								<div class="flex items-center gap-2 mb-2">
									<ArrowRight className="size-5 text-purple-500" strokeWidth="2" />
									<h4 class="font-semibold text-gray-900 dark:text-gray-100">Отправка в 1С</h4>
								</div>
								<p class="text-sm text-gray-600 dark:text-gray-400">
									После заполнения всех необходимых полей нажмите "Отправить в 1С" для синхронизации
									карточки с системой учета.
								</p>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div
				class="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10"
			>
				<div class="flex items-center gap-2">
					{#if currentStep > 0}
						<Button variant="ghost" size="sm" on:click={handlePrevStep}>
							Назад
						</Button>
					{/if}
				</div>

				<div class="flex items-center gap-2">
					<!-- Индикатор шагов -->
					<div class="flex items-center gap-2">
						<div
							class="size-2 rounded-full transition-colors {currentStep === 0
								? 'bg-sky-500'
								: 'bg-gray-300 dark:bg-gray-600'}"
						></div>
						<div
							class="size-2 rounded-full transition-colors {currentStep === 1
								? 'bg-sky-500'
								: 'bg-gray-300 dark:bg-gray-600'}"
						></div>
					</div>
				</div>

				<div class="flex items-center gap-2">
					{#if currentStep < 1}
						<Button variant="primary" size="sm" on:click={handleNextStep}>
							Далее
						</Button>
					{:else}
						<Button variant="primary" size="sm" on:click={handleClose}>
							Начать работу
						</Button>
					{/if}
					<Button variant="ghost" size="sm" on:click={handleClose}>
						Пропустить
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(.scrollbar-thin) {
		scrollbar-width: thin;
		scrollbar-color: rgb(203 213 225) transparent;
	}

	:global(.dark .scrollbar-thin) {
		scrollbar-color: rgb(55 65 81) transparent;
	}

	:global(.scrollbar-thin::-webkit-scrollbar) {
		width: 6px;
	}

	:global(.scrollbar-thin::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(.scrollbar-thin::-webkit-scrollbar-thumb) {
		background-color: rgb(203 213 225);
		border-radius: 3px;
	}

	:global(.dark .scrollbar-thin::-webkit-scrollbar-thumb) {
		background-color: rgb(55 65 81);
	}
</style>

