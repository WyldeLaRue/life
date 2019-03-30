const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.(frag|vert|glsl)$/,
        use: [
          {
            loader: 'glsl-shader-loader',
            options: {}
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
        title: 'Life!',
        filename: 'index.html',
        meta: {
            viewport: 'width=device-width, userscalable=no, ' +
                      'minimum-scale=1.0, maximum-scale=1.0'
        }
    })
  ]
};






