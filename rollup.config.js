import typescript from 'rollup-plugin-typescript';
const input = './src/index.ts';
const tsPlugin = typescript({ module: 'es2015' });
export default [
  {
    input,
    plugins: [tsPlugin],
    output: {
      exports: 'named',
      name: 'unaxios',
      file: 'dist/unaxios.umd.js',
      format: 'umd',
    },
  },
  {
    input,
    plugins: [tsPlugin],
    external: ['unfetch/polyfill'],
    output: [
      {
        exports: 'named',
        file: 'dist/unaxios.es.js',
        format: 'esm',
      }
    ],
  },
];
