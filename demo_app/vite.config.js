import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    root: 'website',
    publicDir: 'assets',
    plugins: [react()],
    resolve: {
        alias: {
            'modules': path.resolve(__dirname, 'website/js/modules'),
            'utils': path.resolve(__dirname, 'website/js/utils'),
            'views': path.resolve(__dirname, 'website/js/views'),
            'components': path.resolve(__dirname, 'website/js/components'),
        }
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true
    },
    server: {
        port: 3000,
        open: false
    }
})
