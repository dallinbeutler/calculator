<script lang="ts">
  import { Button } from '$lib/components/ui/button';
    import type { ElementData } from '$lib/elements';
  import { cn } from '$lib/utils';
    import type { ButtonProps } from '$lib/components/ui/button';

  type Props = {
    element: ElementData;
  };
  type ElementProps = Props & ButtonProps;
  let { element, size , ...buttonProps}: ElementProps = $props();
</script>

<Button
{...buttonProps}
style={`grid-area: ${element.symbol};`}
// tabindex="0"
class={cn("periodic-table-cell", element.category, element.cutoff ? "cutoff" : "", size === "lg" ? "h-40 w-30 text-left pl-4" : "h-18 ", "flex flex-col items-center justify-center gap-0")}
role="button"
title={element.name}
// onmouseenter={() => showElementInfo(element.atomicNumber)}
>
<div class="atomic-num pt-1"> {element.atomicNumber}</div>
<div class="symbol">{element.symbol}</div>
<div class="el-name">{element.name}</div>
<div class="weight pb-1">{element.weight}</div>
{@render buttonProps.children?.()}
</Button>