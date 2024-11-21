/*
 * Filename     :   bootstrap.js
 * Description  :   This file initializes the application on DOMContent Loaded. It must be placed in the
 *                  index.html file after all other project scripts have been loaded. It accounts for
 *                  device loading as well as browser loading.
 * Created by   :   Robert Maglieri
 * Date         :   21 Feb 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */
import angular from "angular";
 
/*
Bootstraping the application
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
