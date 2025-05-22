<script>
    import { onMount, onDestroy } from "svelte";
    import { writable } from "svelte/store";
    import MagicCard from "./ui/MagicCard.svelte";
    import BoxReveal from "./ui/BoxReveal.svelte";

    let viewportHeight = writable(window.innerHeight);
    let numberOfRows = 2; // You can update this if you have dynamic item count logic
    let expanded = false;

    function updateViewportHeight() {
        viewportHeight.set(window.innerHeight - 100);
    }

    // Subscribe to viewportHeight and log its value
    const unsubscribe = viewportHeight.subscribe((value) => {
        console.log("Viewport height changed:", value);
    });

    onMount(() => {
        updateViewportHeight();
        window.addEventListener("resize", updateViewportHeight);
    });

    onDestroy(() => {
        window.removeEventListener("resize", updateViewportHeight);
        unsubscribe(); // Unsubscribe from the store
    });
</script>

<div class="text-white flex justify-center items-center w-full">
    <div
        class={`w-full flex justify-center items-center p-4 pb-2 lg:p-16 h-screen`}
    >
        <ul
            class="grid grid-cols-12 gap-4 w-full"
            style="grid-auto-rows: {$viewportHeight / numberOfRows}px;"
        >
            {#if expanded}
                <div class="bg-[#4A2E19] col-span-5"></div>
            {/if}
            <div
                class={`${!expanded ? "col-span-5" : ""} p-6 bg-[#4A2E19]/60 duration-100 ease-in-out hover:scale-[1.02] text-slate-300 flex flex-col gap-4 border border-orange-300/40 justify-end rounded-md cursor-pointer shadow-[#2C2521] hover:cursor-pointer shadow-md whitespace-nowrap text-4xl group transition-all duration-400`}
                class:expanded
                on:click={() => (expanded = !expanded)}
            >
                {#if expanded}
                    <button
                        class="absolute top-4 right-4 text-white z-50"
                        on:click|stopPropagation={() => (expanded = false)}
                    >
                        ✕
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
                        “Turning coffee into code, bugs into features, and ideas
                        into pixel-perfect reality.” - Ezeala Aaron
                    </p>
                </BoxReveal>
            </div>
            <!-- <div class="flex w-full flex-col gap-4 h-[250px] lg:flex-row"></div> -->
            <div
                class="col-span-3 p-6 bg-[#4A2E19]/60 duration-100 ease-in-out hover:scale-[1.02] text-slate-300 flex flex-col gap-8 border border-orange-300/40 justify-end rounded-md cursor-pointer shadow-[#2C2521] hover:cursor-pointer shadow-md whitespace-nowrap text-4xl group transition-all"
            ></div>
            <div
                class="col-span-4 p-6 bg-[#4A2E19]/60 duration-100 ease-in-out hover:scale-[1.02] text-slate-300 flex flex-col gap-8 border border-orange-300/40 justify-end rounded-md cursor-pointer shadow-[#2C2521] hover:cursor-pointer shadow-md whitespace-nowrap text-4xl group transition-all"
            ></div>
            <div
                class="col-span-4 p-6 bg-[#4A2E19]/60 duration-100 ease-in-out hover:scale-[1.02] text-slate-300 flex flex-col gap-8 border border-orange-300/40 justify-end rounded-md cursor-pointer shadow-[#2C2521] hover:cursor-pointer shadow-md whitespace-nowrap text-4xl group transition-all"
            ></div>
            <div
                class="col-span-4 p-6 bg-[#4A2E19]/60 duration-100 ease-in-out hover:scale-[1.02] text-slate-300 flex flex-col gap-8 border border-orange-300/40 justify-end rounded-md cursor-pointer shadow-[#2C2521] hover:cursor-pointer shadow-md whitespace-nowrap text-4xl group transition-all"
            ></div>
            <div
                class="col-span-4 p-6 bg-[#4A2E19]/60 duration-100 ease-in-out hover:scale-[1.02] text-slate-300 flex flex-col gap-8 border border-orange-300/40 justify-end rounded-md cursor-pointer shadow-[#2C2521] hover:cursor-pointer shadow-md whitespace-nowrap text-4xl group transition-all"
            ></div>
        </ul>
    </div>
</div>

<style>
    .expanded {
        @apply fixed top-8 left-8 right-8 bottom-8 z-40 rounded-2xl shadow-xl;
    }
</style>
