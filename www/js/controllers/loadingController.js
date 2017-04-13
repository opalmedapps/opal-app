//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
angular.module('MUHCApp').controller('LoadingController',
    ['$rootScope','$state', '$scope','UpdateUI',
        'UserAuthorizationInfo','UserPreferences', '$q','Patient', 'Messages', '$timeout','LocalStorage',
        'NavigatorParameters','RequestToServer', 'PlanningSteps',
        function ($rootScope,$state, $scope, UpdateUI,
                  UserAuthorizationInfo, UserPreferences, $q, Patient, Messages,$timeout,LocalStorage,
                  NavigatorParameters,RequestToServer, PlanningSteps){
            modal.show();
            //var loadingParameter = NavigatorParameters.getParameters();
            var userAuthorizationInfo = UserAuthorizationInfo.getUserAuthData();
            if(typeof userAuthorizationInfo === 'undefined'||!userAuthorizationInfo) $state.go('init');
            setTimeout(function()
            {
                UpdateUI.login()
                    .then(function() {
                        var objectToSend = {};
                        objectToSend.NewValue = UserPreferences.getLanguage();
                        objectToSend.FieldToChange = 'Language';
                        RequestToServer.sendRequestWithResponse('AccountChange', objectToSend);

                        PlanningSteps.initializePlanningSequence();

                        modal.hide();
                        clearTimeout(timeOut);
                        console.log('Going home');
                        console.log($state.go('Home'));
                        console.log('Supposed to be home.')
                    });
            },200);

            //Timeout to show, alerting user of server problems.
            var timeOut = setTimeout(function(){
                console.log(typeof Patient.getFirstName());
                if(typeof Patient.getFirstName()==='undefined'||Patient.getFirstName()===''){
                    console.log('Inside alert');
                    console.log('we meet again');
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
