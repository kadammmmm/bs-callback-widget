import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/callback-widget.js',
  output: {
    file: 'dist/callback-widget.js',
    format: 'iife',  // CRITICAL: Must be IIFE for WxCC Desktop
    name: 'CallbackWidget',
    sourcemap: true
  },
  plugins: [
    resolve({
      browser: true
    }),
    terser({
      format: {
        comments: false
      }
    })
  ]
};
