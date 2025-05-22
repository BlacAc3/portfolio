<script lang="ts">
    import * as Menubar from "$lib/components/ui/menubar";
    import { AlignJustify } from "lucide-svelte";
</script>

<Menubar.Root
    class="bg-[#1D1B1A] flex justify-between p-7 text-orange-300 md:hidden"
>
    <div>Blacac3</div>
    <Menubar.Menu>
        <Menubar.Trigger class="bg-[#1D1B1A] text-orange-300 cursor-pointer"
            ><AlignJustify /></Menubar.Trigger
        >
        <Menubar.Content class="bg-[#1D1B1A] text-orange-300">
            <Menubar.Item>
                New Tab
                <Menubar.Shortcut>⌘T</Menubar.Shortcut>
            </Menubar.Item>
            <Menubar.Item>New Window</Menubar.Item>
            <Menubar.Separator />
            <Menubar.Item>Share</Menubar.Item>
            <Menubar.Separator />
            <Menubar.Item>Print</Menubar.Item>
        </Menubar.Content>
    </Menubar.Menu>
</Menubar.Root>
