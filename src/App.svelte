<script>
    import "./app.css";
    import Bento from "$lib/components/Bento.svelte";
    import NavBar from "$lib/components/NavBar.svelte";
    import Particles from "$lib/components/ui/Particles.svelte";
    import MagicCard from "$lib/components/ui/MagicCard.svelte";
</script>

<main class="relative bg-[#1D1B1A]">
    <MagicCard
        class="whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10"
        gradientColor="#58402F"
        gradientSize={300}
    >
        <NavBar />
        <Bento />
    </MagicCard>
    <Particles
        className="absolute inset-0 pointer-events-none"
        refresh={true}
    />
</main>
