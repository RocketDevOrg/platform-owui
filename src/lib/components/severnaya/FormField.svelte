<script lang="ts">
	export let id: string = '';
	export let label: string;
	export let type: string = 'text';
	export let required: boolean = false;
	export let value: string = '';
	export let placeholder: string = '';
	export let disabled: boolean = false;
	export let error: string = '';
	export let showButton: boolean = false;
	export let buttonIcon: any = null;
	export let onButtonClick: (() => void) | null = null;
	export let buttonLoading: boolean = false;

	let inputId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
</script>

<div class="mb-3">
	<label
		for={inputId}
		class="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300 text-left"
	>
		{label}
		{#if required}
			<span class="text-red-500">*</span>
		{/if}
	</label>
	<div class="flex items-stretch">
		<input
			id={inputId}
			{type}
			bind:value
			{placeholder}
			{disabled}
			class="w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100 dark:border-gray-850 bg-white text-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors {error
				? 'border-red-500 dark:border-red-500'
				: ''} {showButton
				? 'rounded-r-none border-r-0'
				: ''}"
		/>
		{#if showButton && buttonIcon && onButtonClick}
			<button
				type="button"
				on:click={onButtonClick}
				class="flex items-center justify-center px-3 rounded-r-lg border border-l-0 border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-550 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
				disabled={disabled || buttonLoading}
			>
				{#if buttonLoading}
					<svg
						class="size-4"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
					>
						<style>
							.spinner_ajPY {
								transform-origin: center;
								animation: spinner_AtaB 0.75s infinite linear;
							}

							@keyframes spinner_AtaB {
								100% {
									transform: rotate(360deg);
								}
							}
						</style>
						<path
							d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
							opacity=".25"
						/>
						<path
							d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
							class="spinner_ajPY"
						/>
					</svg>
				{:else}
					<svelte:component this={buttonIcon} className="size-4 text-gray-700 dark:text-gray-300" />
				{/if}
			</button>
		{/if}
	</div>
	{#if error}
		<div class="mt-1 text-xs text-red-600 dark:text-red-400">{error}</div>
	{/if}
</div>
