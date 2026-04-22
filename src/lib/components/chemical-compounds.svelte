<script lang="ts">
  import { blankCompound, type Compound } from '$lib/types/compound.svelte';
  import { Button } from '$lib/components/ui/button';
  import ChemicalCompound from '$lib/components/chemical-compound.svelte';
  import MixtureCalculator from '$lib/components/mixture-calculator.svelte';
  import * as Tabs from '$lib/components/ui/tabs';
  import CompoundText from './CompoundText.svelte';

  const initialCompound = blankCompound();
  initialCompound.name = 'Compound 1';

  let {
    compounds = $bindable<Compound[]>([initialCompound]),
    activeCompoundId = $bindable(initialCompound.id)
  }: {
    compounds: Compound[];
    activeCompoundId: string;
  } = $props();

  const activeCompound = $derived.by(
    () => compounds.find((compound) => compound.id === activeCompoundId) ?? null
  );
  let mixtureTotalMassInput = $state('');

  const formatAmount = (value: number, maximumFractionDigits = 6) =>
    value.toLocaleString(undefined, { maximumFractionDigits });
  const formatPercent = (percent: number) => percent.toFixed(2);

  const parseMassUnitToGrams = (value: number, unit: string): number | null => {
    if (unit === 'g' || unit === 'gram' || unit === 'grams') return value;
    if (unit === 'kg' || unit === 'kilogram' || unit === 'kilograms') return value * 1000;
    return null;
  };
  const parseMassInput = (rawInput: string): { kind: 'mass'; grams: number } | { kind: 'invalid' } | null => {
    const raw = rawInput.trim().toLowerCase();
    if (!raw) return null;
    const match = raw.match(/^([0-9]*\.?[0-9]+)\s*([a-z/]+)$/);
    if (!match) return { kind: 'invalid' };

    const value = Number(match[1]);
    if (!Number.isFinite(value) || value < 0) return { kind: 'invalid' };
    const grams = parseMassUnitToGrams(value, match[2]);
    if (grams === null) return { kind: 'invalid' };
    return { kind: 'mass', grams };
  };
  const parseQuantityInput = (rawInput: string) => {
    const raw = rawInput.trim().toLowerCase();
    if (!raw) return null;
    const percentMatch = raw.match(/^([0-9]*\.?[0-9]+)\s*%\s*([a-z]{1,2})?$/);
    if (percentMatch) {
      const percent = Number(percentMatch[1]);
      const symbolInput = percentMatch[2];
      if (Number.isFinite(percent) && percent >= 0 && percent <= 100) {
        return {
          kind: 'percent' as const,
          percent,
          symbol: symbolInput
            ? symbolInput.charAt(0).toUpperCase() + symbolInput.slice(1)
            : undefined
        };
      }
      return { kind: 'invalid' as const };
    }

    const match = raw.match(/^([0-9]*\.?[0-9]+)\s*([a-z/]+)$/);
    if (!match) return { kind: 'invalid' as const };
    const value = Number(match[1]);
    if (!Number.isFinite(value) || value < 0) return { kind: 'invalid' as const };
    const grams = parseMassUnitToGrams(value, match[2]);
    if (grams !== null) return { kind: 'mass' as const, grams };
    if (match[2] === 'mol' || match[2] === 'mole' || match[2] === 'moles') {
      return { kind: 'moles' as const, moles: value };
    }
    return { kind: 'invalid' as const };
  };

  const getCompoundMassInGrams = (compound: Compound) => {
    const parsed = parseQuantityInput(compound.quantityInputValue);
    if (parsed === null || parsed.kind === 'invalid') return null;

    const molarMass = compound.totalMolarMass;
    if (molarMass <= 0) return null;
    if (parsed.kind === 'mass') return parsed.grams;
    if (parsed.kind === 'moles') return parsed.moles * molarMass;

    const mixtureParsed = parseMassInput(mixtureTotalMassInput);
    if (!mixtureParsed || mixtureParsed.kind !== 'mass') return null;
    if (!parsed.symbol) return mixtureParsed.grams * (parsed.percent / 100);

    const element = compound.getElementBySymbol(parsed.symbol);
    const elementCount = element ? compound.getCount(element.atomicNumber) : 0;
    if (!element || elementCount <= 0) return null;
    const elementMassFractionInCompound = (element.weight * elementCount) / molarMass;
    if (elementMassFractionInCompound <= 0) return null;
    const elementMassGrams = mixtureParsed.grams * (parsed.percent / 100);
    return elementMassGrams / elementMassFractionInCompound;
  };

  $effect(() => {
    if (compounds.length === 0) {
      const compound = blankCompound();
      compound.name = 'Compound 1';
      compounds = [compound];
      activeCompoundId = compound.id;
      return;
    }

    if (!compounds.some((compound) => compound.id === activeCompoundId)) {
      activeCompoundId = compounds[0].id;
    }
  });

  const addCompound = () => {
    const compoundNumber = compounds.length + 1;
    const next = blankCompound();
    next.name = `Compound ${compoundNumber}`;
    compounds = [...compounds, next];
    activeCompoundId = next.id;
  };

  const removeCompound = (compoundId: string) => {
    if (compounds.length <= 1) return;
    const removedIndex = compounds.findIndex((compound) => compound.id === compoundId);
    const nextCompounds = compounds.filter((compound) => compound.id !== compoundId);
    compounds = nextCompounds;
    if (activeCompoundId === compoundId) {
      const nextIndex = Math.max(0, removedIndex - 1);
      activeCompoundId = nextCompounds[nextIndex]?.id ?? nextCompounds[0].id;
    }
  };

  const parsedMixtureTotalMass = $derived.by(() => {
    const parsed = parseMassInput(mixtureTotalMassInput);
    if (parsed === null) return null;
    if (parsed.kind === 'invalid') return { kind: 'invalid' as const };
    return { kind: 'mass' as const, grams: parsed.grams };
  });
  const mixtureMassBreakdown = $derived.by(() => {
    const base = compounds.map((compound) => ({
      id: compound.id,
      name: compound.name,
      grams: getCompoundMassInGrams(compound),
      isSolved: false
    }));

    if (parsedMixtureTotalMass?.kind !== 'mass') return base;

    const knownTotal = base.reduce((sum, entry) => sum + (entry.grams ?? 0), 0);
    const unknownEntries = base.filter((entry) => entry.grams === null);
    if (unknownEntries.length !== 1) return base;

    const remainingMass = parsedMixtureTotalMass.grams - knownTotal;
    if (remainingMass < 0) return base;

    return base.map((entry) =>
      entry.grams === null ? { ...entry, grams: remainingMass, isSolved: true } : entry
    );
  });
  const totalKnownCompoundMass = $derived(
    mixtureMassBreakdown.reduce((sum, entry) => sum + (entry.grams ?? 0), 0)
  );
  const mixturePercentageDenominator = $derived.by(() => {
    if (parsedMixtureTotalMass === null) return totalKnownCompoundMass > 0 ? totalKnownCompoundMass : null;
    if (parsedMixtureTotalMass.kind === 'invalid') return null;
    return parsedMixtureTotalMass.grams;
  });
</script>

<div class="w-fit rounded border-2 bg-slate-300 p-3">
  <div class="mb-3 flex flex-wrap items-center gap-2">
  <Tabs.Root value={activeCompoundId}>
    <Tabs.List>
      
      {#each compounds as compoundTab (compoundTab.id)}
      <Tabs.Trigger value={compoundTab.id}
        onclick={() => (activeCompoundId = compoundTab.id)}>
         {#if compoundTab.elements.size > 0}
         <CompoundText compound={compoundTab} />
         {:else}
         {compoundTab.name} 
         {/if}
        {#if compounds.length > 1}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="px-1"
          onclick={() => removeCompound(compoundTab.id)}
          aria-label={`Remove ${compoundTab.name}`}
        >
          x
        </Button>
        {/if}
      </Tabs.Trigger>
    {/each}
        <Button type="button" variant="outline" size="sm" onclick={addCompound}>
          + Add compound
        </Button>
      </Tabs.List>
      </Tabs.Root>
  </div>

  {#if activeCompound}
    <ChemicalCompound
      compound={activeCompound}
      mixtureTotalMassGrams={parsedMixtureTotalMass?.kind === 'mass' ? parsedMixtureTotalMass.grams : null}
    />
  {/if}

  <MixtureCalculator
    visible={compounds.length > 1}
    bind:mixtureTotalMassInput
    {parsedMixtureTotalMass}
    {mixtureMassBreakdown}
    {mixturePercentageDenominator}
    {totalKnownCompoundMass}
    {formatAmount}
    {formatPercent}
  />
</div>
