<script lang="ts">
  import {
    elementByAtomicNumber,
    formatElectronConfigurationSuperscript,
    getElectronConfigurationNobleGas,
    getElementBySymbol,
    getElementsByAtomicNumbers,
    getValenceElectronConfiguration,
    lanthanideActinideAtomicNumbers,
    mainTableAtomicNumbers
  } from "$lib/elements";
  import "./kahn.css";
  import ChemicalCompounds from '$lib/components/chemical-compounds.svelte';
  import { blankCompound, type Compound } from '$lib/types/compound.svelte';
  import { Button, type ButtonSize } from '$lib/components/ui/button';
  import Element from '$lib/components/Element.svelte';



  const groupNumbers = Array.from({ length: 18 }, (_, i) => i + 1);

  const mainElements = $derived(getElementsByAtomicNumbers(mainTableAtomicNumbers));
  const lanthanideActinideElements = $derived(
    getElementsByAtomicNumbers(lanthanideActinideAtomicNumbers)
  );

  let activeAtomicNumber = $state<number | null>(null);
  let showLanthanidesActinides = $state(true);
  const initialCompound = blankCompound();
  let compounds = $state<Compound[]>([initialCompound]);
  let activeCompoundId = $state(initialCompound.id);

  const activeElement = $derived(
    activeAtomicNumber === null ? null : elementByAtomicNumber.get(activeAtomicNumber) ?? null
  );
  const activeGroundStateElectronConfigurationNobleGas = $derived(
    activeElement ? getElectronConfigurationNobleGas(activeElement.atomicNumber) : null
  );
  const activeGroundStateElectronConfigurationNobleGasSuperscript = $derived(
    activeGroundStateElectronConfigurationNobleGas
      ? formatElectronConfigurationSuperscript(activeGroundStateElectronConfigurationNobleGas)
      : null
  );
  const activeValenceElectronConfiguration = $derived(
    activeElement ? getValenceElectronConfiguration(activeElement.atomicNumber) : null
  );
  const activeValenceElectronConfigurationSuperscript = $derived(
    activeValenceElectronConfiguration
      ? formatElectronConfigurationSuperscript(activeValenceElectronConfiguration)
      : null
  );
  const activeCompound = $derived(
    compounds.find((compound) => compound.id === activeCompoundId) ?? null
  );

  const showElementInfo = (atomicNumber: number) => {
    activeAtomicNumber = atomicNumber;
  };

  const toggleLanthanidesActinides = () => {
    showLanthanidesActinides = !showLanthanidesActinides;
  };

  const getElement = (symbol: string) => getElementBySymbol(symbol);
  const periodicTableLegend = [
    { key: 'other-non-metals', label: 'Other non-metals' },
    { key: 'alkali-metals', label: 'Alkali metals' },
    { key: 'transition-metals', label: 'Transition metals' },
    { key: 'other-metals', label: 'Other metals' },
    { key: 'alkaline-earth-metals', label: 'Alkaline earth metals' },
    { key: 'halogens', label: 'Halogens' },
    { key: 'noble-gases', label: 'Noble gases' },
    { key: 'lanthanides', label: 'Lanthanides' },
    { key: 'actinides', label: 'Actinides' },
    { key: 'unknown-chemical-properties', label: 'Unknown chemical properties' }
  ] as const;

  const addElementToTags = (symbol: string) => {
    if (!activeCompound) return;
    const element = getElementBySymbol(symbol);
    if (!element) return;

    const existing = activeCompound.elements.get(element.atomicNumber);
    activeCompound.elements.set(element.atomicNumber, {
      atomicNumber: element.atomicNumber,
      count: (existing?.count ?? 0) + 1
    });
  };

  const handleElementKeydown = (event: KeyboardEvent, symbol: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      addElementToTags(symbol);
    }
  };
</script>
{#snippet renderTag(symbol: string, size: ButtonSize = 'default')}
  {@const element = getElement(symbol)}
  {#if element}
  <Element {element} size={size} 
    onmouseenter={(e: MouseEvent) => {
      e.stopPropagation();
      showElementInfo(element.atomicNumber);
    }} 
    onfocus={(e: FocusEvent) => {
      e.stopPropagation();
      showElementInfo(element.atomicNumber);
    }} onclick={(e: MouseEvent) => {
      e.stopPropagation();
      addElementToTags(element.symbol);
    }} onkeydown={(event: KeyboardEvent) => handleElementKeydown(event, element.symbol)} />
  <!-- <Button
    style={`grid-area: ${element.symbol};`}
    // tabindex="0"
    class={cn("periodic-table-cell", element.category, element.cutoff ? "cutoff" : "", size === "lg" ? "h-40 w-30 text-left pl-4" : "h-18 ", "flex flex-col items-center justify-center gap-0")}
    role="button"
    title={element.name}
    onmouseenter={() => showElementInfo(element.atomicNumber)}
    onfocus={(e) => {
      e.stopPropagation();
      showElementInfo(element.atomicNumber);
    }}
    onclick={(e) => {
      e.stopPropagation();
      addElementToTags(element.symbol);
    }}
    onkeydown={(event) => handleElementKeydown(event, element.symbol)}
  >
    <div class="atomic-num pt-1"> {element.atomicNumber}</div>
    <div class="symbol">{element.symbol}</div>
    <div class="el-name">{element.name}</div>
    <div class="weight pb-1">{element.weight}</div>
  </Button> -->
  {:else}
  {symbol}
  {/if}
{/snippet}

<section class="w-full">

  <div class="periodic-table-body">
    <div class="periodic-table-grid main-table">
      {#each groupNumbers as group}
        <div class="periodic-table-cell periodic-table-group-number">{group}</div>
      {/each}

      {#each mainElements as element (element.atomicNumber)}
        {@render renderTag(element.symbol)}
      {/each}

      <Button
        type="button"
        variant="secondary"
        class="periodic-table-cell marker text-[11px] font-semibold leading-tight hover:bg-slate-300 h-full"
        style="grid-column: 3; grid-row: 7 / span 2;"
        onclick={toggleLanthanidesActinides}
        aria-pressed={!showLanthanidesActinides}
      >
        {showLanthanidesActinides ? "Hide" : "Show"}
        <br />
        Ln/An
      </Button>

      <div style="grid-area: key; grid-column: 3 / span 10; grid-row: 2/ span 3;" 
      class="periodic-table-key p-1 col-span-2 h-full w-full rounded-md border px-3 py-2 text-sm shadow-sm">
        <div class="periodic-table-key-content ">
            {#if activeElement}
            <div class="flex gap-2">

              {@render renderTag(activeElement.symbol, 'lg')}
              <div class=" flex flex-col">
                <h2 class="text-sm font-semibold">electron config:</h2>
                <p class="mt-2 max-w-[18rem] text-xs leading-snug text-slate-700">
                  <span class="font-semibold">Ground-state:</span>
                  {activeGroundStateElectronConfigurationNobleGasSuperscript}
                </p>
                <p class="max-w-[18rem] text-xs leading-snug text-slate-700">
                  <span class="font-semibold">Valence:</span>
                  {activeValenceElectronConfigurationSuperscript}
                </p>
              </div>
            </div>
            {:else}
              <em class="hover-hint">Hover or focus an element to preview details</em>
            {/if}
        </div>
      </div>
      <div
        style="grid-column: 13 / span 5; grid-row: 2;"
        class="periodic-table-legend-panel rounded-md border border-slate-300 bg-white px-2 py-1 shadow-sm"
      >
        <p class="mb-1 text-[10px] font-semibold text-slate-700">Legend</p>
        <div class="periodic-table-category-legend">
          {#each periodicTableLegend as item}
            <div class="periodic-table-category-legend-item" title={item.label}>
              <span class={"periodic-table-category-swatch " + item.key}></span>
              <span>{item.label}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>

    {#if showLanthanidesActinides}
      <div class="periodic-table-grid lanthanide-actinide-table">
        {#each lanthanideActinideElements as element (element.atomicNumber)}
          {@render renderTag(element.symbol)}
        {/each}
      </div>
    {/if}
  </div>
  <ChemicalCompounds
    bind:compounds
    bind:activeCompoundId
  />

</section>
<style>
    .periodic-table-category-legend {
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:2px 8px;
    font-size:10px;
    width:100%
  }
  .periodic-table-category-legend-item {
    display:flex;
    align-items:center;
    gap:4px;
    white-space:nowrap
  }
</style>
