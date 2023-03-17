import del from 'rollup-plugin-delete';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import external from 'rollup-plugin-peer-deps-external'

const src = './src/index.ts';
const dirPath = './tmp';

module.exports = {
  input: src,
  output: [
    {
      file: "./tmp/index.js",
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      // plugins: [terser()],
    }
  ],
  plugins: [
    del({ targets: `${dirPath}/*` }),
    external(),
    resolve(),
    typescript({
      tsconfig: './tsconfig.rollup.json',
      rollupCommonJSResolveHack: true,
      tsconfigOverride: { include: [src] },
      exclude: ['**/__tests__/**'],
      clean: true,
    }),
    commonjs(),
  ],
};
