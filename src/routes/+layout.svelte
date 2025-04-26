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
	.mainbg {
		width: 100%; /* Lebar elemen 100% dari lebar kontainer */
		height: 100%; /* Tinggi elemen */
		background-image: url('/tumbuh1.jpeg'); /* URL gambar */
		background-size: cover; /* Sesuaikan gambar agar menutupi elemen */
		background-position: center; /* Pusatkan gambar */

		background-repeat: no-repeat; /* Jangan ulangi gambar */
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
