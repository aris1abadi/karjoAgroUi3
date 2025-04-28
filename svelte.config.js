import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // direkomendasikan untuk GitHub Pages
      precompress: false,
      strict: true
    }),
    //prerender: {
    //  default: true // <<-- ini boleh untuk SvelteKit 2.16.0
    //}
  }
};

export default config;
