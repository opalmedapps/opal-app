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


myApp.controller('waitController',
    function($filter, $rootScope, $translate, UserPreferences, $scope) {
        //Function sets account
        var page = homeNavigator.getCurrentPage();
        var parameters = page.options.param;

        $scope.language = UserPreferences.getLanguage();
        console.log($scope.app);

        var x = false;
        if( x ){
            $scope.percent15 = 0;
            $scope.percent30 = 0;
            $scope.percent45 = 0;
            $scope.percent0 = 0;
        }
        else{
            var count0 = 46;
            var count15 = 28;
            var count30 = 11;
            var count45 = 15;
            var countTotal = count0+count15+count30+count45;
            $scope.percent15 = Math.round((count15/countTotal)*100);
            $scope.percent30 = Math.round((count30/countTotal)*100);
            $scope.percent45 = Math.round((count45/countTotal)*100);
            $scope.percent0 = 100-$scope.percent45-$scope.percent15-$scope.percent30;
        }

        //Instantiates values and parameters
        $scope.disableButton = true;
        $scope.title = 'UPDATE';
        $scope.value = parameters;
        $scope.valueLabel = parameters;
        $scope.timeUpdated = true;
        $scope.type1 = 'text';

        Highcharts.setOptions({
            setOptions: {
                colors: ['#50BEC1', '#FEC200', '#F06B6C']
            }
        });

        Highcharts.chart('container', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: 0,
                plotShadow: false,
                margin: [0, 0, 0, 0],
                spacingTop: 0,
                spacingBottom: 0,
                spacingLeft: 0,
                spacingRight: 0
            },
            credits: {
                enabled: false
            },
            title: {
                text: ''
            },
            colors:
                ['#59D45D', '#FEC200', '#FF0000'],
            colorByPoint: true,
            plotOptions: {
                pie: {
                    size: '100%',
                    dataLabels: {
                        enabled: false,
                        distance: 0,
                        style: {
                            fontWeight: 'bold',
                            color: 'white'
                        }
                    },
                    startAngle: -0,
                    endAngle: 360,
                    center: ['50%', '50%']
                }
            },
            series: [{
                type: 'pie',
                name: '',
                innerSize: '30%',
                data: [
                    ['',   40],
                    ['',       40],
                    ['', 20],
                ]
            }]
        });

        //Sets all the account settings depeding on the field that needs to be changed
        function changeSetUp() {
            //Mappings between parameters and translation
            //Navigator parameter

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

        //Function to change type of appointment
        $scope.changeType = function(newVal) {

        };


        //FUnction to change the hour of appointment
        $scope.changeHour = function(val) {

        };

        //Function to change the minute of appointment
        $scope.changeMinute = function(val) {

        }
    }});

