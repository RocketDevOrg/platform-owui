<script lang="ts">
	// @ts-ignore - swiper types not available
	import { Navigation, Pagination, A11y } from 'swiper';
	// @ts-ignore - swiper types not available
	import { Swiper, SwiperSlide } from 'swiper/svelte';
	// Импорт базовых стилей Swiper
	import 'swiper/css';
	import 'swiper/css/navigation';
	import 'swiper/css/pagination';

	export let images: Array<{ src: string; alt?: string }> = [];
	export let width: number = 400;
	export let height: number = 300;
	export let showNavigation: boolean = true;
	export let showPagination: boolean = true;

	let swiper: any = null;

	$: {
		console.log('[ImageSlider] Images received:', images, 'length:', images?.length);
	}
</script>

{#if images && images.length > 0}
	<div class="w-full severnaya-image-slider h-full" style="max-width: {width}px; height: {height}px;">
		<Swiper
			modules={[Navigation, Pagination, A11y]}
			slidesPerView={1}
			spaceBetween={0}
			navigation={showNavigation && images.length > 1}
			pagination={showPagination && images.length > 1 ? { clickable: true } : false}
			loop={images.length > 1}
			on:swiper={(e: any) => {
				swiper = e.detail[0];
			}}
		>
			{#each images as image}
				<SwiperSlide>
					<div class="w-full h-full" style="height: {height}px; overflow: hidden;">
						<img
							src={image.src}
							alt={image.alt || ''}
							width={width}
							height={height}
							class="w-full h-full object-cover"
							loading="lazy"
						/>
					</div>
				</SwiperSlide>
			{/each}
		</Swiper>
	</div>
{:else}
	<div class="w-full flex items-center justify-center" style="height: {height}px; background: #f3f4f6;">
		<span class="text-gray-400 text-sm">Нет изображений</span>
	</div>
{/if}

<style>
	:global(.severnaya-image-slider) {
		position: relative;
	}

	:global(.severnaya-image-slider .swiper) {
		width: 100%;
		height: 100%;
	}

	:global(.severnaya-image-slider .swiper-wrapper) {
		height: 100%;
	}

	:global(.severnaya-image-slider .swiper-slide) {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.severnaya-image-slider .swiper-button-next),
	:global(.severnaya-image-slider .swiper-button-prev) {
		width: 32px;
		height: 32px;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 50%;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		z-index: 10;
	}

	:global(.severnaya-image-slider .swiper-button-next::after),
	:global(.severnaya-image-slider .swiper-button-prev::after) {
		font-size: 14px;
		color: #1f2937;
		font-weight: 700;
	}

	:global(.severnaya-image-slider .swiper-button-next:hover),
	:global(.severnaya-image-slider .swiper-button-prev:hover) {
		background: rgba(255, 255, 255, 1);
	}

	:global(.dark .severnaya-image-slider .swiper-button-next),
	:global(.dark .severnaya-image-slider .swiper-button-prev) {
		background: rgba(55, 65, 81, 0.9);
	}

	:global(.dark .severnaya-image-slider .swiper-button-next::after),
	:global(.dark .severnaya-image-slider .swiper-button-prev::after) {
		color: #f9fafb;
	}

	:global(.dark .severnaya-image-slider .swiper-button-next:hover),
	:global(.dark .severnaya-image-slider .swiper-button-prev:hover) {
		background: rgba(75, 85, 99, 1);
	}

	:global(.severnaya-image-slider .swiper-pagination) {
		bottom: 10px !important;
	}

	:global(.severnaya-image-slider .swiper-pagination-bullet) {
		width: 8px;
		height: 8px;
		background: rgba(255, 255, 255, 0.8);
		opacity: 1;
		margin: 0 4px;
	}

	:global(.severnaya-image-slider .swiper-pagination-bullet-active) {
		background: #1f2937;
	}

	:global(.dark .severnaya-image-slider .swiper-pagination-bullet) {
		background: rgba(255, 255, 255, 0.6);
	}

	:global(.dark .severnaya-image-slider .swiper-pagination-bullet-active) {
		background: #f9fafb;
	}
</style>
