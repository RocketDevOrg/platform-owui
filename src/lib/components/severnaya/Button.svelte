<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let disabled: boolean = false;
	export let loading: boolean = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let icon: any = null;
	export let iconPosition: 'left' | 'right' = 'left';
	export let fullWidth: boolean = false;

	let buttonClasses = '';

	$: {
		const baseClasses = 'font-medium transition rounded-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap';
		
		const sizeClasses = {
			sm: 'px-3 py-1.5 text-xs',
			md: 'px-3.5 py-1.5 text-sm',
			lg: 'px-4 py-2 text-base'
		};

		const variantClasses = {
			primary: 'bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100',
			secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-white',
			ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300'
		};

		const widthClass = fullWidth ? 'w-full' : '';

		buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass}`;
	}

	const iconSize = 'size-4';
</script>

<button
	{type}
	disabled={disabled || loading}
	class={buttonClasses}
	on:click
>
	{#if loading || (icon && iconPosition === 'left')}
		<div class="flex items-center justify-center {iconSize} shrink-0">
			{#if loading}
				<svg
					class={iconSize}
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
			{:else if icon && iconPosition === 'left'}
				<svelte:component this={icon} className={iconSize} />
			{/if}
		</div>
	{/if}

	<slot />

	{#if icon && iconPosition === 'right' && !loading}
		<div class="flex items-center justify-center {iconSize} shrink-0">
			<svelte:component this={icon} className={iconSize} />
		</div>
	{/if}
</button>

