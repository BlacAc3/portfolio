<script>
    import { Menubar as MenubarPrimitive } from "bits-ui";
    import { cn } from "$lib/utils.js";
    let className = undefined;
    export let inset = undefined;
    export { className as class };
</script>

<MenubarPrimitive.Item
    class={cn(
        "data-[highlighted]:bg-gray-700 data-[highlighted]:text-white relative flex cursor-pointer transition-colors duration-300 select-none items-center rounded-sm px-4 p-1.5 mx-1 my-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className,
    )}
    {...$$restProps}
    on:click
    on:keydown
    on:focusin
    on:focusout
    on:pointerleave
    on:pointermove
    on:pointerdown
>
    <slot />
</MenubarPrimitive.Item>
