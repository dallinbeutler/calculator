<script lang="ts">
  import { getElementBySymbol } from '$lib/elements';
  import { blankCompound, type Compound } from '$lib/types/compound.svelte';
  import { TagsInput } from '$lib/components/ui/tags-input';
  import CompoundText from './CompoundText.svelte';

  type ParsedQuantityInput =
    | { kind: 'mass'; grams: number }
    | { kind: 'moles'; moles: number }
    | { kind: 'atoms'; atoms: number }
    | { kind: 'percent'; percent: number; symbol?: string }
    | { kind: 'invalid' };

  type QuantityConversion =
    | { kind: 'invalid' }
    | { kind: 'no_formula' }
    | { kind: 'needs_mixture_mass' }
    | { kind: 'mass_to_moles'; moles: number }
    | {
        kind: 'atoms_to_compound';
        atoms: number;
        formulaUnits: number;
        atomsPerFormulaUnit: number;
        moles: number;
        grams: number;
      }
    | { kind: 'moles_to_mass'; grams: number }
    | {
        kind: 'element_percent_to_compound_mass';
        symbol: string;
        elementMassGrams: number;
        compoundMassGrams: number;
        compoundMoles: number;
      };

  type Props = {
    mixtureTotalMassGrams?: number | null;
    useThreeSigFigs?: boolean;
    compound: Compound;
  };
  let {
    mixtureTotalMassGrams = null,
    useThreeSigFigs = false,
    compound = $bindable<Compound>(blankCompound())
  }: Props = $props();


  const roundToSigFigs = (value: number, sigFigs: number): number => {
    if (!Number.isFinite(value) || value === 0) return value;
    return Number(value.toPrecision(sigFigs));
  };
  const AVOGADRO_CONSTANT = 6.02214076e23;
  const roundForCalculations = (value: number) =>
    useThreeSigFigs ? roundToSigFigs(value, 3) : value;
  const formatMass = (mass: number) => mass.toFixed(3);
  const formatPercent = (percent: number) =>
    useThreeSigFigs
      ? roundToSigFigs(percent, 3).toLocaleString(undefined, { maximumSignificantDigits: 3 })
      : percent.toFixed(2);
  const formatAmount = (value: number, maximumFractionDigits = 6) =>
    useThreeSigFigs
      ? roundToSigFigs(value, 3).toLocaleString(undefined, { maximumSignificantDigits: 3 })
      : value.toLocaleString(undefined, { maximumFractionDigits });

  const parseMassUnitToGrams = (value: number, unit: string): number | null => {
    if (unit === 'g' || unit === 'gram' || unit === 'grams') return value;
    if (unit === 'mg' || unit === 'milligram' || unit === 'milligrams') return value / 1000;
    if (unit === 'kg' || unit === 'kilogram' || unit === 'kilograms') return value * 1000;
    return null;
  };
  const parseScientificCount = (raw: string): number | null => {
    const compact = raw.replace(/\s+/g, '');
    const caretMatch = compact.match(/^([0-9]*\.?[0-9]+)(?:x|\*)10\^([+-]?[0-9]+)$/i);
    if (caretMatch) {
      const coefficient = Number(caretMatch[1]);
      const exponent = Number(caretMatch[2]);
      if (!Number.isFinite(coefficient) || !Number.isFinite(exponent)) return null;
      return coefficient * 10 ** exponent;
    }
    const eMatch = compact.match(/^([0-9]*\.?[0-9]+)e([+-]?[0-9]+)$/i);
    if (eMatch) {
      const coefficient = Number(eMatch[1]);
      const exponent = Number(eMatch[2]);
      if (!Number.isFinite(coefficient) || !Number.isFinite(exponent)) return null;
      return coefficient * 10 ** exponent;
    }
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
          percent: roundForCalculations(percent),
          symbol: symbolInput
            ? symbolInput.charAt(0).toUpperCase() + symbolInput.slice(1)
            : undefined
        };
      }
      return { kind: 'invalid' };
    }

    const scientificCount = parseScientificCount(raw);
    if (scientificCount !== null) {
      if (!Number.isFinite(scientificCount) || scientificCount < 0) return { kind: 'invalid' };
      return { kind: 'atoms', atoms: roundForCalculations(scientificCount) };
    }

    const match = raw.match(/^([0-9]*\.?[0-9]+)\s*([a-z/]+)$/);
    if (!match) return { kind: 'invalid' };
    const value = roundForCalculations(Number(match[1]));
    if (!Number.isFinite(value) || value < 0) return { kind: 'invalid' };

    const grams = parseMassUnitToGrams(value, match[2]);
    if (grams !== null) return { kind: 'mass', grams: roundForCalculations(grams) };
    if (match[2] === 'mol' || match[2] === 'mole' || match[2] === 'moles') {
      return { kind: 'moles', moles: roundForCalculations(value) };
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
  const effectiveTotalMolarMass = $derived(roundForCalculations(totalMolarMass));
  const totalHasEstimatedMass = $derived(compound.totalHasEstimatedMass);

  const parsedQuantityInput = $derived(parseQuantityInput(compound.quantityInputValue));
  const quantityConversion = $derived.by<QuantityConversion | null>(() => {
    if (parsedQuantityInput === null) return null;
    if (parsedQuantityInput.kind === 'invalid') return { kind: 'invalid' };
    if (effectiveTotalMolarMass <= 0) return { kind: 'no_formula' };

    if (parsedQuantityInput.kind === 'percent') {
      if (mixtureTotalMassGrams === null) return { kind: 'needs_mixture_mass' };
      if (!parsedQuantityInput.symbol) {
        return {
          kind: 'moles_to_mass',
          grams: roundForCalculations(
            roundForCalculations(mixtureTotalMassGrams) * roundForCalculations(parsedQuantityInput.percent / 100)
          )
        };
      }

      const element = compound.getElementBySymbol(parsedQuantityInput.symbol);
      const elementCount = element ? compound.getCount(element.atomicNumber) : 0;
      if (!element || elementCount <= 0) return { kind: 'invalid' };

      const elementMassFractionInCompound = roundForCalculations(
        roundForCalculations(roundForCalculations(element.weight) * roundForCalculations(elementCount)) /
          effectiveTotalMolarMass
      );
      if (elementMassFractionInCompound <= 0) return { kind: 'invalid' };

      const elementMassGrams = roundForCalculations(
        roundForCalculations(mixtureTotalMassGrams) * roundForCalculations(parsedQuantityInput.percent / 100)
      );
      const compoundMassGrams = roundForCalculations(elementMassGrams / elementMassFractionInCompound);
      return {
        kind: 'element_percent_to_compound_mass',
        symbol: parsedQuantityInput.symbol,
        elementMassGrams,
        compoundMassGrams,
        compoundMoles: roundForCalculations(compoundMassGrams / effectiveTotalMolarMass)
      };
    }

    if (parsedQuantityInput.kind === 'atoms') {
      const atomsPerFormulaUnit = compound.selectedAtomicNumbers.reduce(
        (sum, atomicNumber) => sum + compound.getCount(atomicNumber),
        0
      );
      if (atomsPerFormulaUnit <= 0) return { kind: 'invalid' };
      const formulaUnits = roundForCalculations(parsedQuantityInput.atoms / atomsPerFormulaUnit);
      const moles = roundForCalculations(formulaUnits / AVOGADRO_CONSTANT);
      return {
        kind: 'atoms_to_compound',
        atoms: parsedQuantityInput.atoms,
        formulaUnits,
        atomsPerFormulaUnit,
        moles,
        grams: roundForCalculations(moles * effectiveTotalMolarMass)
      };
    }

    if (parsedQuantityInput.kind === 'mass') {
      return {
        kind: 'mass_to_moles',
        moles: roundForCalculations(roundForCalculations(parsedQuantityInput.grams) / effectiveTotalMolarMass)
      };
    }

    return {
      kind: 'moles_to_mass',
      grams: roundForCalculations(roundForCalculations(parsedQuantityInput.moles) * effectiveTotalMolarMass)
    };
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
    if (quantityConversion.kind === 'atoms_to_compound') return quantityConversion.moles;
    if (quantityConversion.kind === 'element_percent_to_compound_mass') return quantityConversion.compoundMoles;
    if (quantityConversion.kind === 'mass_to_moles') return quantityConversion.moles;
    if (parsedQuantityInput?.kind === 'moles') return roundForCalculations(parsedQuantityInput.moles);
    return null;
  });
  $effect(() => {
    compound.inputTotalMoles = inputTotalMoles === null ? null : roundForCalculations(inputTotalMoles);
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
     | molar mass: {#if totalHasEstimatedMass}~{/if}{formatMass(totalMolarMass)}
    <span class="text-[10px] text-slate-600"> g/mol</span>
  </p>
  <p class="text-xs text-slate-600">
    FU (formula unit): one {#if selectedSymbols.length === 0}-{:else}<CompoundText {compound} />{/if}.
  </p>
  <div class="mt-2 text-sm text-slate-700">
  </div>

  <TagsInput
    value={selectedSymbols}
    onValueChange={handleTagsValueChange}
    placeholder="Click elements to add"
    onRender={renderTag}
  />


  <div class="mt-3 space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
    <p class="text-md font-medium text-slate-800">Quantity Calculator</p>
    <p class="text-sm font-medium text-slate-800">(optionally specify % of a given element present in mixture, requires total ammount)</p>
    <input
      type="text"
      value={compound.quantityInputValue}
      oninput={(event) => setQuantityInput((event.currentTarget as HTMLInputElement).value)}
      placeholder="Examples: 10 g, 250 mg, 0.25 kg, 2 mol, 7.35x10^23, 11.8%, 11.8% Fe"
      class="w-64 rounded border border-slate-300 bg-white px-2 py-1 text-sm"
    />
    <p class="text-sm text-slate-700">
      {#if quantityConversion === null}
        Enter a value and unit to convert.
      {:else if quantityConversion.kind === 'needs_mixture_mass'}
        <span class="text-amber-700">Percent input needs total mass in Mixture Calculator.</span>
      {:else if quantityConversion.kind === 'invalid'}
        <span class="text-red-600">Invalid input. Use `10 g`, `250 mg`, `0.25 kg`, `2 mol`, `7.35x10^23`, `11.8%`, or `11.8% Fe`.</span>
      {:else if quantityConversion.kind === 'no_formula'}
        Select a formula first to run conversions.
      {:else if quantityConversion.kind === 'atoms_to_compound'}
        From atoms:
        <span class="font-medium">{formatAmount(quantityConversion.grams)} g ({formatAmount(quantityConversion.moles)} mol)</span>
        <br />
        <span class="text-xs text-slate-600">
          {formatAmount(quantityConversion.atoms)} atoms = {formatAmount(quantityConversion.formulaUnits)} FU ({quantityConversion.atomsPerFormulaUnit} atoms per formula unit).
        </span>
      {:else if quantityConversion.kind === 'element_percent_to_compound_mass'}
        Compound mass from {quantityConversion.symbol} percentage:
        <span class="font-medium">{formatAmount(quantityConversion.compoundMassGrams)} g ({formatAmount(quantityConversion.compoundMoles)} mol)</span>
        <br />
        <span class="text-xs text-slate-600">
          {quantityConversion.symbol} mass in mixture:
          {formatAmount(quantityConversion.elementMassGrams)} g at {formatPercent(parsedQuantityInput?.kind === 'percent' ? parsedQuantityInput.percent : 0)}%.
        </span>
      {:else if quantityConversion.kind === 'mass_to_moles'}
        Moles of chemical: <span class="font-medium">{formatAmount(quantityConversion.moles)} mol</span>
      {:else}
        Mass of chemical:
        <span class="font-medium">{formatAmount(quantityConversion.grams)} g ({formatAmount(quantityConversion.grams / 1000)} kg)</span>
      {/if}
    </p>
  </div>
</div>
