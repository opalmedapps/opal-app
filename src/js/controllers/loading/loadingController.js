//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('LoadingController', LoadingController);

    LoadingController.$inject = ['$state', '$filter', 'ConcurrentLogin', 'UpdateUI', 'UserAuthorizationInfo','UserPreferences',
        'RequestToServer', 'MetaData', 'LogOutService', 'NativeNotification', 'ProfileSelector'];

    /* @ngInject */
    function LoadingController($state, $filter, ConcurrentLogin, UpdateUI, UserAuthorizationInfo, UserPreferences,
                               RequestToServer, MetaData, LogOutService, NativeNotification, ProfileSelector) {

        activate();

        ///////////////////////////

        async function activate() {
            try {
                let userAuthorizationInfo = UserAuthorizationInfo.getUserAuthData();
                if (!userAuthorizationInfo) $state.go('init');

                loadingmodal.show();

                RequestToServer.sendRequest('Login'); // For analytics only; don't wait for a response
                await UserPreferences.initFontSize();
                await UpdateUI.init();
                await RequestToServer.sendRequestWithResponse('AccountChange', {NewValue: UserPreferences.getLanguage(), FieldToChange: 'Language'});
                await MetaData.init();
                await ProfileSelector.init();
                      
                // TODO: Currently, the app isn't able to handle a state in which there are no confirmed profiles. In this case, cancel login.
                if (ProfileSelector.getConfirmedProfiles().length === 0) {
                    console.error('Cannot log in when there are no confirmed profiles.');
                    clearTimeout(timeOut);
                    NativeNotification.showNotificationAlert($filter('translate')("ERROR_NO_CONFIRMED_PROFILES"), LogOutService.logOut, $filter('translate')("INFO"));
                    return;
                }

                await ConcurrentLogin.initConcurrentLogin();
                $state.go('Home');

                loadingmodal.hide();
                clearTimeout(timeOut);
            }
            catch (error) {
                console.error(error);
                clearTimeout(timeOut);
                // If any part of the initialization fails, then the user cannot log in
                NativeNotification.showNotificationAlert($filter('translate')("ERROR_CONTACTING_HOSPITAL"), LogOutService.logOut);
            }
        }

        //Timeout to show, alerting user of server problems.
        let timeOut = setTimeout(function(){
            loadingmodal.hide();
            NativeNotification.showNotificationAlert($filter('translate')("SERVERERRORALERT"), LogOutService.logOut);
        }, 90000);
    }
})();
