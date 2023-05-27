<script lang="ts" module="mjs">
    // @ts-ignore
    const { ipcRenderer } = window.require("electron");

    function close() {
        ipcRenderer.send("close");
    }
</script>

<p>click this to close</p>
<button on:click={close}>x</button>

<style>
    :global(body) {
        background-color: var(--background);
    }
</style>
