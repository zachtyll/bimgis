/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

// web-ifc loads its wasm at runtime from /wasm/. We use the single-threaded build,
// so no COOP/COEP headers are needed (see docs/design/02-frontend-architecture.md).
function copyWebIfcWasm() {
    return {
        name: 'copy-web-ifc-wasm',
        buildStart() {
            mkdirSync('public/wasm', { recursive: true });
            copyFileSync('node_modules/web-ifc/web-ifc.wasm', 'public/wasm/web-ifc.wasm');
        },
    };
}

export default defineConfig({
    plugins: [vue(), copyWebIfcWasm()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        // Platform API (Quarkus, code-with-quarkus/). Same origin in the browser, so no CORS needed.
        proxy: { '/api': 'http://localhost:8080' },
        // Allow importing example data from ../spec (single source of truth for the examples).
        fs: { allow: ['..'] },
    },
    test: {
        // The generated BCF client ships its own (mocha) specs.
        exclude: ['**/node_modules/**', 'src/api/generated/**'],
    },
    optimizeDeps: {
        exclude: ['web-ifc'],
    },
});
