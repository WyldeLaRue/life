const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'production',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'docs')
  },
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






