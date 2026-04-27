<script lang="ts" >
  import { elementByAtomicNumber } from '$lib/elements';
  import type { Compound } from '$lib/types/compound.svelte';

  let {
    compound = $bindable<Compound>()
  }: {
    compound: Compound;
  } = $props();
</script>
<span>
{#key compound.elements}
{#each compound.elements.entries() as [atomicNumber, component]}
  {@const symbol = elementByAtomicNumber.get(atomicNumber)?.symbol}
  {#if symbol}
    {symbol}{#if component.count > 1}<sub>{component.count}</sub>{/if}
  {/if}
{/each}
{/key}
</span>