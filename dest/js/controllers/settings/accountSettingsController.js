/*
 * Filename     :   accountSettingsController.js
 * Description  :   Controllers that manage the account setting and subviews.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   03 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('accountSettingController', accountSettingController);

    accountSettingController.$inject = ['Patient', 'UserPreferences', '$scope', '$timeout', 'NavigatorParameters'];

    /* @ngInject */
    function accountSettingController(Patient, UserPreferences, $scope, $timeout, NavigatorParameters) {

        var vm = this;
        vm.title = 'accountSettingController';
        vm.passFill = '********';
        vm.mobilePlatform = (ons.platform.isIOS() || ons.platform.isAndroid());
        vm.FirstName = Patient.getFirstName();
        vm.LastName = Patient.getLastName();
        vm.PatientId = Patient.getPatientId();
        vm.Email = Patient.getEmail();
        vm.TelNum = Patient.getTelNum();
        vm.Language = UserPreferences.getLanguage();
        vm.ProfilePicture = Patient.getProfileImage();
        vm.passwordLength = 6;

        vm.accountDeviceBackButton = accountDeviceBackButton;
        vm.goToGeneralSettings = goToGeneralSettings;

        activate();

        ////////////////

        function activate() {

            loadSettings();

            // Setting our parameters for pushing and popping pages
            NavigatorParameters.setParameters({
                'Navigator':'settingsNavigator'
            });

            // After a page is popped reintialize the settings.
            settingsNavigator.on('postpop', function() {
                $timeout(function() {
                    loadSettings();
                });

            });

            settingsNavigator.on('prepush', function(event) {
                if (settingsNavigator._doorLock.isLocked()) {
                    event.cancel();
                }
            });

            //On destroy, dettach listener
            $scope.$on('$destroy', function() {
                settingsNavigator.off('postpop');
                settingsNavigator.off('prepush');
            });

        }


        function accountDeviceBackButton() {
            tabbar.setActiveTab(0);
        }

        function goToGeneralSettings() {
            NavigatorParameters.setParameters({
                'Navigator': 'settingsNavigator'
            });
            settingsNavigator.pushPage('./views/init/init-settings.html');
        }

        function loadSettings() {
            vm.mobilePlatform = (ons.platform.isIOS() || ons.platform.isAndroid());
            vm.FirstName = Patient.getFirstName();
            vm.LastName = Patient.getLastName();
            vm.PatientId = Patient.getPatientId();
            vm.Email = Patient.getEmail();
            vm.TelNum = Patient.getTelNum();
            vm.Language = UserPreferences.getLanguage();
            vm.ProfilePicture = Patient.getProfileImage();
        }
    }
})();

