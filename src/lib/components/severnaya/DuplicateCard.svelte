<script lang="ts">
	import Badge from '$lib/components/common/Badge.svelte';

	export let name: string = '';
	export let matchType: 'duplicate' | 'analog' | 'related' = 'duplicate';
	export let score: number = 0;
	export let refKey: string = '';
	export let imageUrl: string | null = null;

	const matchTypeLabels = {
		duplicate: 'Дубликат',
		analog: 'Аналог',
		related: 'Связанный'
	};

	const matchTypeBadgeTypes = {
		duplicate: 'error',
		analog: 'warning',
		related: 'info'
	};

	$: badgeType = matchTypeBadgeTypes[matchType] || 'info';
	$: badgeLabel = matchTypeLabels[matchType] || matchType;
	$: scorePercent = Math.round(score * 100);
</script>

<div
	class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
>
	<div class="flex items-start gap-3">
		{#if imageUrl}
			<div class="shrink-0">
				<img
					src={imageUrl}
					alt={name}
					class="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
				/>
			</div>
		{/if}
		<div class="flex-1 min-w-0">
			<div class="flex items-start justify-between gap-3 mb-2">
				<h3 class="font-medium text-gray-900 dark:text-gray-100 text-sm line-clamp-2 flex-1">
					{name}
				</h3>
				<Badge type={badgeType} content={badgeLabel} />
			</div>

			<div class="flex items-center gap-2 mb-2">
				<span class="text-xs text-gray-600 dark:text-gray-400">Score: {score.toFixed(2)}</span>
				<div class="flex-1 max-w-[120px]">
					<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
						<div
							class="bg-blue-500 dark:bg-blue-400 h-1.5 rounded-full transition-all"
							style="width: {scorePercent}%"
						></div>
					</div>
				</div>
			</div>

			{#if refKey}
				<div class="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">
					{refKey}
				</div>
			{/if}
		</div>
	</div>
</div>

