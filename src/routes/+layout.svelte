<script>
	import '../app.css';
	let { children } = $props();
	import { onMount } from 'svelte';

	onMount(() => {
		// register service worker
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/service-worker.js')
				.then(() => console.log('Service Worker registered'))
				.catch((err) => console.error('Service Worker registration failed:', err));
		}
	});
</script>

{@render children()}

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

</style>
