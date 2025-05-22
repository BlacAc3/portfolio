<script>
    import { onMount, onDestroy } from "svelte";
    import { writable } from "svelte/store";
    import MagicCard from "./ui/MagicCard.svelte";
    import BoxReveal from "./ui/BoxReveal.svelte";

    let viewportHeight = writable(window.innerHeight);
    let numberOfRows = 2; // You can update this if you have dynamic item count logic

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
            <MagicCard
                class="p-6 bg-[#231B15] text-slate-300 flex flex-col gap-8 border-orange-200 justify-end rounded-md col-span-5 cursor-pointer hover:shadow-md whitespace-nowrap text-4xl group  transition-all duration-300"
                gradientColor="#58402F"
                gradientSize={300}
            >
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
                    <p class="text-sm italic text-wrap">
                        “Turning coffee into code, bugs into features, and ideas
                        into pixel-perfect reality.” - Ezeala Aaron
                    </p>
                </BoxReveal>
            </MagicCard>
            <!-- <div class="flex w-full flex-col gap-4 h-[250px] lg:flex-row"></div> -->
            <MagicCard
                class="p-6 bg-[#382d25] text-slate-300 flex flex-col gap-7 border-transparent justify-end rounded-md col-span-3 cursor-pointer hover:shadow-md whitespace-nowrap text-4xl group transition-all duration-300"
                gradientColor="#58402F"
                gradientSize={300}
            ></MagicCard>
            <MagicCard
                class="p-6 bg-[#382d25] text-slate-300 flex flex-col gap-7 border-transparent justify-end rounded-md col-span-4 cursor-pointer hover:shadow-md whitespace-nowrap text-4xl group transition-all duration-300"
                gradientColor="#58402F"
                gradientSize={300}
            ></MagicCard>
            <MagicCard
                class="p-6 bg-[#382d25] text-slate-300 flex flex-col gap-7 border-transparent justify-end rounded-md col-span-4 cursor-pointer hover:shadow-md whitespace-nowrap text-4xl group transition-all duration-300"
                gradientColor="#58402F"
                gradientSize={300}
            ></MagicCard>
            <MagicCard
                class="p-6 bg-[#382d25] text-slate-300 flex flex-col gap-7 border-transparent justify-end rounded-md col-span-4 cursor-pointer hover:shadow-md whitespace-nowrap text-4xl group transition-all duration-300"
                gradientColor="#58402F"
                gradientSize={300}
            ></MagicCard>
            <MagicCard
                class="p-6 bg-[#382d25] text-slate-300 flex flex-col gap-7 border-transparent justify-end rounded-md col-span-4 cursor-pointer hover:shadow-md whitespace-nowrap text-4xl group transition-all duration-300"
                gradientColor="#58402F"
                gradientSize={300}
            ></MagicCard>
        </ul>
    </div>
</div>
