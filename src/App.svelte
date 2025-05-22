<script>
    import "./app.css";
    import Bento from "$lib/components/Bento.svelte";
    import NavBar from "$lib/components/NavBar.svelte";
    import Particles from "$lib/components/ui/Particles.svelte";
</script>

<main class="relative bg-[#1D1B1A]">
    <span
        class="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10"
    >
        <NavBar />
        <Bento />
    </span>
    <Particles className="absolute inset-0" refresh={true} />
</main>
