// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   bootstrap.js
 * Description  :   This file initializes the application on DOMContent Loaded. It must be placed in the
 *                  index.html file after all other project scripts have been loaded. It accounts for
 *                  device loading as well as browser loading.
 * Created by   :   Robert Maglieri
 * Date         :   21 Feb 2017
 */
import angular from "angular";

/*
 * Bootstrapping the application
 */
(()=>{
    "use strict";
	const app = window.hasOwnProperty("cordova");
	if (app){
		document.addEventListener("deviceready", function() {
			angular.bootstrap(document, ['OpalApp']);
		}, false);
	}
	else {
		angular.element(document).ready(function(){
			angular.bootstrap(document, ['OpalApp']);
		})
	}
})();
