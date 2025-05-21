<script>
    // Lucide Svelte
    import { Home, PencilLine, TvMinimalPlay } from "lucide-svelte";
    // Simple Icons : simpleicons.org
    import TwitterSvg from "$lib/svg/web/x.svg";
    import GithubSvg from "$lib/svg/web/github.svg";
    import LinkedInSvg from "$lib/svg/web/linkedin.svg";
    import MailSvg from "$lib/svg/web/gmail.svg";
    //    Shadcn Components
    import * as Tooltip from "$lib/components/ui/tooltip";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    //   Major Components
    import Dock from "./Dock.svelte";
    import DockIcon from "./DockIcon.svelte";

    let navs = {
        navbar: [
            { label: "Home", icon: Home, href: "#" },
            { label: "Blog", icon: PencilLine, href: "#" },
            { label: "Developer", icon: TvMinimalPlay, href: "#" },
        ],
        contact: [
            { label: "Github", icon: GithubSvg, href: "#" },
            { label: "LinkedIn", icon: LinkedInSvg, href: "#" },
            { label: "X", icon: TwitterSvg, href: "#" },
            { label: "Email", icon: MailSvg, href: "#" },
        ],
    };
</script>

<div
    class="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-[#1D1B1A] md:shadow-xl"
>
    <span
        class="pointer-events-none whitespace-pre-wrap bg-orange-200 bg-clip-text text-center text-4xl md:text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10"
    >
        Ezeala Aaron
    </span>
    <div>
        <Dock
            direction="middle"
            class="relative"
            let:mouseX
            let:distance
            let:magnification
        >
            {#each navs.navbar as item}
                <DockIcon
                    {mouseX}
                    {magnification}
                    {distance}
                    class="text-[#FED7AA] "
                >
                    <Tooltip.Root>
                        <Tooltip.Trigger
                            class="hover:bg-[#392D25] transition-all duration-200 rounded-full p-3 mx-0"
                        >
                            <svelte:component
                                this={item.icon}
                                size={22}
                                strokeWidth={2.2}
                            />
                        </Tooltip.Trigger>
                        <Tooltip.Content sideOffset={8}>
                            <p>{item.label}</p>
                        </Tooltip.Content>
                    </Tooltip.Root>
                </DockIcon>
            {/each}
            <Separator orientation="vertical" class="h-full w-[0.6px]" />
            {#each navs.contact as item}
                <DockIcon {mouseX} {magnification} {distance}>
                    <Tooltip.Root>
                        <Tooltip.Trigger
                            class="hover:bg-[#392D25] transition-all duration-200 rounded-full"
                        >
                            <img
                                src={item.icon}
                                alt={item.label}
                                class="m-3 h-5 w-5"
                            />
                        </Tooltip.Trigger>
                        <Tooltip.Content sideOffset={9}>
                            <p>{item.label}</p>
                        </Tooltip.Content>
                    </Tooltip.Root>
                </DockIcon>
            {/each}
        </Dock>
    </div>
</div>
