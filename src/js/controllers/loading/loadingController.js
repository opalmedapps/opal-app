//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('LoadingController', LoadingController);

    LoadingController.$inject = ['$state', '$filter', 'UpdateUI', 'UserAuthorizationInfo','UserPreferences',
        'RequestToServer', 'MetaData', 'LogOutService', 'NativeNotification', 'ProfileSelector'];

    /* @ngInject */
    function LoadingController($state, $filter, UpdateUI, UserAuthorizationInfo, UserPreferences,
                               RequestToServer, MetaData, LogOutService, NativeNotification, ProfileSelector) {

        activate();

        ///////////////////////////

        async function activate() {
            try {
                let userAuthorizationInfo = UserAuthorizationInfo.getUserAuthData();
                if (!userAuthorizationInfo) $state.go('init');

                loadingmodal.show();

                await UserPreferences.initFontSize();
                await UpdateUI.init();
                await RequestToServer.sendRequestWithResponse('AccountChange', {NewValue: UserPreferences.getLanguage(), FieldToChange: 'Language'});
                await MetaData.init();
                await ProfileSelector.init();
                $state.go('Home');

                loadingmodal.hide();
                clearTimeout(timeOut);
            }
            catch (error) {
                console.error(error);
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
