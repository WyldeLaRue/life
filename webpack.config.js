const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'docs')
  },
  devtool: "inline-source-map",
  module: {
    rules: [{
      test: /\.(frag|vert|glsl)$/,
      use: [
        {
          loader: 'glsl-shader-loader',
          options: {}
        }
      ]
    }]
  }
};






