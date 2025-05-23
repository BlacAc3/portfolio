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
        expanded = false;
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

<div class="text-white flex justify-center items-center w-screen">
    <div
        class={`w-full flex justify-center items-center pb-2 lg:px-16 h-screen`}
    >
        <ul
            class="grid grid-cols-12 gap-4 w-full"
            style="grid-auto-rows: {$viewportHeight / numberOfRows - 30}px;"
        >
            <Me
                className="col-span-5 text-slate-300 flex flex-col gap-4 justify-end whitespace-nowrap text-4xl"
                on:expand={toggleExpand}
                {expanded}
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
                    <p class="text-sm italic text-left text-wrap">
                        “Turning coffee into code, bugs into features, and ideas
                        into pixel-perfect reality.” - Ezeala Aaron
                    </p>
                </BoxReveal>
            </Me>

            <Me
                className="col-span-3 text-slate-300 flex flex-col gap-4 justify-end whitespace-nowrap text-4xl"
                on:expand={toggleExpand}
                {expanded}
            />
            <Me
                className="col-span-4 row-span-2 p-6 duration-100 ease-in-out text-slate-300 flex flex-col gap-8 border border-orange-300/40 justify-end rounded-md cursor-pointer shadow-[#2C2521] hover:cursor-pointer shadow-md whitespace-nowrap text-4xl group transition-all"
                on:expand={toggleExpand}
                {expanded}
            />
            <Me
                className="col-span-4 p-6 duration-100 ease-in-out text-slate-300 flex flex-col gap-8 border border-orange-300/40 justify-end rounded-md cursor-pointer shadow-[#2C2521] hover:cursor-pointer shadow-md whitespace-nowrap text-4xl group transition-all"
                on:expand={toggleExpand}
                {expanded}
            />
            <Me
                className="col-span-4 p-6 duration-100 ease-in-out text-slate-300 flex flex-col gap-8 border border-orange-300/40 justify-end rounded-md cursor-pointer shadow-[#2C2521] hover:cursor-pointer shadow-md whitespace-nowrap text-4xl group transition-all"
                on:expand={toggleExpand}
                {expanded}
            />
            <!-- <Me
                className="col-span-4 p-6 duration-100 ease-in-out text-slate-300 flex flex-col gap-8 border border-orange-300/40 justify-end rounded-md cursor-pointer shadow-[#2C2521] hover:cursor-pointer shadow-md whitespace-nowrap text-4xl group transition-all"
                on:expand={toggleExpand}
                {expanded}
            /> -->
        </ul>
    </div>
</div>
