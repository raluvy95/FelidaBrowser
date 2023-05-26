import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import sveltePreprocess, { sass } from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import livereload from 'rollup-plugin-livereload';
import css from "rollup-plugin-css-only";

function config(name) {
    return {
        input: `./src/interface/${name}.ts`,
        output: {
            format: 'iife',
            file: `./compiled-interface/${name}.js`
        },
        plugins: [
            svelte({
                preprocess: sveltePreprocess(),
            }),
            resolve({ browser: true }),
            commonjs({
                transformMixedEsModules: true
            }),
            typescript({
                tsconfig: "tsconfig.interface.json",
                sourceMap: true
            }),
            css({
                output: `${name}.css`
            })
        ],
    };
}

export default [
    config("index"),
    config("ui")
]