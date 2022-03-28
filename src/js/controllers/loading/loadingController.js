//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('LoadingController', LoadingController);

    LoadingController.$inject = ['$state', '$filter', 'UpdateUI', 'UserAuthorizationInfo','UserPreferences', 'Patient',
        'RequestToServer', 'MetaData', 'LogOutService', 'NativeNotification'];

    /* @ngInject */
    function LoadingController($state, $filter, UpdateUI, UserAuthorizationInfo, UserPreferences, Patient,
                               RequestToServer, MetaData, LogOutService, NativeNotification) {

        activate();
        ///////////////////////////

        function activate() {

            var userAuthorizationInfo = UserAuthorizationInfo.getUserAuthData();

            if(!userAuthorizationInfo) {
                $state.go('init');
            }

            loadingmodal.show();

            UpdateUI.init()
                .then(function() {
                    $state.go('Home');
                    RequestToServer.sendRequestWithResponse('AccountChange', {NewValue: UserPreferences.getLanguage(), FieldToChange: 'Language'});

                    //fetch all the tab metadata TODO: add the fetching of all the other data
                    UpdateUI.set([
                        'Doctors',
                        'Diagnosis'
                    ]).then(function(){
                        MetaData.init();
                    });

                    loadingmodal.hide();
                    clearTimeout(timeOut);
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
