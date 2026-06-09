import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    root: 'website',
    publicDir: 'assets',
    plugins: [react()],
    resolve: {
        alias: {
            'modules': path.resolve(__dirname, 'website/src/modules'),
            'utils': path.resolve(__dirname, 'website/src/utils'),
            'views': path.resolve(__dirname, 'website/src/views'),
            'components': path.resolve(__dirname, 'website/src/components'),
        }
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true
    },
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['color-functions', 'global-builtin', 'import', 'if-function']
            }
        }
    },
    server: {
        port: 3000,
        open: false,
        host: true,
        watch: {
            ignored: ['**/node_modules/**', '**/dist/**']
        }
    }
})
