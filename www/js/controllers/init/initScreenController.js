/*
 * Filename     :   initScreenController.js
 * Description  :   Manages app initialization
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   28 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('InitScreenController', InitScreenController);

    InitScreenController.$inject = [
        'NavigatorParameters',
        '$translatePartialLoader',
        'UserPreferences',
        '$filter',
        'Constants',
        'Permissions',
        'DynamicContentService'
    ];

    /* @ngInject */
    function InitScreenController(
        NavigatorParameters,
        $translatePartialLoader,
        UserPreferences,
        $filter,
        Constants,
        Permissions,
        DynamicContentService
    ) {
        var vm = this;
        vm.globalMessage = '';
        vm.globalMessageDescription = '';

        vm.goToMessage = goToMessage;
        vm.goToParking = goToParking;
        vm.goToGeneralSettings = goToGeneralSettings;
        vm.goToPatientCharter = goToPatientCharter;
        vm.reportIssuesMail = reportIssuesMail;
        vm.goToLogin = goToLogin;


        activate();

        ////////////////

        function activate() {

            // Initialize the service message to all users.
            DynamicContentService.initializeLinks()
                .then(function (response) {
                    if(!response.exists){
                        DynamicContentService.setContentData(response.data);
                    }
                    return DynamicContentService.getPageContent('service');
                })
                .then(function successCallback(response) {
                    for (var key in response.data){
                        if(response.data[key] !== ""){
                            vm.globalMessage = key;
                            vm.globalMessageDescription = response.data[key];
                            break;
                        }
                    }
                })
                .catch(function errorCallback(error) {

                });

            //Add the login translation
            $translatePartialLoader.addPart('login');

            //Initialize language if not initialized
            UserPreferences.initializeLanguage();

            //Do not show the list breaking, equivalent of ng-cloak for angularjs, LOOK IT UP!!! https://docs.angularjs.org/api/ng/directive/ngCloak
            setTimeout(function(){
                $("#listInitApp").css({display:'block'});
                NavigatorParameters.setNavigator(initNavigator);
            },10);

            // Get location permission
            Permissions.enablePermission('ACCESS_FINE_LOCATION', 'LOCATION_PERMISSION_DENIED')
                .catch(function (response) {
                    NewsBanner.showCustomBanner($filter('translate')(response.Message), '#333333', function(){}, 5000);
                });

        }

        /**
         * Views the details of the global message
         */
        function goToMessage(){
            NavigatorParameters.setParameters('initNavigator');
            initNavigator.pushPage('./views/init/message.html',{animation:'lift'});
        }

        /**
         * Go to parking function
         */
        function goToParking()
        {
            NavigatorParameters.setParameters('initNavigator');
            initNavigator.pushPage('./views/general/parking/parking.html');
        }

        /**
         * Go to general settings
         */
        function goToGeneralSettings()
        {
            NavigatorParameters.setParameters({'Navigator':'initNavigator'});
            initNavigator.pushPage('./views/init/init-settings.html');
        }

        /**
         * Go to patient charter
         */
        function goToPatientCharter()
        {
            initNavigator.pushPage('./views/templates/content.html', {data : {contentType : 'patient_charter'}});
        }

        /**
         * Report issues function
         */
        function reportIssuesMail()
        {
            if(Constants.app){
                var email = {
                    to: 'opal@muhc.mcgill.ca',
                    cc: '',
                    bcc: [],
                    subject: $filter("translate")("OPALPROBLEMSUBJECT"),
                    body: '',
                    isHtml: true
                };
                cordova.plugins.email.isAvailable(function(isAvailable){
                    if(isAvailable)
                    {
                        cordova.plugins.email.open(email,function(sent){

                        },this);
                    }else{

                    }
                });
            }
        }

        /**
         * Go to login page
         */
        function goToLogin()
        {
            initNavigator.pushPage('./views/login/login.html',{animation:'lift'});
        }

    }

})();