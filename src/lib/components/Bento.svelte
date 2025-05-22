<script>
    import { onMount, onDestroy } from "svelte";
    import { writable } from "svelte/store";
    import BoxReveal from "$lib/components/ui/BoxReveal.svelte";
    import Me from "$lib/components/Me.svelte";
    import { X } from "lucide-svelte";

    let viewportHeight = writable(window.innerHeight);
    let numberOfRows = 2; // You can update this if you have dynamic item count logic
    let expanded = false;

    function updateViewportHeight() {
        viewportHeight.set(window.innerHeight - 100);
    }
    const toggleExpand = () => {
        expanded = !expanded;
    };

    // Subscribe to viewportHeight and log its value
    const unsubscribe = viewportHeight.subscribe((value) => {
        // console.log("Viewport height changed:", value);
    });

    onMount(() => {
        updateViewportHeight();
        window.addEventListener("resize", updateViewportHeight);
    });

    onDestroy(() => {
        window.removeEventListener("resize", updateViewportHeight);
        unsubscribe(); // Unsubscribe from the store
    });

    const cardOnClickHandler = () => {
        expanded = true;
    };
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
                <Me expanded={false} />
                {console.log(expanded)}
            {/if}
            <Me on:expand={toggleExpand} {expanded} />

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
