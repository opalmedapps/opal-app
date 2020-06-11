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
	const app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
	if (app){
		document.addEventListener("deviceready", function() {
			angular.bootstrap(document, ["MUHCApp"]);
		}, false);
	}
	else {
		angular.element(document).ready(function(){
			angular.bootstrap(document, ["MUHCApp"]);
		})
	}
})();


/**
 * @ngdoc object
 * @name Globals
 * @description Collection of all globally defined functions.
 */

/**
 * @ngdoc function
 * @methodOf Globals
 * @name handleOpenURL
 * @param {String} url Url of the reset password email link
 * @description Push a new page to the initNavigator stack along with the url and a passwordReset
 *              flag. This only occurs when the app is opened via CustomURLScheme plugin from a password
 *              reset email link.
 */

function handleOpenURL(url) {
    if(url.indexOf("opal://")!==-1){
        setTimeout(function() {
            if(typeof initNavigator!== "undefined"){
                initNavigator.pushPage("./views/login/security-question.html", {url: url, passwordReset: true});
            }
        }, 0);
    }
}