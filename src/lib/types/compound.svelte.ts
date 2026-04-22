import { elementByAtomicNumber, getElementBySymbol, type ElementData } from "$lib/elements";
import { SvelteMap } from "svelte/reactivity";

export type AtomicNumber = number;

export type CompoundComponent = {
  atomicNumber: AtomicNumber;
  count: number;
};

export type AmountBreakdownEntry = {
  atomicNumber: AtomicNumber;
  symbol: string;
  moles: number;
  grams: number;
};

export class Compound {
  id = $state<string>(crypto.randomUUID());
  name = $state("Compound");
  elements = new SvelteMap<AtomicNumber, CompoundComponent>();
  quantityInputValue = $state("");
  inputTotalMoles = $state<number | null>(null);

  constructor(init?: {
    id?: string;
    name?: string;
    elements?: Iterable<[AtomicNumber, CompoundComponent]>;
    quantityInputValue?: string;
  }) {
    if (!init) return;
    if (init.id) this.id = init.id;
    if (init.name) this.name = init.name;
    if (init.elements) this.elements = new SvelteMap(init.elements);
    if (init.quantityInputValue) this.quantityInputValue = init.quantityInputValue;
  }

  selectedAtomicNumbers = $derived(Array.from(this.elements.keys()));

  totalMolarMass = $derived(
    this.selectedAtomicNumbers.reduce(
      (sum, atomicNumber) => sum + this.getComponentMolarMass(atomicNumber),
      0
    )
  );

  totalHasEstimatedMass = $derived(
    this.selectedAtomicNumbers.some((atomicNumber) => this.getElementByAtomicNumber(atomicNumber)?.isEstimated)
  );

  amountBreakdown = $derived.by<AmountBreakdownEntry[]>(() => {
    const totalMoles = this.inputTotalMoles;
    if (totalMoles === null) return [];

    return this.selectedAtomicNumbers
      .map((atomicNumber) => {
        const element = this.getElementByAtomicNumber(atomicNumber);
        if (!element) return null;
        const moles = totalMoles * this.getCount(atomicNumber);
        return { atomicNumber, symbol: element.symbol, moles, grams: moles * element.weight };
      })
      .filter((entry): entry is AmountBreakdownEntry => Boolean(entry));
  });

  getElementByAtomicNumber(atomicNumber: AtomicNumber): ElementData | undefined {
    return elementByAtomicNumber.get(atomicNumber);
  }

  getElementBySymbol(symbol: string): ElementData | undefined {
    return getElementBySymbol(symbol);
  }

  getCount(atomicNumber: AtomicNumber): number {
    return this.elements.get(atomicNumber)?.count ?? 0;
  }

  getComponentMolarMass(atomicNumber: AtomicNumber): number {
    const element = this.getElementByAtomicNumber(atomicNumber);
    if (!element) return 0;
    return element.weight * this.getCount(atomicNumber);
  }

  getMassPercentage(atomicNumber: AtomicNumber): number {
    if (this.totalMolarMass <= 0) return 0;
    return (this.getComponentMolarMass(atomicNumber) / this.totalMolarMass) * 100;
  }
}

export function blankCompound(): Compound {
  return new Compound();
}