import typescript from 'rollup-plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import { version, name } from './package.json';
const input = './src/index.ts';
const tsPlugin = typescript({ module: 'es2015' });
const output = {
  exports: 'named',
  banner: `/* ${name} version ${version} */`,
};
const plugins = [
  tsPlugin,
  terser({
    output: {
      comments: function(node, comment) {
        var text = comment.value;
        return /unaxios/i.test(text);
      },
    },
  }),
];
export default [
  {
    input,
    plugins,
    output: Object.assign({}, output, {
      name: 'unaxios',
      file: 'dist/unaxios.umd.js',
      format: 'umd',
    }),
  },
  {
    input,
    plugins,
    external: ['unfetch/polyfill'],
    output: Object.assign({}, output, {
      file: 'dist/unaxios.es.js',
      format: 'esm',
    }),
  },
];
