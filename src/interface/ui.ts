import UI from './UI.svelte'

const app = new UI({
    target: document.getElementById('app') as HTMLElement
})

export default app