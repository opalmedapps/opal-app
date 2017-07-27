//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
angular.module('MUHCApp').controller('LoadingController',
    ['$rootScope','$state', '$scope','UpdateUI',
        'UserAuthorizationInfo','UserPreferences', '$q','Patient', 'Messages', '$timeout','LocalStorage',
        'NavigatorParameters','RequestToServer', 'PlanningSteps', 'MetaData',
        function ($rootScope,$state, $scope, UpdateUI,
                  UserAuthorizationInfo, UserPreferences, $q, Patient, Messages,$timeout,LocalStorage,
                  NavigatorParameters,RequestToServer, PlanningSteps, MetaData){

            modal.show();
            var userAuthorizationInfo = UserAuthorizationInfo.getUserAuthData();
            if(typeof userAuthorizationInfo === 'undefined'||!userAuthorizationInfo) $state.go('init');
            setTimeout(function()
            {
                UpdateUI.init()
                    .then(function(response) {

                        console.log(JSON.stringify("response: " + response));
                        // var objectToSend = {};
                        // objectToSend.NewValue =
                        // objectToSend.FieldToChange = 'Language';
                        RequestToServer.sendRequestWithResponse('AccountChange', {NewValue: UserPreferences.getLanguage(), FieldToChange: 'Language'});

                        //fetch all the tab metadata TODO: add the fetching of all the other data
                        UpdateUI.set([
                            'Announcements',
                            'Doctors',
                            'Diagnosis'
                        ])
                            .then(function () {
                                MetaData.init();
                            });

                        PlanningSteps.initializePlanningSequence();

                        modal.hide();
                        clearTimeout(timeOut);
                        $state.go('Home');
                    });
            },200);

            //Timeout to show, alerting user of server problems.
            var timeOut = setTimeout(function(){

                if(typeof Patient.getFirstName()==='undefined'||Patient.getFirstName()===''){
                    var mod;
                    if(ons.platform.isAndroid())
                    {
                        mod='material';
                    }
                    modal.hide();
                    ons.notification.alert({
                        message: 'Problems with server, could not fetch data, try again later',
                        modifier: mod,
                        callback: function(idx) {
                            if(typeof Patient.getFirstName()==='undefined'||Patient.getFirstName()==='')
                            {
                                $state.go('logOut');
                            }else{
                                $scope.go('home');
                            }
                        }
                    });
                }
            },30000);
        }]);
