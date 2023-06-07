<script lang="ts" module="mjs">
    import TitleButtons from "./TitleButtons.svelte";
</script>

<div class="UI">
    <div class="tabs" />
    <div class="buttons">
        <TitleButtons />
    </div>
</div>

<style lang="scss">
    .UI {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .buttons {
        display: flex;
    }
    :global(body) {
        background-color: var(--base);
    }
</style>
