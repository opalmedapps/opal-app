// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OpalEnv = require("./opal-env.setup");
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

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

// Utility function, see: https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
let capitalizeFirstLetter = word => String(word).charAt(0).toUpperCase() + String(word).slice(1);

const config = env => {
	console.log("Webpack variables:", env);

	// Parse the Opal environment to use, specified for example via webpack as `--env opal_environment=%npm_config_env%` and npm as `--env=local`
	const OPAL_ENV = env?.opal_environment;

	const EXTERNAL_CONTENT_LOCAL_FILE_PATH = './content/content.config.json';
	const SERVICE_STATUS_FILE_PATH = './content/service-status.json';

	// Throws error if the defined folder for environment does not exist.
	OpalEnv.verifyOpalEnvironmentExists(OPAL_ENV);
	console.log(`OPAL ENVIRONMENT: ${OPAL_ENV}`);
	const OPAL_ENV_FOLDER = path.join(__dirname, (OPAL_ENV) ? `./env/${OPAL_ENV}` : './');

	// Read environment settings from opal.config.js
	let requiredSettingNames = ["externalContentFileURL", "serviceStatusURL", "useSourceMap", "webpackMode"];
	let settings = {};
	requiredSettingNames.forEach(name => settings[name] = OpalEnv.getEnvSetting(name, OPAL_ENV));
	console.log("Environment settings:", settings);

	// Check whether to minimize the output (default = true)
	let minimize;
	if (!env || typeof env.minimize === "undefined") minimize = true; // Default
	else if (env.minimize === "true") minimize = true;
	else if (env.minimize === "false") minimize = false;
	else throw `Incorrect value provided for minimize variable: --env.minimize=${env.minimize}. Please use a boolean (true or false).`;

	// Get the web app name (for the progressive web app, to add to manifest.json)
	let webAppName = OPAL_ENV === 'prod' ? 'Opal Web' : `Opal Web ${capitalizeFirstLetter(OPAL_ENV)}`;

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
					test: /\.(html|md)$/,
					loader: 'raw-loader',
				},
				{
					test: /\.m?js$/,
					// See: https://www.npmjs.com/package/babel-loader#some-files-in-my-node_modules-are-not-transpiled-for-ie-11
					exclude: {
						// By default, exclude all node_modules (recommended by babel-loader)
						and: [/node_modules/],
						not: [
							// Use babel to transpile pdfjs, which includes modern syntax that crashes on old devices (e.g. on iOS 16).
							/pdfjs-dist/,
						]
					},
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
					},
					// Fix error "Can't resolve [...] in '/builds/opalmedapps/qplus/node_modules/pdfjs-dist/legacy/build' [...] The extension in the request is mandatory for it to be fully specified."
					// See: https://stackoverflow.com/questions/69427025/programmatic-webpack-jest-esm-cant-resolve-module-without-js-file-exten
					resolve: {
						fullySpecified: false,
					},
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
					// This solution was found online, see: https://github.com/webpack/webpack/issues/512#issuecomment-288143187
					// Original code: loader: 'imports-loader?this=>window!exports-loader?window.Modernizr'
					// It has since been rewritten to a new syntax due to Webpack / imports-loader / exports-loader updates
					test: /onsenui.js/,
					use: [
						// Adds the following to the output bundle: (function () { ... }).call(window);
						{
							loader: 'imports-loader?type=commonjs&wrapper=window',
						},
						// Adds the following to the output bundle: module.exports = window.Modernizr;
						{
							loader: 'exports-loader?type=commonjs&exports=single|window.Modernizr',
						},
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
							loader: 'imports-loader',
							options: {
								additionalCode: 'var define = false; module.exports = false;',
							},
						},
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
					// NOTE: if the external content URL (e.g., externalContentFileURL) is set to the local file path
					// instead of the external server URL, the dynamic configurations will be loaded from local files.
					// See content/content.config.sample.json for more details.
					...(
						settings.externalContentFileURL === EXTERNAL_CONTENT_LOCAL_FILE_PATH ?
						[{ from: './content', to: './content' }] : []
					),
					// NOTE: if service status URL (e.g., serviceStatusURL) is set to the local file path
					// instead of the external server URL, the message content will be loaded from local file.
					...(
						settings.serviceStatusURL === SERVICE_STATUS_FILE_PATH ?
						[{
							from: './content/service-status.json',
							to: './content/service-status.json',
						}] : []
					),
				],
			}),
			new webpack.ProvidePlugin({
				CONFIG: path.join(OPAL_ENV_FOLDER, "opal.config.js"),
				WEB_VERSION: path.join(__dirname, "web-version.json"),
				$: "jquery",
				jQuery: "jquery",
				firebase: "firebase",
				CryptoJS: "crypto-js",
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
					"mobile-web-app-capable": "yes",
					// For Apple configs, see: https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
					"apple-mobile-web-app-capable": "yes",
					"apple-mobile-web-app-status-bar-style": "black-translucent",
					"apple-mobile-web-app-title": webAppName,
				}
			}),
			new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en|fr/),
			new NodePolyfillPlugin({
				additionalAliases: ['process'],
			}),
			new WebpackManifestPlugin({
				// Configure the web version as a progressive web app, see: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
				seed: {
					name: webAppName,
					short_name: webAppName,
					description: "Votre portail patient / Your patient portal",
					start_url: "/app/index.html",
					scope: "/",
					display: "standalone",
					theme_color: "#4CAF50",
					background_color: "#BADA55",
					icons: [
						{
							src: "img/web-icon-192.png",
							type: "image/png",
							sizes: "192x192",
						},
						{
							src: "img/web-icon-512.png",
							type: "image/png",
							sizes: "512x512",
						},
					],
				},
				// Don't add paths to other files
				filter: () => false,
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
