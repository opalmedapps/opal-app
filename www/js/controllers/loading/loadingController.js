//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('LoadingController', LoadingController);

    LoadingController.$inject = ['$state', 'UpdateUI', 'UserAuthorizationInfo','UserPreferences', 'Patient', 'RequestToServer', 'PlanningSteps'];

    /* @ngInject */
    function LoadingController($state, UpdateUI, UserAuthorizationInfo, UserPreferences, Patient, RequestToServer, PlanningSteps) {

        var vm = this;

        activate();
        ///////////////////////////

        function activate() {
            modal.show();
            var userAuthorizationInfo = UserAuthorizationInfo.getUserAuthData();
            if(!userAuthorizationInfo) $state.go('init');

            UpdateUI.init()
                .then(function() {
                    $state.go('Home');
                    RequestToServer.sendRequestWithResponse('AccountChange', {NewValue: UserPreferences.getLanguage(), FieldToChange: 'Language'});

                    //fetch all the tab metadata TODO: add the fetching of all the other data
                    UpdateUI.set([
                        'Announcements',
                        'Doctors',
                        'Diagnosis'
                    ]);

                    PlanningSteps.initializePlanningSequence();

                    modal.hide();
                    clearTimeout(timeOut);
                });
        }

        //Timeout to show, alerting user of server problems.
        var timeOut = setTimeout(function(){
            var mod;
            if(typeof Patient.getFirstName()==='undefined'||Patient.getFirstName()===''){

                if(ons.platform.isAndroid())
                {
                    mod='material';
                }
                modal.hide();
                ons.notification.alert({
                    message: 'Server problem: could not fetch data, try again later',
                    modifier: mod,
                    callback: function(idx) {
                        $state.go('logOut');
                    }
                });
            }
            //This means server is working, but being slow
            else{
                if(ons.platform.isAndroid())
                {
                    mod='material';
                }
                ons.notification.alert({

                    message: 'Request is taking longer than usual...please try again later.',
                    modifier: mod,
                    callback: function(idx) {
                        $state.go('logOut');
                    }
                });
            }
        },10000);
    }
})();
