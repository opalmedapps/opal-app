const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OpalEnv = require("./opal-env.setup");

let entry = [
	"./src/js/app.js",
	"./src/js/app.services.js",
	"./src/js/app.routes.js",
	"./src/js/app.configs.js",
	"./src/js/app.directives.js",
	"./src/js/app.filters.js",
	"./src/js/app.controllers.js",
	"./src/js/app.constants.js",
	"./src/js/app.values.js",
];

const config = env => {
	console.log("Webpack variables:", env);

	// Parse the Opal environment to use, specified for example via webpack as `--env opal_environment=%npm_config_env%` and npm as `--env=dev`
	const OPAL_ENV = env?.opal_environment;

	// Throws error if the defined folder for environment does not exist.
	OpalEnv.verifyOpalEnvironmentExists(OPAL_ENV);
	console.log(`OPAL ENVIRONMENT: ${OPAL_ENV}`);
	const OPAL_ENV_FOLDER = path.join(__dirname, (OPAL_ENV) ? `./env/${OPAL_ENV}` : './');

	// Read environment settings from opal.config.js
	let requiredSettingNames = ["useSourceMap", "webpackMode"];
	let settings = {};
	requiredSettingNames.forEach(name => settings[name] = OpalEnv.getEnvSetting(name, OPAL_ENV));
	console.log("Environment settings:", settings);

	// Check whether to minimize the output (default = true)
	let minimize;
	if (!env || typeof env.minimize === "undefined") minimize = true; // Default
	else if (env.minimize === "true") minimize = true;
	else if (env.minimize === "false") minimize = false;
	else throw `Incorrect value provided for minimize variable: --env.minimize=${env.minimize}. Please use a boolean (true or false).`;

	return {
		entry: entry,
		devtool: settings.useSourceMap ? 'eval-cheap-source-map' : undefined,
		mode: settings.webpackMode,
		devServer: {
			static: {
				directory: './www',
				watch: true,
			},
			client: {
				overlay: false,
				progress: true,
			},
			compress: true,
			hot: false,
			liveReload: true,
			host: 'localhost',
			port: 9000
		},
		output: {
			path: path.resolve(__dirname, 'www'),
			filename: '[name].[chunkhash].js',
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
							plugins: [
								["@babel/plugin-transform-runtime", {
									// Note: this option will be removed with @babel/core version 8
									// See: https://babeljs.io/docs/babel-plugin-transform-runtime#regenerator
									regenerator: true
								}]
							]
						}
					}
				},
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader']
				},
				{
					test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
					type: 'asset/resource'
				},
				{
					// CHANGE TO ALLOW ONSEN TO COMPILE WITH WEBPACK, Modernizr has a weird passing of document, window properties
					// to make it work I looked at this issue: basically it re-attaches this to window.
					test: /onsenui.js/,
					use: [
						{
							loader: 'imports-loader?this=>window'
						},
						{
							loader: 'exports-loader?window.Modernizr'
						}
					],

				},
				// CHANGE TO ALLOW ONSEN TO COMPILE WITH WEBPACK, When compiling with Webpack, the Fastclick library
				// in onsenui (get rid of the 300ms delay) has a set of if statements to determine the sort of
				// module resolution system available in the environment, the rules here simply deactive AMD modules
				// and node modules and makes Fastclick implement the Web interface.
				{
					test: /onsenui.js/,
					use: [
						{
							loader: 'imports-loader?define=>false,module.exports=>false'
						}
					],
				},
				{
					test: /\.png$/,
					type: 'asset/resource'
				}
			]
		},
		plugins: [
			new CleanWebpackPlugin(),
			new CopyPlugin({
				patterns: [
					{ from: './src/img', to: './img' },
					{ from: './src/Languages', to: './Languages' },
					{ from: './src/views', to: './views' },
				],
			}),
			new webpack.ProvidePlugin({
				OPAL_CONFIG: path.join(OPAL_ENV_FOLDER, "opal.config.js"),
				WEB_VERSION: path.join(__dirname, "web-version.json"),
				$: "jquery",
				jQuery: "jquery",
				firebase: "firebase",
				CryptoJS: "crypto-js",
				Highcharts: "highcharts",
			}),
			new HtmlWebpackPlugin({
				template: './src/index.html',
				inject: 'head',
				// v5 changed script loading to be deferred, revert to previous default
				scriptLoading: 'blocking',
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
			new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en|fr/),
			new NodePolyfillPlugin({
				additionalAliases: ['process'],
			}),
		],
		optimization: {
			minimize: minimize,
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						output: {
							comments: false, // Do not include
						},
					},
					extractComments: true, // Extracts certain comments (@preserve, @license, etc.) to a .LICENSE.txt file
				}),
			],
		}
	};
};

module.exports = config;
