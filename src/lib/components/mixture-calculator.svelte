<script lang="ts">
  import CompoundText from './CompoundText.svelte';
  import type { AmountBreakdownEntry, Compound } from '$lib/types/compound.svelte';

  type ParsedMixtureTotalMass = { kind: 'invalid' } | { kind: 'mass'; grams: number } | null;
  type MixtureMassEntry = {
    id: string;
    name: string;
    compound: Compound | null;
    grams: number | null;
    moles: number | null;
    formulaUnits: number | null;
    atomCount: number | null;
    isSolved: boolean;
    amountBreakdown: AmountBreakdownEntry[];
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
  const AVOGADRO_CONSTANT = 6.02214076e23;
  const formatScientific = (value: number, sigFigs = 3) => {
    if (!Number.isFinite(value) || value === 0) return '0 X 10^0';
    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const coefficient = value / 10 ** exponent;
    return `${Number(coefficient.toPrecision(sigFigs))} X 10^${exponent}`;
  };
</script>

{#if visible}
  <div class="fixed right-4 bottom-4 z-50 w-md max-w-[calc(100vw-2rem)] space-y-2 rounded-md border border-slate-200 bg-white p-3 shadow-lg">
    <p class="text-md font-medium text-slate-800">Mixture Calculator</p>
    <p class="text-sm text-slate-800">enter total mass of mixture to calculate individual compound masses</p>
    <p class="text-xs text-slate-600">FU = formula units (one displayed chemical formula).</p>
    <input
      type="text"
      bind:value={mixtureTotalMassInput}
      placeholder="Total mixture mass, e.g. 1.05 g, 200 mg, or 0.2 kg"
      class="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm"
    />
    {#if parsedMixtureTotalMass?.kind === 'invalid'}
      <p class="text-sm text-red-600">Use a mass value with mg/g/kg (e.g. `250 mg`, `100 g`, or `0.2 kg`).</p>
    {/if}
    <ul class="space-y-2 text-sm text-slate-700">
      {#each mixtureMassBreakdown as entry (entry.id)}
        <li class="rounded border border-slate-200 p-2">
          <span class="font-medium">
            {#if entry.compound && entry.compound.elements.size > 0}
              <CompoundText compound={entry.compound} />
            {:else}
              {entry.name}
            {/if}
            :
          </span>
          {#if entry.grams === null}
            -
          {:else}
            <div class={"text-xs " + (entry.isSolved ? 'font-medium text-blue-700' : 'text-slate-700')}>
              mass: {formatAmount(entry.grams)} g
              |
              n: {entry.moles !== null ? `${formatAmount(entry.moles)} mol` : '-'}
              |
              FU: {entry.formulaUnits !== null ? formatScientific(entry.formulaUnits) : '-'}
              |
              %: {mixturePercentageDenominator && mixturePercentageDenominator > 0
                ? `${formatPercent((entry.grams / mixturePercentageDenominator) * 100)}%`
                : '-'}
              |
              atoms: {entry.atomCount !== null ? formatScientific(entry.atomCount) : '-'}
            </div>
          {/if}
          {#if entry.amountBreakdown.length > 0}
            <div class="mt-1 text-xs text-slate-600">
              Amount by element:
              <ul class="font-medium">
                {#each entry.amountBreakdown as part, i (part.symbol)}
                  <li>
                    {part.symbol}: {formatAmount(part.moles)} mol / {formatAmount(part.grams)} g / {formatScientific(
                      part.moles * AVOGADRO_CONSTANT
                    )} atoms{#if i < entry.amountBreakdown.length - 1};{/if}
                  </li>
                {/each}
              </ul>
            </div>
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
