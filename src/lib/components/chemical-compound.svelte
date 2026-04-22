<script lang="ts">
  import { getElementBySymbol } from '$lib/elements';
  import { blankCompound, type Compound } from '$lib/types/compound.svelte';
  import { TagsInput } from '$lib/components/ui/tags-input';
  import CompoundText from './CompoundText.svelte';

  type ParsedQuantityInput =
    | { kind: 'mass'; grams: number }
    | { kind: 'moles'; moles: number }
    | { kind: 'percent'; percent: number; symbol?: string }
    | { kind: 'invalid' };

  type QuantityConversion =
    | { kind: 'invalid' }
    | { kind: 'no_formula' }
    | { kind: 'needs_mixture_mass' }
    | { kind: 'mass_to_moles'; moles: number }
    | { kind: 'moles_to_mass'; grams: number }
    | {
        kind: 'element_percent_to_compound_mass';
        symbol: string;
        elementMassGrams: number;
        compoundMassGrams: number;
        compoundMoles: number;
      };

  let {
    mixtureTotalMassGrams = null,
      compound = $bindable<Compound>(blankCompound())
  }: {
    mixtureTotalMassGrams?: number | null;
    compound: Compound;
  } = $props();


  const formatMass = (mass: number) => mass.toFixed(3);
  const formatPercent = (percent: number) => percent.toFixed(2);
  const formatAmount = (value: number, maximumFractionDigits = 6) =>
    value.toLocaleString(undefined, { maximumFractionDigits });

  const parseMassUnitToGrams = (value: number, unit: string): number | null => {
    if (unit === 'g' || unit === 'gram' || unit === 'grams') return value;
    if (unit === 'kg' || unit === 'kilogram' || unit === 'kilograms') return value * 1000;
    return null;
  };
  const parseQuantityInput = (rawInput: string): ParsedQuantityInput | null => {
    const raw = rawInput.trim().toLowerCase();
    if (!raw) return null;

    const percentMatch = raw.match(/^([0-9]*\.?[0-9]+)\s*%\s*([a-z]{1,2})?$/);
    if (percentMatch) {
      const percent = Number(percentMatch[1]);
      const symbolInput = percentMatch[2];
      if (Number.isFinite(percent) && percent >= 0 && percent <= 100) {
        return {
          kind: 'percent',
          percent,
          symbol: symbolInput
            ? symbolInput.charAt(0).toUpperCase() + symbolInput.slice(1)
            : undefined
        };
      }
      return { kind: 'invalid' };
    }

    const match = raw.match(/^([0-9]*\.?[0-9]+)\s*([a-z/]+)$/);
    if (!match) return { kind: 'invalid' };
    const value = Number(match[1]);
    if (!Number.isFinite(value) || value < 0) return { kind: 'invalid' };

    const grams = parseMassUnitToGrams(value, match[2]);
    if (grams !== null) return { kind: 'mass', grams };
    if (match[2] === 'mol' || match[2] === 'mole' || match[2] === 'moles') {
      return { kind: 'moles', moles: value };
    }
    return { kind: 'invalid' };
  };

  const handleTagsValueChange = (next: string[]) => {
    const existingCounts = new Map(
      Array.from(compound.elements.entries()).map(([atomicNumber, component]) => [
        atomicNumber,
        component.count
      ])
    );

    compound.elements.clear();
    for (const symbol of next) {
      const element = getElementBySymbol(symbol);
      if (!element) continue;

      const count = existingCounts.get(element.atomicNumber) ?? 1;
      compound.elements.set(element.atomicNumber, {
        atomicNumber: element.atomicNumber,
        count
      });
    }
  };
  const setQuantityInput = (value: string) => {
    compound.quantityInputValue = value;
  };

  const selectedSymbols = $derived(
    compound.selectedAtomicNumbers
      .map((atomicNumber) => compound.getElementByAtomicNumber(atomicNumber)?.symbol)
      .filter((symbol): symbol is string => Boolean(symbol))
  );
  const totalMolarMass = $derived(compound.totalMolarMass);
  const totalHasEstimatedMass = $derived(compound.totalHasEstimatedMass);
  const amountBreakdown = $derived(compound.amountBreakdown);

  const parsedQuantityInput = $derived(parseQuantityInput(compound.quantityInputValue));
  const quantityConversion = $derived.by<QuantityConversion | null>(() => {
    if (parsedQuantityInput === null) return null;
    if (parsedQuantityInput.kind === 'invalid') return { kind: 'invalid' };
    if (totalMolarMass <= 0) return { kind: 'no_formula' };

    if (parsedQuantityInput.kind === 'percent') {
      if (mixtureTotalMassGrams === null) return { kind: 'needs_mixture_mass' };
      if (!parsedQuantityInput.symbol) {
        return {
          kind: 'moles_to_mass',
          grams: mixtureTotalMassGrams * (parsedQuantityInput.percent / 100)
        };
      }

      const element = compound.getElementBySymbol(parsedQuantityInput.symbol);
      const elementCount = element ? compound.getCount(element.atomicNumber) : 0;
      if (!element || elementCount <= 0) return { kind: 'invalid' };

      const elementMassFractionInCompound = (element.weight * elementCount) / totalMolarMass;
      if (elementMassFractionInCompound <= 0) return { kind: 'invalid' };

      const elementMassGrams = mixtureTotalMassGrams * (parsedQuantityInput.percent / 100);
      const compoundMassGrams = elementMassGrams / elementMassFractionInCompound;
      return {
        kind: 'element_percent_to_compound_mass',
        symbol: parsedQuantityInput.symbol,
        elementMassGrams,
        compoundMassGrams,
        compoundMoles: compoundMassGrams / totalMolarMass
      };
    }

    if (parsedQuantityInput.kind === 'mass') {
      return { kind: 'mass_to_moles', moles: parsedQuantityInput.grams / totalMolarMass };
    }

    return { kind: 'moles_to_mass', grams: parsedQuantityInput.moles * totalMolarMass };
  });
  const inputTotalMoles = $derived.by(() => {
    if (quantityConversion === null) return null;
    if (
      quantityConversion.kind === 'invalid' ||
      quantityConversion.kind === 'no_formula' ||
      quantityConversion.kind === 'needs_mixture_mass'
    ) {
      return null;
    }
    if (quantityConversion.kind === 'element_percent_to_compound_mass') return quantityConversion.compoundMoles;
    if (quantityConversion.kind === 'mass_to_moles') return quantityConversion.moles;
    if (parsedQuantityInput?.kind === 'moles') return parsedQuantityInput.moles;
    return null;
  });

  $effect(() => {
    compound.inputTotalMoles = inputTotalMoles;
  });

</script>

<div class="w-fit rounded border-2 bg-slate-300 p-6">
  {#snippet renderTag(symbol: string)}
    {@const element = compound.getElementBySymbol(symbol)}
    {@const count = element ? compound.getCount(element.atomicNumber) : 0}
    {@const componentMass = element ? compound.getComponentMolarMass(element.atomicNumber) : 0}
    {@const massPercentage = element ? compound.getMassPercentage(element.atomicNumber) : 0}
    <div class="flex flex-col">
      <span class="text-center text-lg font-medium">{symbol}<sub>{count}</sub></span>
      {#if element}
        <span class="text-[10px] text-slate-600">{element.isEstimated ? "~" : ""}{formatMass(componentMass)} g/mol</span>
        <span class="text-[10px] text-slate-600"> ({formatPercent(massPercentage)}%)</span>
      {/if}
    </div>
  {/snippet}

  <p class="mt-1 text-lg text-slate-700">
    Formula:
    {#if selectedSymbols.length === 0}
      <span class="font-medium"> - </span>
    {:else}
      <CompoundText {compound} />
    {/if}
  </p>

  <TagsInput
    value={selectedSymbols}
    onValueChange={handleTagsValueChange}
    placeholder="Click elements to add"
    onRender={renderTag}
  />

  <div class="mt-2 text-sm text-slate-700">
    Total mass: {#if totalHasEstimatedMass}~{/if}{formatMass(totalMolarMass)}
    <span class="text-[10px] text-slate-600"> g/mol</span>
  </div>

  <div class="mt-3 space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
    <p class="text-sm font-medium text-slate-800">Quantity Calculator</p>
    <input
      type="text"
      value={compound.quantityInputValue}
      oninput={(event) => setQuantityInput((event.currentTarget as HTMLInputElement).value)}
      placeholder="Examples: 10 g, 0.25 kg, 2 mol, 11.8%, 11.8% Fe"
      class="w-64 rounded border border-slate-300 bg-white px-2 py-1 text-sm"
    />
    <p class="text-sm text-slate-700">
      {#if quantityConversion === null}
        Enter a value and unit to convert.
      {:else if quantityConversion.kind === 'needs_mixture_mass'}
        <span class="text-amber-700">Percent input needs total mass in Mixture Calculator.</span>
      {:else if quantityConversion.kind === 'invalid'}
        <span class="text-red-600">Invalid input. Use `10 g`, `0.25 kg`, `2 mol`, `11.8%`, or `11.8% Fe`.</span>
      {:else if quantityConversion.kind === 'no_formula'}
        Select a formula first to run conversions.
      {:else if quantityConversion.kind === 'element_percent_to_compound_mass'}
        Compound mass from {quantityConversion.symbol} percentage:
        <span class="font-medium">{formatAmount(quantityConversion.compoundMassGrams)} g ({formatAmount(quantityConversion.compoundMoles)} mol)</span>
      {:else if quantityConversion.kind === 'mass_to_moles'}
        Moles of chemical: <span class="font-medium">{formatAmount(quantityConversion.moles)} mol</span>
      {:else}
        Mass of chemical:
        <span class="font-medium">{formatAmount(quantityConversion.grams)} g ({formatAmount(quantityConversion.grams / 1000)} kg)</span>
      {/if}
    </p>
    {#if amountBreakdown.length > 0}
      <div class="text-sm text-slate-700">
        Amount by element:
        <ul class="font-medium">
          {#each amountBreakdown as entry, i (entry.symbol)}
            <li>{entry.symbol}: {formatAmount(entry.moles)} mol / {formatAmount(entry.grams)} g{#if i < amountBreakdown.length - 1}; {/if}</li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</div>
