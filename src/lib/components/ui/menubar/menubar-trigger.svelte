<script>
    import { Menubar as MenubarPrimitive } from "bits-ui";
    import { cn } from "$lib/utils.js";
    let className = undefined;
    export { className as class };
</script>

<MenubarPrimitive.Trigger
    class={cn(
        "data-[highlighted]:bg-[#1D1B1A] data-[state=open]:bg-[#1D1B1A] data-[highlighted]:text-orange-200 data-[state=open]:text-orange-200 flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none",
        className,
    )}
    on:click
    on:keydown
    on:pointerenter
    {...$$restProps}
>
    <slot />
</MenubarPrimitive.Trigger>
