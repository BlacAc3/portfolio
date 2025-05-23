<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    let cursorEl: HTMLDivElement;
    let cursorX = 0;
    let cursorY = 0;

    function handleMouseMove(e: MouseEvent) {
        cursorX = e.clientX;
        cursorY = e.clientY;
    }

    // Use Svelte reactivity to update the element's style
    $: if (cursorEl) {
        cursorEl.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    }

    onMount(() => {
        // Hide native cursor
        document.body.style.cursor = "none";
        window.addEventListener("mousemove", handleMouseMove);
    });

    onDestroy(() => {
        document.body.style.cursor = "";
        window.removeEventListener("mousemove", handleMouseMove);
    });
</script>

<div bind:this={cursorEl} class="custom-cursor">
    <div class="cursor-inner"></div>
    <div class="cursor-ring"></div>
</div>

<style>
    .custom-cursor {
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        pointer-events: none;
        transform: translate3d(0, 0, 0);
        z-index: 9999;
    }

    .cursor-inner {
        position: absolute;
        top: 0;
        left: 0;
        width: 5px;
        height: 5px;
        background: rgba(255, 165, 0, 1);
        border-radius: 50%;
        transform: translate(-50%, -50%);
    }

    .cursor-ring {
        position: absolute;
        top: 0;
        left: 0;
        width: 30px;
        height: 30px;
        border: 2px solid rgba(255, 165, 0, 0.8);
        border-radius: 50%;
        transform: translate(-50%, -50%);
    }

    /* Hover state: intensify ring color */
    :global(button:hover) ~ .custom-cursor .cursor-ring,
    :global(a:hover) ~ .custom-cursor .cursor-ring,
    :global(.hover-target:hover) ~ .custom-cursor .cursor-ring {
        border-color: rgba(255, 200, 0, 1);
    }
    :global(html),
    :global(body),
    :global(*) {
        cursor: none !important;
    }
</style>
