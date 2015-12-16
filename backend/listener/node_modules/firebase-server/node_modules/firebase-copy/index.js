'use strict';
var resolve = require('resolve');
var FIREBASE_PATH = require.resolve('firebase');
var FIRBASE_DIR = require('path').dirname(FIREBASE_PATH);
var contents = require('fs').readFileSync(FIREBASE_PATH);

var create = new Function('module', 'require', contents); // eslint-disable-line no-new-func

function createRequireFunc(customResolver) {
	return function (requestedPath) {
		var resolvedPath = null;
		try {
			resolvedPath = resolve.sync(requestedPath, {basedir: FIRBASE_DIR});
		} catch (e) {}
		return customResolver(requestedPath, resolvedPath);
	};
}

function defaultResolver(requestedPath, resolvedPath) {
	return require(resolvedPath); // eslint-disable-line global-require
}

module.exports = function (customResolver) {
	var module = {exports: {}};
	create(module, createRequireFunc(customResolver || defaultResolver));
	return module.exports;
};
