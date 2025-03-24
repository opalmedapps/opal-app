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

    accountSettingController.$inject = ['UserPreferences', '$scope', '$timeout', 'Navigator',
        'UserHospitalPreferences', 'LogOutService', 'User'];

    /* @ngInject */
    function accountSettingController(UserPreferences, $scope, $timeout, Navigator,
                                      UserHospitalPreferences, LogOutService, User) {

        var vm = this;
        vm.accountDeviceBackButton = () => tabbar.setActiveTab(0);
        vm.goToGeneralSettings = goToGeneralSettings;
        vm.goToUpdateAccountField = (param, animation) => settingsNavigator.pushPage('views/settings/update-account-field.html', {param:param},{ animation : animation });
        vm.logOut = () => LogOutService.logOut();

        activate();

        ////////////////

        function activate() {
            Navigator.setNavigator(settingsNavigator);

            loadSettings();

            // After a page is popped reintialize the settings.
            settingsNavigator.on('postpop', () => {
                $timeout(() => loadSettings());
            });

            settingsNavigator.on('prepush', (event) => {
                if (settingsNavigator._doorLock.isLocked()) event.cancel();
            });

            //On destroy, dettach listener
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
            settingsNavigator.pushPage('./views/init/init-settings.html');
        }
    }
})();

