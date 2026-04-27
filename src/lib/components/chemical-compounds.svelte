<script lang="ts">
  import { blankCompound, type AmountBreakdownEntry, type Compound } from '$lib/types/compound.svelte';
  import { Button } from '$lib/components/ui/button';
  import ChemicalCompound from '$lib/components/chemical-compound.svelte';
  import MixtureCalculator from '$lib/components/mixture-calculator.svelte';
  import * as Tabs from '$lib/components/ui/tabs';
  import CompoundText from './CompoundText.svelte';

  const initialCompound = blankCompound();
initialCompound.name = 'C 1';
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
  let useThreeSigFigs = $state(false);

  const roundToSigFigs = (value: number, sigFigs: number): number => {
    if (!Number.isFinite(value) || value === 0) return value;
    return Number(value.toPrecision(sigFigs));
  };
  const AVOGADRO_CONSTANT = 6.02214076e23;
  const roundForCalculations = (value: number) =>
    useThreeSigFigs ? roundToSigFigs(value, 3) : value;
  type ParsedQuantityInput =
    | { kind: 'mass'; grams: number }
    | { kind: 'moles'; moles: number }
    | { kind: 'atoms'; atoms: number }
    | { kind: 'percent'; percent: number; symbol?: string }
    | { kind: 'invalid' };
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

  const formatAmount = (value: number, maximumFractionDigits = 6) =>
    useThreeSigFigs
      ? roundToSigFigs(value, 3).toLocaleString(undefined, { maximumSignificantDigits: 3 })
      : value.toLocaleString(undefined, { maximumFractionDigits });
  const formatPercent = (percent: number) =>
    useThreeSigFigs
      ? roundToSigFigs(percent, 3).toLocaleString(undefined, { maximumSignificantDigits: 3 })
      : percent.toFixed(2);

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
  const parseMassInput = (rawInput: string): { kind: 'mass'; grams: number } | { kind: 'invalid' } | null => {
    const raw = rawInput.trim().toLowerCase();
    if (!raw) return null;
    const match = raw.match(/^([0-9]*\.?[0-9]+)\s*([a-z/]+)$/);
    if (!match) return { kind: 'invalid' };

    const value = Number(match[1]);
    if (!Number.isFinite(value) || value < 0) return { kind: 'invalid' };
    const grams = parseMassUnitToGrams(roundForCalculations(value), match[2]);
    if (grams === null) return { kind: 'invalid' };
    return { kind: 'mass', grams: roundForCalculations(grams) };
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
          kind: 'percent' as const,
          percent: roundForCalculations(percent),
          symbol: symbolInput
            ? symbolInput.charAt(0).toUpperCase() + symbolInput.slice(1)
            : undefined
        };
      }
      return { kind: 'invalid' as const };
    }

    const scientificCount = parseScientificCount(raw);
    if (scientificCount !== null) {
      if (!Number.isFinite(scientificCount) || scientificCount < 0) return { kind: 'invalid' };
      return { kind: 'atoms', atoms: roundForCalculations(scientificCount) };
    }

    const match = raw.match(/^([0-9]*\.?[0-9]+)\s*([a-z/]+)$/);
    if (!match) return { kind: 'invalid' as const };
    const value = roundForCalculations(Number(match[1]));
    if (!Number.isFinite(value) || value < 0) return { kind: 'invalid' as const };
    const grams = parseMassUnitToGrams(value, match[2]);
    if (grams !== null) return { kind: 'mass' as const, grams: roundForCalculations(grams) };
    if (match[2] === 'mol' || match[2] === 'mole' || match[2] === 'moles') {
      return { kind: 'moles' as const, moles: roundForCalculations(value) };
    }
    return { kind: 'invalid' as const };
  };

  const getCompoundMassInGrams = (compound: Compound) => {
    const parsed = parseQuantityInput(compound.quantityInputValue);
    if (parsed === null || parsed.kind === 'invalid') return null;

    const molarMass = roundForCalculations(compound.totalMolarMass);
    if (molarMass <= 0) return null;
    if (parsed.kind === 'mass') return roundForCalculations(parsed.grams);
    if (parsed.kind === 'moles') return roundForCalculations(roundForCalculations(parsed.moles) * molarMass);
    if (parsed.kind === 'atoms') {
      const atomsPerFormulaUnit = compound.selectedAtomicNumbers.reduce(
        (sum, atomicNumber) => sum + compound.getCount(atomicNumber),
        0
      );
      if (atomsPerFormulaUnit <= 0) return null;
      const formulaUnits = roundForCalculations(parsed.atoms / atomsPerFormulaUnit);
      const moles = roundForCalculations(formulaUnits / AVOGADRO_CONSTANT);
      return roundForCalculations(moles * molarMass);
    }

    const mixtureParsed = parseMassInput(mixtureTotalMassInput);
    if (!mixtureParsed || mixtureParsed.kind !== 'mass') return null;
    if (!parsed.symbol) {
      return roundForCalculations(
        roundForCalculations(mixtureParsed.grams) * roundForCalculations(parsed.percent / 100)
      );
    }

    const element = compound.getElementBySymbol(parsed.symbol);
    const elementCount = element ? compound.getCount(element.atomicNumber) : 0;
    if (!element || elementCount <= 0) return null;
    const elementMassFractionInCompound = roundForCalculations(
      roundForCalculations(roundForCalculations(element.weight) * roundForCalculations(elementCount)) /
        molarMass
    );
    if (elementMassFractionInCompound <= 0) return null;
    const elementMassGrams = roundForCalculations(
      roundForCalculations(mixtureParsed.grams) * roundForCalculations(parsed.percent / 100)
    );
    return roundForCalculations(elementMassGrams / elementMassFractionInCompound);
  };
  const getAmountBreakdownForCompound = (
    compound: Compound,
    compoundMassGrams: number | null
  ): AmountBreakdownEntry[] => {
    if (compoundMassGrams === null) return [];
    const molarMass = roundForCalculations(compound.totalMolarMass);
    if (molarMass <= 0) return [];

    const totalMoles = roundForCalculations(compoundMassGrams / molarMass);
    return compound.selectedAtomicNumbers
      .map((atomicNumber) => {
        const element = compound.getElementByAtomicNumber(atomicNumber);
        if (!element) return null;
        const count = roundForCalculations(compound.getCount(atomicNumber));
        const moles = roundForCalculations(totalMoles * count);
        return {
          atomicNumber,
          symbol: element.symbol,
          moles,
          grams: roundForCalculations(moles * roundForCalculations(element.weight))
        };
      })
      .filter((entry): entry is AmountBreakdownEntry => Boolean(entry));
  };
  const getCompoundMoles = (compound: Compound | null, compoundMassGrams: number | null): number | null => {
    if (!compound || compoundMassGrams === null) return null;
    const molarMass = roundForCalculations(compound.totalMolarMass);
    if (molarMass <= 0) return null;
    return roundForCalculations(compoundMassGrams / molarMass);
  };
  const getFormulaUnitCount = (compoundMoles: number | null): number | null => {
    if (compoundMoles === null) return null;
    return roundForCalculations(compoundMoles * AVOGADRO_CONSTANT);
  };
  const getCompoundAtomCount = (compound: Compound | null, compoundMoles: number | null): number | null => {
    if (!compound || compoundMoles === null) return null;
    const atomsPerFormulaUnit = compound.selectedAtomicNumbers.reduce(
      (sum, atomicNumber) => sum + compound.getCount(atomicNumber),
      0
    );
    if (atomsPerFormulaUnit <= 0) return null;
    const formulaUnits = getFormulaUnitCount(compoundMoles);
    if (formulaUnits === null) return null;
    return roundForCalculations(formulaUnits * atomsPerFormulaUnit);
  };

  $effect(() => {
    if (compounds.length === 0) {
      const compound = blankCompound();
      compound.name = 'C 1';
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
    next.name = `C ${compoundNumber}`;
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
    const base = compounds.map((compound) => {
      const grams = getCompoundMassInGrams(compound);
      const moles = getCompoundMoles(compound, grams);
      return {
        id: compound.id,
        name: compound.name,
        compound,
        grams,
        moles,
        formulaUnits: getFormulaUnitCount(moles),
        atomCount: getCompoundAtomCount(compound, moles),
        isSolved: false,
        amountBreakdown: getAmountBreakdownForCompound(compound, grams)
      };
    });

    if (parsedMixtureTotalMass?.kind !== 'mass') return base;

    const knownTotal = roundForCalculations(base.reduce((sum, entry) => sum + (entry.grams ?? 0), 0));
    const unknownEntries = base.filter((entry) => entry.grams === null);
    const remainingMass = roundForCalculations(parsedMixtureTotalMass.grams - knownTotal);
    if (remainingMass < 0) return base;

    const solvedBase =
      unknownEntries.length === 1
        ? base.map((entry) =>
            entry.grams === null
              ? {
                  ...entry,
                  grams: remainingMass,
                  moles: getCompoundMoles(entry.compound, remainingMass),
                  formulaUnits: getFormulaUnitCount(getCompoundMoles(entry.compound, remainingMass)),
                  atomCount: getCompoundAtomCount(
                    entry.compound,
                    getCompoundMoles(entry.compound, remainingMass)
                  ),
                  isSolved: true,
                  amountBreakdown: entry.compound
                    ? getAmountBreakdownForCompound(entry.compound, remainingMass)
                    : []
                }
              : entry
          )
        : base;

    if (unknownEntries.length > 0) return solvedBase;

    const solvedTotal = roundForCalculations(
      solvedBase.reduce((sum, entry) => sum + (entry.grams ?? 0), 0)
    );
    const unknownRemainder = roundForCalculations(parsedMixtureTotalMass.grams - solvedTotal);
    if (unknownRemainder <= 0) return solvedBase;

    return [
      ...solvedBase,
      {
        id: '__unknown_remainder__',
        name: 'Unknown remainder',
        compound: null,
        grams: unknownRemainder,
        moles: null,
        formulaUnits: null,
        atomCount: null,
        isSolved: true,
        amountBreakdown: []
      }
    ];
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
  <p class="text-xl font-medium text-slate-700">Compounds</p>
  <div class="mb-2">
    <label
      class="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
    >
      <input type="checkbox" bind:checked={useThreeSigFigs} class="h-3.5 w-3.5" />
      Use 3 significant figures for all calculations
    </label>
  </div>
  <div class="mb-3 flex flex-wrap items-center gap-2">
  <Tabs.Root value={activeCompoundId}>
    <Tabs.List>
      
      {#each compounds as compoundTab (compoundTab.id)}
      <Tabs.Trigger value={compoundTab.id}
        onclick={() => (activeCompoundId = compoundTab.id)}>

         {compoundTab.name} | <CompoundText compound={compoundTab} />

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
      {useThreeSigFigs}
    />
  {/if}

  <MixtureCalculator
    visible={true}
    bind:mixtureTotalMassInput
    {parsedMixtureTotalMass}
    {mixtureMassBreakdown}
    {mixturePercentageDenominator}
    {totalKnownCompoundMass}
    {formatAmount}
    {formatPercent}
  />
</div>
