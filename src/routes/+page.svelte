<script lang="ts">
  import {
    elementByAtomicNumber,
    getElementBySymbol,
    getElementsByAtomicNumbers,
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
  initialCompound.name = 'Compound 1';
  let compounds = $state<Compound[]>([initialCompound]);
  let activeCompoundId = $state(initialCompound.id);

  const activeElement = $derived(
    activeAtomicNumber === null ? null : elementByAtomicNumber.get(activeAtomicNumber) ?? null
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

      <div style="grid-area: key; grid-column: 3 / span 10; grid-row: 2/ span 3;" class="periodic-table-key p-1 col-span-2 h-full w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm">
        
        {#if activeElement}
        {@render renderTag(activeElement.symbol, 'lg')}
        {:else}
        <em class="hover-hint">Hover or focus an element to preview details</em>
        {/if}
      </div>
      <h1 class="text-2xl font-semibold tracking-tight" style="grid-area: key; grid-column: 3 / span 10; text-align: center;">Periodic Table</h1>
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
