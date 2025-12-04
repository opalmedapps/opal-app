// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

let mobileApp = window.hasOwnProperty("cordova");

angular.module('OpalApp').constant('Constants', {
	app: mobileApp,
	version: () => {
		return mobileApp ? AppVersion.version : WEB_VERSION.version;
	},
	build: () => {
		return mobileApp ? AppVersion.build : WEB_VERSION.build;
	}
});
