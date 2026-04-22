<script lang="ts">
  type ParsedMixtureTotalMass = { kind: 'invalid' } | { kind: 'mass'; grams: number } | null;
  type MixtureMassEntry = {
    id: string;
    name: string;
    grams: number | null;
    isSolved: boolean;
  };

  let {
    visible = false,
    mixtureTotalMassInput = $bindable(''),
    parsedMixtureTotalMass,
    mixtureMassBreakdown,
    mixturePercentageDenominator,
    totalKnownCompoundMass,
    formatAmount,
    formatPercent
  }: {
    visible: boolean;
    mixtureTotalMassInput: string;
    parsedMixtureTotalMass: ParsedMixtureTotalMass;
    mixtureMassBreakdown: MixtureMassEntry[];
    mixturePercentageDenominator: number | null;
    totalKnownCompoundMass: number;
    formatAmount: (value: number, maximumFractionDigits?: number) => string;
    formatPercent: (percent: number) => string;
  } = $props();
</script>

{#if visible}
  <div class="fixed right-4 bottom-4 z-50 w-md max-w-[calc(100vw-2rem)] space-y-2 rounded-md border border-slate-200 bg-white p-3 shadow-lg">
    <p class="text-sm font-medium text-slate-800">Mixture Calculator</p>
    <input
      type="text"
      bind:value={mixtureTotalMassInput}
      placeholder="Total mixture mass, e.g. 1.05 g or 0.2 kg"
      class="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm"
    />
    {#if parsedMixtureTotalMass?.kind === 'invalid'}
      <p class="text-sm text-red-600">Use a mass value with g/kg (e.g. `100 g` or `0.2 kg`).</p>
    {/if}
    <ul class="text-sm text-slate-700">
      {#each mixtureMassBreakdown as entry (entry.id)}
        <li>
          <span class="font-medium">{entry.name}:</span>
          {#if entry.grams === null}
            -
          {:else}
            <span class={entry.isSolved ? 'font-medium text-blue-700' : ''}>
              {formatAmount(entry.grams)} g
            </span>
            {#if mixturePercentageDenominator && mixturePercentageDenominator > 0}
              ({formatPercent((entry.grams / mixturePercentageDenominator) * 100)}%)
            {/if}
          {/if}
        </li>
      {/each}
    </ul>
    {#if parsedMixtureTotalMass?.kind === 'mass'}
      <p class="text-sm text-slate-700">
        Total mixture mass: <span class="font-medium">{formatAmount(parsedMixtureTotalMass.grams)} g</span>
      </p>
    {:else if totalKnownCompoundMass > 0}
      <p class="text-sm text-slate-700">
        Total known compound mass: <span class="font-medium">{formatAmount(totalKnownCompoundMass)} g</span>
      </p>
    {/if}
  </div>
{/if}
