// SPDX-FileCopyrightText: Copyright (C) 2015 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   app.js
 * Description  :   Contains all app configurations and routes.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   July 2015
 */

/**
 * @ngdoc overview
 * @description <img src="img/Opal_Name_Logo.png" alt="Opal logo" /><br>
 A multiplatform application built using {@link https://cordova.apache.org Apache Cordova}. The main frameworks for the project are {@link https://angularjs.org/ AngularJS} framework, {@link https://onsen.io/ OnsenUI} Framework, and {@link https://cordova.apache.org Apache Cordova}
 This guide is the first version of the documentation for the Opal mobile app
 Main module for the project: {@link OpalApp}.3
 The external dependecies for the project: {@link ProjectDependencies}.
 **/

/**
 *@ngdoc object
 *@name ProjectDependencies
 *@description All the third party dependencies for the application dependencies for the application
 */

/**
 *@ngdoc object
 *@name ProjectDependencies.ngAnimate
 *@description Depencency used to create jQuery like animations, but within the Angular framework in the project.
 *Link to external reference {@link https://github.com/angular/bower-angular-animate}.
 */

/**
 *@ngdoc object
 *@name ProjectDependencies.ngSanitize
 *@description Dependency used to clean up and indent the html code.
 Link to external reference {@link https://github.com/angular/bower-angular-sanitize}.
 */

/**
 *@ngdoc object
 *@name ProjectDependencies.uiselect
 *@description Dependency used in the messages view. Provides the search bar for the mailbox. Link to external reference {@link https://github.com/angular-ui/ui-select}.
 */

/**
 *@ngdoc object
 *@name ProjectDependencies.uirouter
 *@description Dependency used in the project to provide a routing service to change views,
 NOTE: Once in the Home page, the routing is dealt by onsen functions. Link to external reference {@link https://github.com/angular-ui/ui-router}.
 */

/**
 *@ngdoc object
 *@name ProjectDependencies.onsen
 *@description Dependency used to create html/AngularJS elements that provide a native like feeling to the app. User accross all the views.
 * Link to external reference {@link https://github.com/OnsenUI/OnsenUI}.
 */

/**
 *@ngdoc object
 *@name ProjectDependencies.uibootstrap
 *@description Dependency used accross all views. Provides a way to interact with bootstrap elements using the Angular Framework.
 *Link to external reference {@link https://github.com/angular-ui/bootstrap}.
 */

import "jquery";
import angular from "angular";
import "angular-animate";
import "../lib/ui-bootstrap-tpls-2.5.6-opal.js";
import "angular-translate";
import "angular-dynamic-locale";
import "angular-translate-handler-log";
// for pluralization support: https://angular-translate.github.io/docs/#/guide/14_pluralization
import "angular-translate-interpolation-messageformat";
import "angular-translate-loader-partial";
import "angular-ui-router";
import "angular-touch";
import "bootstrap";
import "angular-sanitize";
import "onsenui/js/onsenui";
import "moment";
import "crypto-js";
import "tweetnacl";
import "tweetnacl-util";
import "onsenui/css/onsen-css-components-blue-basic-theme.css";
import "onsenui/css/onsenui.css";
import "angular/angular-csp.css";
import "bootstrap/dist/css/bootstrap.css";
import "animate.css";
import "../css/app.css";
import "../css/elements/custom-toast.element.css";
import "../Languages/angular-locales/angular-locale_en.js";

// Load angular module bootstrap script
import "./app.bootstrap";

// Font Awesome
// See: https://stackoverflow.com/questions/52376720/how-to-make-font-awesome-5-work-with-webpack
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

//Routes for angular views
angular
    .module('OpalApp', ['tmh.dynamicLocale','pascalprecht.translate',
        'ngSanitize','ui.router','onsen','ngTouch','ui.bootstrap'])
    .run(initialization);

initialization.$inject = ['$state', '$stateParams', '$q', '$rootScope' ,'$translate', '$location', 'NetworkStatus'];

/**
 *@ngdoc service
 *@description Service is in charge of checking that the user is authorized at every state change by checking the parameters stored
 in the Firebase localstorage,  Check run service on angular {{link}}
 **/
function initialization($state, $stateParams, $q, $rootScope, $translate, $location, NetworkStatus) {

    var isOffline = 'onLine' in navigator && !navigator.onLine;

    if ( isOffline ) {
       NetworkStatus.setStatus(false);
    }
    else {
        NetworkStatus.setStatus(true);
    }

    $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
        $translate.refresh();
    });
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
}
