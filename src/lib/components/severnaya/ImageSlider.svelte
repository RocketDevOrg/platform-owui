<script lang="ts">
	// @ts-ignore - swiper types not available
	import { Navigation, Pagination, A11y } from 'swiper';
	// @ts-ignore - swiper types not available
	import { Swiper, SwiperSlide } from 'swiper/svelte';

	export let images: Array<{ src: string; alt?: string }> = [];
	export let width: number = 400;
	export let height: number = 300;
	export let showNavigation: boolean = true;
	export let showPagination: boolean = true;

	let swiper: any = null;
</script>

<div class="w-full severnaya-image-slider" style="max-width: {width}px;">
	<Swiper
		modules={[Navigation, Pagination, A11y]}
		slidesPerView={1}
		navigation={showNavigation}
		pagination={showPagination ? { clickable: true } : false}
		on:swiper={(e: any) => {
			swiper = e.detail[0];
		}}
	>
		{#each images as image}
			<SwiperSlide>
				<div class="w-full" style="height: {height}px; overflow: hidden;">
					<img
						src={image.src}
						alt={image.alt || ''}
						width={width}
						height={height}
						class="w-full h-full object-cover"
					/>
				</div>
			</SwiperSlide>
		{/each}
	</Swiper>
</div>

<style>
	:global(.severnaya-image-slider .swiper-button-next),
	:global(.severnaya-image-slider .swiper-button-prev) {
		width: 32px;
		height: 32px;
		background: #dbdbdb;
		border-radius: 50%;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	:global(.severnaya-image-slider .swiper-button-next::after),
	:global(.severnaya-image-slider .swiper-button-prev::after) {
		font-size: 14px;
		color: black;
		font-weight: 700;
	}

	:global(.severnaya-image-slider .swiper-button-next:hover),
	:global(.severnaya-image-slider .swiper-button-prev:hover) {
		background: #f8f9fa;
	}

	:global(.dark .severnaya-image-slider .swiper-button-next:hover),
	:global(.dark .severnaya-image-slider .swiper-button-prev:hover) {
		background: #e9ecef;
	}

	:global(.severnaya-image-slider .swiper-pagination-bullet) {
		width: 8px;
		height: 8px;
		background: white;
		opacity: 1;
	}

	:global(.severnaya-image-slider .swiper-pagination-bullet-active) {
		background: black;
	}

	:global(.dark .severnaya-image-slider .swiper-pagination-bullet) {
		background: white;
	}

	:global(.dark .severnaya-image-slider .swiper-pagination-bullet-active) {
		background: black;
	}
</style>
