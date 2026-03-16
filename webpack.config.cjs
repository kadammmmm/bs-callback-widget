const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/callback-widget.js',
  output: {
    filename: 'callback-widget.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'CallbackWidget',
      type: 'umd',
      export: 'default'
    },
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  // Don't bundle the SDK - it's provided by Agent Desktop runtime
  externals: {
    '@wxcc-desktop/sdk': {
      commonjs: '@wxcc-desktop/sdk',
      commonjs2: '@wxcc-desktop/sdk',
      amd: '@wxcc-desktop/sdk',
      root: 'wxcc'
    }
  }
};
