/*
 *Code by Wen Quan Li May 20, 2017
 *Github: wli92
 *Email:wenquan97@gmail.com
 */
var myApp = angular.module('MUHCApp');

/**
 *@ngdoc controller
 *@name MUHCApp.controller:waitController
 *@scope
 *@requires $scope
 *@requires $rootScope
 *@requires MUHCApp.services.UserPreferences
 *@requires MUHCApp.services.UpdateUI
 *@requires MUHCApp.services.Appointments
 *@description
 *Controller manages the logic in the schedule appointment main view, it as as "child" controllers,
 */



//Logic for the calendar controller view
myApp.controller('waitController', ['$scope','$timeout', '$filter','$anchorScroll','NavigatorParameters', 'UserPreferences',
    function ($scope,$timeout,$filter,
              $anchorScroll,NavigatorParameters,UserPreferences) {

        /*
         *   Controller constants
         **/
        var flag;//Boolean value to indicate initialization
        var today;//Date today
        //Set the calendar options
        $scope.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 0,
            formatDay:'d',
            showWeeks:false
        };
        //monitors whether or not the calendar is displayed, here the calendar should always be displayed
        $scope.showCalendar = true;
        $scope.onShowCalendar= function() {
            $scope.$apply(function() {
                $scope.showCalendar = true;
            })
        };
        var vm = this;
        vm.Language = UserPreferences.getLanguage();

        /*
         *   Implementation
         **/
        //Initializing controller
        init();
        //changeSetUp();

        function init() {
            //navigatorName = NavigatorParameters.getParameters().Navigator;

            //Obtaining and setting appointments from service
            $scope.language = UserPreferences.getLanguage();
            $scope.dt = new Date();
            $scope.dt.setHours(0, 0, 0, 0);
            today = new Date($scope.dt);
            flag = false;
        }


        //activate();

                function activate() {

                loadSettings();

                // Setting our parameters for pushing and popping pages
                NavigatorParameters.setParameters({
                    'Navigator':'homeNavigator'
                });

                // After a page is popped reintialize the settings.
                homeNavigator.on('postpop', function() {
                    $timeout(function() {
                        loadSettings();
                    });

                });

                //On destroy, dettach listener
                $scope.$on('destroy', function() {
                    homeNavigator.off('postpop');
                });

            }

            function accountDeviceBackButton() {
                tabbar.setActiveTab(0);
            }

            function loadSettings() {
                vm.Language = UserPreferences.getLanguage();
            }


    }]);

myApp.controller('IndividualAppointmentController', ['NavigatorParameters','NativeNotification','$scope',
    '$timeout', '$rootScope','Appointments', 'CheckInService','$q',
    'NewsBanner','$filter', 'UserPreferences', 'Logger',
    function (NavigatorParameters,NativeNotification,$scope,
              $timeout, $rootScope, Appointments,CheckInService, $q,
              NewsBanner,$filter, UserPreferences, Logger) {
        //Information of current appointment
        var parameters = NavigatorParameters.getParameters();
        console.log(parameters);
        var navigatorName = parameters.Navigator;

        $scope.app = parameters.Post;
        $scope.language = UserPreferences.getLanguage();
        console.log($scope.app);

        Logger.sendLog('Appointment', parameters.Post.AppointmentSerNum);

        $scope.goToMap=function()
        {
            NavigatorParameters.setParameters($scope.app);
            window[navigatorName].pushPage('./views/general/maps/individual-map.html');
        };

        $scope.aboutApp = function () {
            window[navigatorName].pushPage('./views/templates/content.html', {
                contentLink: $scope.app["URL_"+UserPreferences.getLanguage()],
                contentType: $scope.app["AppointmentType_"+UserPreferences.getLanguage()]
            });
        }

    }]);

myApp.controller('waitChangeController',
    function($filter, $rootScope, $translate, UserPreferences, $scope) {
        //Function sets account
        changeSetUp();

        //Sets all the account settings depeding on the field that needs to be changed
        function changeSetUp() {
            //Mappings between parameters and translation
            //Navigator parameter
            var page = homeNavigator.getCurrentPage();
            var parameters = page.options.param;

            //Instantiates values and parameters
            $scope.disableButton = true;
            $scope.title = 'UPDATE';
            $scope.value = parameters;
            $scope.valueLabel = parameters;
            $scope.timeUpdated = true;
            $scope.type1 = 'text';


            //Sets the instructions depending on the value to update
            if (parameters === 'HOUR') {
                $scope.timeUpdated = false;
                $scope.typeUpdated = false;
                $scope.firstOption = '8';
                $scope.secondOption = '9';
                $scope.thirdOption = '10';
                $scope.forthOption = '11';
                $scope.fifthOption = '12';
                $scope.sixthOption = '13';
                $scope.seventhOption = '14';
                $scope.eigthOption = '15';
                $scope.ninthOption = '16';
                $scope.valueLabel = 'HOUR';
                $scope.title = 'UPDATE';
                $scope.instruction = 'SELECTHOUR';
            } else if (parameters === 'MINUTE') {
                $scope.instruction = 'SELECTMINUTES';
                $scope.timeUpdated = false;
                $scope.typeUpdated = true;
                $scope.firstOption = '00';
                $scope.secondOption = '15';
                $scope.thirdOption = '30';
                $scope.forthOption = '45';
                $scope.valueLabel = 'MINUTES';
                $scope.title = 'UPDATE';
                //$scope.pickMinute = value;
            } else if (parameters === 'TYPE') {
                $scope.firstOption = 'chemoapt';
                $scope.secondOption = 'chemotx';
                $scope.thirdOption = 'xlarge';
                $scope.instruction = 'SELECTTYPE';
                $scope.timeUpdated = true;
                $scope.typeUpdated = true;
            }

        //Function to update new value
        $scope.updateValue = function(val) {
            var objectToSend = {};
            objectToSend.NewValue = $scope.newValue;

            if (val == 'Password') {
                changePassword();
            } else if (val == 'Email') {
                changeEmail();
            }else{
                changeField(val, $scope.newValue);
            }
            $scope.disableButton = true;
        };

        //Function to change font size
        $scope.changeType = function(newVal) {

        };


        //FUnction to change the language
        $scope.changeHour = function(val) {

        };

        $scope.changeMinute = function(val) {

        }
    }});

