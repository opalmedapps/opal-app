//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('LoadingController', LoadingController);

    LoadingController.$inject = ['$state', '$filter', 'UpdateUI', 'UserAuthorizationInfo','UserPreferences', 'Patient',
        'RequestToServer', 'MetaData', 'LogOutService', 'NativeNotification', 'ProfileSelector'];

    /* @ngInject */
    function LoadingController($state, $filter, UpdateUI, UserAuthorizationInfo, UserPreferences, Patient,
                               RequestToServer, MetaData, LogOutService, NativeNotification, ProfileSelector) {

        activate();
        ///////////////////////////

        function activate() {

            var userAuthorizationInfo = UserAuthorizationInfo.getUserAuthData();

            if (!userAuthorizationInfo) $state.go('init');

            loadingmodal.show();

            Patient.initPatient().then(UpdateUI.init).then(async () => {
                RequestToServer.sendRequestWithResponse('AccountChange', {NewValue: UserPreferences.getLanguage(), FieldToChange: 'Language'});

                //fetch all the tab metadata TODO: add the fetching of all the other data
                MetaData.init();

                // Init the profile selector and load the patient list. Needs to be await to prevent profile icon from flickering at login.
                await ProfileSelector.init();
                $state.go('Home');
                //await ProfileSelector.init();
                loadingmodal.hide();
                clearTimeout(timeOut);

            }).catch(error => {
                console.error(error);
                // If UpdateUI initialization fails, then the user cannot log in
                NativeNotification.showNotificationAlert($filter('translate')("ERROR_CONTACTING_HOSPITAL"), LogOutService.logOut);
            });
        }

        //Timeout to show, alerting user of server problems.
        var timeOut = setTimeout(function(){
            loadingmodal.hide();
            if(typeof Patient.getFirstName()==='undefined'||Patient.getFirstName()===''){
                NativeNotification.showNotificationAlert($filter('translate')("SERVERERRORALERT"), LogOutService.logOut);
            }
            //This means server is working, but being slow
            else{
                NativeNotification.showNotificationAlert($filter('translate')("LONGERTIMEALERT"), LogOutService.logOut);
            }
        }, 90000);
    }
})();
