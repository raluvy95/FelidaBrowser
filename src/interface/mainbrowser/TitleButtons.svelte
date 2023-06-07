<script>
    // @ts-ignore
    const { ipcRenderer } = window.require("electron");

    const BUTTONS = [
        {
            name: "minimize",
            action: minimize,
        },
        {
            name: "maximize",
            action: maximize,
        },
        {
            name: "close",
            action: close,
        },
    ];

    function close() {
        ipcRenderer.send("close");
    }

    function minimize() {
        ipcRenderer.send("minimize");
    }

    function maximize() {
        ipcRenderer.send("maximize");
    }
</script>

{#each BUTTONS as e}
    <p class={e.name} on:click={e.action} on:keyup={e.action}>
        <embed src="../assets/window-buttons/{e.name}.svg" />
    </p>
{/each}

<style lang="scss">
    .action {
        padding: 2px;
        font-weight: 900;
        background: transparent;
        border: none;
        outline: none;
        cursor: inherit;
        appearance: none;
        -webkit-appearance: none;
        background-color: transparent;
    }

    .action-fill {
        fill: var(--text);
    }

    p {
        margin: 0;
    }
</style>
