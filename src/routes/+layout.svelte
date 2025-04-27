<script>
	import '../app.css';
	let { children } = $props();
</script>

{@render children()}

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

</style>
