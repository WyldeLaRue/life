const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');



var config = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
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
        title: 'Life',
        filename: 'index.html',
        meta: {
            viewport: 'width=device-width, user-scalable=no, ' +
                      'minimum-scale=1.0, maximum-scale=1.0'
        }
    })
  ]
};

var module_exports = (env, argv) => {

    if (argv.mode == 'development') {
        config.mode = 'development';
        config.devtool = 'export-source-map';
        config.output.path = path.resolve(__dirname, 'dist');
    }

    if  (argv.mode == 'production') {
        config.mode = 'production';
        config.output.path = path.resolve(__dirname, 'docs');
        config.optimization = {
            namedModules: false,
            namedChunks: false,
            nodeEnv: 'production',
            flagIncludedChunks: true,
            occurrenceOrder: true,
            usedExports: true,
            concatenateModules: true,
            splitChunks: {
                hidePathInfo: true,
                minSize: 30000
            },
            minimize: true
        };

    return config;
    }
}
// weird bug, idk why this works, but returning a function is not working
// There appears to be an active issue on it in the webpack github repo
module.exports = module_exports("env", {mode: 'production'});




