/*
 * Filename     :   app.js
 * Description  :   Contains all app configurations and routes.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   July 2015
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 * @author MUHC Hospital, David Herrera, Robert Maglieri
 * @copyright 2016 MUHC Hospital
 *
 */

/**
 * @ngdoc overview
 * @name MUHCApp
 *@description <img src="img/Opal_Name_Logo.png" alt="MUHCLogo" /><br>
 A multiplatform application built using {@link https://cordova.apache.org Apache Cordova}. The main frameworks for the project are {@link https://angularjs.org/ AngularJS} framework , {@link https://onsen.io/ OnsenUI} Framework, and {@link https://cordova.apache.org Apache Cordova} This project aims to aid patients in radiation oncology
 * at the Glen Hospital in Montreal, Quebec. This guide is the first version of the documentation for the Opal Hybrid Mobile app
 Main module for the project: {@link MUHCApp}.3
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
 *@name ProjectDependencies.lueggdirectives
 *@description Dependency used in the messages page to scroll automatically as messages are added to
 *conversations. Link to external reference {@link https://github.com/Luegg/angularjs-scroll-glue}.
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
 *@name ProjectDependencies.firebase
 *@description dependency used to create the user authorization service, if user not authorized, i.e. token expired the user will be redirected to the login screen. Used also by the {@link MUHCApp.logOutController logOutController} to unauthorized users at logout. Link to external reference {@link https://github.com/firebase/angularfire}.
 */

/**
 *@ngdoc object
 *@name ProjectDependencies.uibootstrap
 *@description Dependency used accross all views. Provides a way to interact with bootstrap elements using the Angular Framework.
 *Link to external reference {@link https://github.com/angular-ui/bootstrap}.
 */

/**
 *@ngdoc object
 *@name ProjectDependencies.ngCordova
 *@description Dependency provides native device plugins from Cordova as modules that can be used within the Angular framework. Link to external reference {@link https://github.com/driftyco/ng-cordova}.
 */
import "jquery";
import angular from "angular";
import "angular-animate";
import "angular-ui-bootstrap";
import "../lib/ui-bootstrap-tpls-1.1.2";
import "angular-translate";
import "angular-dynamic-locale";
import "angular-translate-handler-log";
import "angular-translate-loader-partial";
import "angular-ui-router";
import "angular-touch";
import "bootstrap";
import "angularfire";
import firebase from "firebase";
import "angularjs-scroll-glue";
import "angular-sanitize";
import "onsenui/js/onsenui";
import "ngCordova";
import "angular-tek-progress-bar";
import "angular-elastic";
import "moment";
import "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker";
import "pdfjs-dist/web/pdf_viewer";
import "crypto-js";
import "tweetnacl";
import "tweetnacl-util";
import "onsenui/css/onsen-css-components-blue-basic-theme.css";
import "onsenui/css/onsenui.css";
import "angular/angular-csp.css";
import "bootstrap/dist/css/bootstrap.css";
import "animate.css";
import "font-awesome/css/font-awesome.css";
import "../css/app.css";
import "../css/custom-toast.css";
import "../Languages/angular-locales/angular-locale_en.js"

// Load angular module bootstrap script
import "./app.bootstrap";

//Routes for angular views
const app = angular
    .module('MUHCApp', ['tmh.dynamicLocale','pascalprecht.translate','luegg.directives',
        'ngSanitize','ui.router', 'onsen', 'ngTouch','firebase','ui.bootstrap',//'MUHCApp.filters',
        'ngCordova','monospaced.elastic','Tek.progressBar']);

/**
 *@ngdoc service
 *@name MUHCApp.run
 *@description Service is in charge of checking that the user is authorized at every state change by checking the parameters stored
 in the Firebase localstorage,  Check run service on angular {{link}}
 **/
app.run(function ($state, $stateParams,$q, $rootScope,$translate, Patient,$location, NetworkStatus) {

    var isOffline = 'onLine' in navigator && !navigator.onLine;

    if ( isOffline ) {
       NetworkStatus.setStatus(false);
    }
    else {
        NetworkStatus.setStatus(true);
    }


    $rootScope.$on('$stateChangeStart',function(event,toState,toParams)
    {
        let serialNum = Patient.getUserSerNum();
        if((typeof serialNum === 'undefined'|| serialNum === '')&&toState.name === 'Home')
        {
            $location.path('/init');
        }
    });
    $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
        $translate.refresh();
    });
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
        // We can catch the error thrown when the $requireSignIn() promise is rejected
        // and redirect the user back to the home page
        $state.go('init');
        //console.log('listening');
        if (error === "AUTH_REQUIRED") {
            /**
             *@ngdoc method
             *@name redirectPage
             *@methodOf MUHCApp.run
             *@returns {void} Returns a promise to perform an synch refresh page right after redirecting to the login state.
             *@description Using the angularfire, $firebaseAuth, service, it checks whether is authorized, if its not
             *it redirects the user to the logIn page, by using the login state and reloads the page.
             */
            function redirectPage(){
                const r=$q.defer();
                $state.go('init');
                r.resolve('Went Init');
                return r.promise;
            }
            redirectPage().then(setTimeout(function(){location.reload()},100));
        }
    });
});

