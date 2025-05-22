<script>
    import BoxReveal from "./ui/BoxReveal.svelte";
    import { X } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let expanded = false;

    function toggleExpand() {
        dispatch("expand", !expanded); // simple boolean payload
    }
</script>

<div
    class={` ${!expanded ? "bg-[#4A2E19]/60 col-span-5 hover:scale-[1.02]" : "bg-[#4A2E19]/60 "} p-6 duration-100 ease-in-out  text-slate-300 flex flex-col gap-4 border border-orange-300/40 justify-end rounded-md cursor-pointer shadow-[#2C2521] hover:cursor-pointer shadow-md whitespace-nowrap text-4xl group transition-all `}
    class:expanded
    on:click={toggleExpand}
>
    {#if expanded}
        <button
            class="absolute top-4 right-4 text-white z-50"
            on:click|stopPropagation={toggleExpand}
        >
            <X />
        </button>
    {/if}
    <BoxReveal boxColor={"#5046e6"} duration={0.5}>
        <h1
            class="text-slate-300 text-5xl group-hover:text-brown-700 transition-all duration-500 flex justify-start font-semibold"
        >
            Ezeala Aaron
        </h1>
    </BoxReveal>
    <BoxReveal boxColor={"#5046e6"} duration={0.5}>
        <p class="text-2xl">Software Engineer</p>
    </BoxReveal>

    <BoxReveal boxColor={"#5046e6"} duration={0.5}>
        <p class="text-sm italic text-left text-wrap">
            “Turning coffee into code, bugs into features, and ideas into
            pixel-perfect reality.” - Ezeala Aaron
        </p>
    </BoxReveal>
</div>

<style>
    .expanded {
        @apply fixed top-8 left-8 right-8 bottom-8 z-40 rounded-2xl shadow-xl;
    }
</style>
