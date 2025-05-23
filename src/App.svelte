<script>
    import "./app.css";
    import Bento from "$lib/components/Bento.svelte";
    import NavBar from "$lib/components/NavBar.svelte";
    import Cursor from "$lib/components/ui/Cursor.svelte";
    import Particles from "$lib/components/ui/Particles.svelte";
    import MagicCard from "$lib/components/ui/MagicCard.svelte";
</script>

<main class="relative bg-[#1D1B1A] no-cursor">
    <MagicCard
        class="whitespace-pre-wrap bg-transparent font-semibold leading-none text-transparent "
        gradientColor="#58402F"
        gradientSize={300}
    >
        <NavBar />
        <Bento />
    </MagicCard>
    <Particles
        className="absolute inset-0 pointer-events-none h-full"
        refresh={true}
    />

    <Cursor />
</main>

<style>
</style>
