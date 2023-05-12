import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import postcssNested from 'postcss-nested';
import autoprefixer from 'autoprefixer';


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
    ],
    css: {
        postcss: {
            plugins: [
                postcssNested,
                autoprefixer,
            ],
        },
    },
});
