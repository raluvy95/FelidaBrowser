import App from "./mainbrowser/App.svelte";

const app = new App({
    target: document.getElementById("app") as HTMLElement
});

export default app;