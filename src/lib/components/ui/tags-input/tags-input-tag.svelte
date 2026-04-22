<script lang="ts">
	import XIcon from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';

	type Props = {
		value: string;
		onRender?: Snippet<[value: string]>;
		disabled: boolean | null;
		active: boolean;
		onDelete: (value: string) => void;
	};

	let { value, disabled, onDelete, active, onRender }: Props = $props();
</script>

<div
	class="bg-secondary ring-offset-background hover:bg-secondary/90 aria-selected:bg-secondary/90 aria-selected:ring-ring 
	relative flex place-items-center rounded-md py-0.5 pr-8 pl-2 transition-all hover:cursor-default aria-selected:ring-2 
	"
	aria-selected={active}
>
	<span>
		{#if onRender}
			{@render onRender(value)}
		{:else}
			{value}
		{/if}
	</span>
	<button
		type="button"
		{disabled}
		onclick={() => onDelete(value)}
		class="hover:bg-slate-200 absolute top-2 right-0 -translate-y-1/2 rounded-md p-1"
	>
		<XIcon class="size-4" />
	</button>
</div>
