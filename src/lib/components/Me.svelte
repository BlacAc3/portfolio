<script>
    import BoxReveal from "./ui/BoxReveal.svelte";
    import { X } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let expanded = false;
    export let className = "";

    function toggleExpand() {
        dispatch("expand", !expanded); // simple boolean payload
    }

    const handleKeydown = (event) => {};
</script>

<div
    class={` ${!expanded ? "bg-[#4A2E19]/60 hover:scale-[1.02]" : "bg-[#4A2E19] "} p-6 duration-100 ease-in-out   border border-orange-300/40  rounded-md cursor-pointer shadow-[#2C2521] hover:cursor-pointer shadow-md  group transition-all ${className}`}
    class:expanded
    tabindex="0"
    role="button"
    on:click={!expanded
        ? () => {
              expanded = true;
          }
        : undefined}
    on:keydown={(e) => {
        // Allow keyboard activation only when not expanded
        if (!expanded && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault(); // Prevent default action (e.g., space scrolls)
            expanded = true;
        }
        if (e.key === "Escape" && expanded) {
            expanded = false;
        }
    }}
>
    {#if expanded}
        <button
            class="absolute top-4 right-4 text-white z-50"
            on:click|stopPropagation={() => {
                expanded = false;
            }}
        >
            <X />
        </button>
    {/if}
    {#if !$$slots.default}
        <!-- Content to show when no default slot is provided -->
        <BoxReveal boxColor="white">
            <p class="text-xl tracking-[0.2em] uppercase text-orange-200">
                Click to expand
            </p>
        </BoxReveal>
    {:else}
        <!-- Content from the default slot -->
        <slot />
    {/if}
</div>

<style>
    .expanded {
        @apply fixed top-8 left-8 right-8 bottom-8 z-40 rounded-2xl shadow-xl;
    }
</style>
