const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OpalEnv = require("./opal_env.setup");

let entry = [
	"./src/js/app.js",
	"./src/js/app.services.js",
	"./src/js/app.routes.js",
	"./src/js/app.configs.js",
	"./src/js/app.directives.js",
	"./src/js/app.filters.js",
	"./src/js/app.controllers.js",
	"./src/js/app.constants.js",
	"./src/js/app.values.js"];

const config = env => {

	const isProduction = env && env.production;
	// opal environment e.g. `$webpack --env.opal_environment=preprod`
	const OPAL_ENV = (env) ? env.opal_environment : null;
	console.log(`OPAL ENVIRONMENT: ${OPAL_ENV || "default (root directory)"}`);
	// Throws error if the defined folder for environment does not exist.
	OpalEnv.verifyOpalEnvironmentExists(OPAL_ENV);
	const OPAL_ENV_ROOT = path.join(__dirname, './env');
	const OPAL_ENV_FOLDER = path.join(__dirname, (OPAL_ENV) ? `./env/${OPAL_ENV}` : './');
	return {
		entry: entry,
		devtool: (isProduction) ? 'source-map' : 'eval-cheap-source-map',
		mode: (isProduction) ? 'production' : 'development',
		devServer: {
			contentBase: './www',
			compress: true,
			hot: false,
			watchContentBase: true,
			liveReload: true,
			port: 9000
		},
		output: {
			path: path.resolve(__dirname, 'www'),
			filename: (isProduction) ? '[name].[chunkhash].js' : '[name].[hash].js',
		},
		module: {
			noParse: /jquery|lodash/,
			rules: [
				{
					test: /\.html$/,
					loader: 'raw-loader',
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
							plugins: ['@babel/plugin-proposal-private-methods',
								'@babel/plugin-proposal-class-properties', 
								["@babel/plugin-transform-runtime", {
									regenerator: true
								}]]

						}
					}
				},
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader']
				},
				{
					test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: '[name].[ext]',
								outputPath: 'fonts/'
							},
						}
					]
				},
				{
					// CHANGE TO ALLOW ONSEN TO COMPILE WITH WEBPACK, Modernizr has a weird passing of document, window properties
					// to make it work I looked at this issue: basically it re-attaches this to window.
					test: /onsenui.js/,
					loader: 'imports-loader?this=>window!exports-loader?window.Modernizr'

				},
				// CHANGE TO ALLOW ONSEN TO COMPILE WITH WEBPACK, When compiling with Webpack, the Fastclick library
				// in onsenui (get rid of the 300ms delay) has a set of if statements to determine the sort of
				// module resolution system available in the environment, the rules here simply deactive AMD modules
				// and node modules and makes Fastclick implement the Web interface.
				{
					test: /onsenui.js/,
					loader: 'imports-loader?define=>false,module.exports=>false'
				},
				{
					test: /\.png$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								mimetype: 'image/png'
							}
						}
					]
				}
			]
		},
		plugins: [
			new CleanWebpackPlugin(),
			new CopyPlugin([
				{ from: './src/img', to: './img' },
				{ from: './src/Languages', to: './Languages' },
				{ from: './src/views', to: './views' },
			]),
			new webpack.ProvidePlugin({
				OPAL_CONFIG: path.join(OPAL_ENV_FOLDER, "opal.config.js"),
				WEB_VERSION: path.join(OPAL_ENV_ROOT, "web-version.json"),
				$: "jquery",
				jQuery: "jquery",
				firebase: "firebase",
				CryptoJS: "crypto-js",
				Highcharts: "highcharts",
			}),
			new HtmlWebpackPlugin({
				template: './src/index.html',
				inject: 'head',
				title: 'Opal',
				filename: 'index.html',
				meta: {
					'Cache-Control': {
						'http-equiv': 'Cache-Control', 'content': 'no-cache'
					},
					'Pragma': {
						'http-equiv': 'Pragma', 'content': 'no-cache'
					},
					'Expires': {
						'http-equiv': 'Expires', 'content': '0'
					},
					'X-UA-Compatible': {
						'http-equiv': 'X-UA-Compatible', 'content': 'IE=edge'
					},
					'Content-Type': {
						'http-equiv': 'Content-Type',
						'content': 'text/html; charset=UTF-8; X-Content-Type-Options=nosniff'
					},
					"format-detection": "telephone=no",
					"apple-mobile-web-app-capable": "yes",
					"mobile-web-app-capable": "yes"
				}
			}),
			new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en|fr/)
		],
		optimization: {
			minimize: true,
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						output: {
							comments: false, // Do not include
						},
					},
					extractComments: true,
					chunkFilter: (chunk) => {
						// Our AngularJS js files do not minimize correctly due to the way the code is written.
						// Therefore we skip minification for these files.
						return chunk.name !== 'main';
					},
				}),
			],
		}
	};
};

module.exports = config;
