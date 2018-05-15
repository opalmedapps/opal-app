//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('LoadingController', LoadingController);

    LoadingController.$inject = ['$state', 'UpdateUI', 'UserAuthorizationInfo','UserPreferences', 'Patient', 'RequestToServer', 'PlanningSteps', 'MetaData'];

    /* @ngInject */
    function LoadingController($state, UpdateUI, UserAuthorizationInfo, UserPreferences, Patient, RequestToServer, PlanningSteps, MetaData) {

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

                    PlanningSteps.initializePlanningSequence();

                    loadingmodal.hide();
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
                loadingmodal.hide();
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
        }, 30000);
    }
})();
