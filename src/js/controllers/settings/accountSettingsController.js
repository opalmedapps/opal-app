// SPDX-FileCopyrightText: Copyright (C) 2015 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   accountSettingsController.js
 * Description  :   Controllers that manage the account setting and subviews.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   03 Mar 2017
 */

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('accountSettingController', accountSettingController);

    accountSettingController.$inject = ['UserPreferences', '$scope', '$timeout', 'Navigator',
        'UserHospitalPreferences', 'LogOutService', 'User'];

    /* @ngInject */
    function accountSettingController(UserPreferences, $scope, $timeout, Navigator,
                                      UserHospitalPreferences, LogOutService, User) {

        let vm = this;
        vm.multipleLanguageOptions = UserPreferences.getSupportedLanguages().length > 1;

        vm.accountDeviceBackButton = () => tabbar.setActiveTab(0);
        vm.goToGeneralSettings = goToGeneralSettings;
        vm.goToUpdateAccountField = (param, animation) => settingsNavigator.pushPage('views/settings/update-account-field.html', {param:param},{ animation : animation });
        vm.logOut = () => LogOutService.logOut();

        activate();

        ////////////////

        function activate() {
            Navigator.setNavigator(settingsNavigator);

            loadSettings();

            // After a page is popped reinitialize the settings.
            settingsNavigator.on('postpop', () => {
                $timeout(() => loadSettings());
            });

            settingsNavigator.on('prepush', (event) => {
                if (settingsNavigator._doorLock.isLocked()) event.cancel();
            });

            //On destroy, detach listener
            $scope.$on('$destroy', () => {
                settingsNavigator.off('postpop');
                settingsNavigator.off('prepush');
            });
        }

        function loadSettings() {
            vm.mobilePlatform = (ons.platform.isIOS() || ons.platform.isAndroid());
            vm.Language = UserPreferences.getLanguage();
            vm.selectedHospitalToDisplay = UserHospitalPreferences.getHospitalFullName();
            vm.userInfo = User.getUserInfo();
        }

        function goToGeneralSettings() {
            settingsNavigator.pushPage('./views/init/technical-legal.html');
        }
    }
})();
