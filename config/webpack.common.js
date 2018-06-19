/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */

const webpack = require('webpack');
const helpers = require('./helpers');

/*
 * Webpack Plugins
 */
const WebpackAssetsManifest = require('webpack-assets-manifest');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

/*
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = (options) => {
  return {
    mode: options.mode,
    entry: Object.assign({
      'app':                  './resource/js/app',
      'legacy':               './resource/js/legacy/crowi',
      'legacy-form':          './resource/js/legacy/crowi-form',
      'legacy-admin':         './resource/js/legacy/crowi-admin',
      'legacy-presentation':  './resource/js/legacy/crowi-presentation',
      'plugin':               './resource/js/plugin',
      'style':                './resource/styles/scss/style.scss',
      'style-presentation':   './resource/styles/scss/style-presentation.scss',
      // themes
      'style-theme-default':  './resource/styles/scss/theme/default.scss',
      'style-theme-default-dark':  './resource/styles/scss/theme/default-dark.scss',
      'style-theme-nature':   './resource/styles/scss/theme/nature.scss',
      'style-theme-mono-blue':   './resource/styles/scss/theme/mono-blue.scss',
      'style-theme-future': './resource/styles/scss/theme/future.scss',
      'style-theme-blue-night': './resource/styles/scss/theme/blue-night.scss',
    }, options.entry || {}),  // Merge with env dependent settings
    output: Object.assign({
      path: helpers.root('public/js'),
      publicPath: '/js/',
      filename: '[name].bundle.js',
    }, options.output || {}), // Merge with env dependent settings
    externals: {
      // require("jquery") is external and available
      //  on the global var jQuery
      'jquery': 'jQuery',
      'emojione': 'emojione',
      'hljs': 'hljs',
    },
    resolve: {
      extensions: ['.js', '.json'],
      modules: [helpers.root('src'), helpers.root('node_modules')],
      alias: {
        '@root': helpers.root('/'),
        '@alias/logger': helpers.root('lib/service/logger'),
        '@alias/locales': helpers.root('lib/locales'),
        // replace bunyan
        'bunyan': 'browser-bunyan',
      }
    },
    module: {
      rules: options.module.rules.concat([
        {
          test: /.jsx?$/,
          exclude: {
            test:    helpers.root('node_modules'),
            exclude: [  // include as a result
              helpers.root('node_modules/string-width'),
              helpers.root('node_modules/is-fullwidth-code-point'), // depends from string-width
            ]
          },
          use: [{
            loader: 'babel-loader?cacheDirectory'
          }]
        },
        {
          test: /locales/,
          loader: '@alienfast/i18next-loader',
          options: {
            basenameAsNamespace: true,
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
          exclude: [helpers.root('resource/styles/scss')]
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
          exclude: [helpers.root('resource/styles/scss')]
        },
        /*
         * File loader for supporting images, for example, in CSS files.
         */
        {
          test: /\.(jpg|png|gif)$/,
          use: 'file-loader',
        },
        /* File loader for supporting fonts, for example, in CSS files.
        */
        {
          test: /\.(eot|woff2?|svg|ttf)([?]?.*)$/,
          use: 'file-loader',
        }
      ])
    },
    plugins: options.plugins.concat([

      new WebpackAssetsManifest({ publicPath: true }),

      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),

      // ignore
      new webpack.IgnorePlugin(/^\.\/lib\/deflate\.js/, /markdown-it-plantuml/),

      new LodashModuleReplacementPlugin,

      new webpack.ProvidePlugin({ // refs externals
        jQuery: 'jquery',
        $: 'jquery',
      }),

    ]),

    devtool: options.devtool,
    target: 'web', // Make web variables accessible to webpack, e.g. window
    optimization: {
      namedModules: true,
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /resource/,
            chunks: 'initial',
            name: 'commons',
            minChunks: 2,
            minSize: 1,
            priority: 20
          },
          vendors: {
            test: /node_modules/,
            chunks: (chunk) => {
              return chunk.name !== 'legacy-presentation';
            },
            name: 'vendors',
            // minChunks: 2,
            minSize: 1,
            priority: 10,
            enforce: true
          }
        }
      },
      minimizer: options.optimization.minimizer || [],
    },
    performance: options.performance || {},
    stats: options.stats || {},
  };
};
