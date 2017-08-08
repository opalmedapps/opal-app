/*
 * Filename     :   accountSettingsController.js
 * Description  :   Controllers that manage the account setting and subviews.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   03 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('accountSettingController', accountSettingController);

    accountSettingController.$inject = ['Patient', 'UserPreferences', '$scope', '$timeout', 'NavigatorParameters'];

    /* @ngInject */
    function accountSettingController(Patient, UserPreferences, $scope, $timeout, NavigatorParameters) {

        var vm = this;
        vm.title = 'accountSettingController';
        vm.passFill = '********';
        vm.mobilePlatform = (ons.platform.isIOS() || ons.platform.isAndroid());
        vm.FirstName = Patient.getFirstName();
        vm.LastName = Patient.getLastName();
        vm.PatientId = Patient.getPatientId();
        vm.Email = Patient.getEmail();
        vm.TelNum = Patient.getTelNum();
        vm.Language = UserPreferences.getLanguage();
        vm.ProfilePicture = Patient.getProfileImage();
        vm.passwordLength = 6;

        vm.accountDeviceBackButton = accountDeviceBackButton;
        vm.goToGeneralSettings = goToGeneralSettings;

        activate();

        ////////////////

        function activate() {

            loadSettings();

            // Setting our parameters for pushing and popping pages
            NavigatorParameters.setParameters({
                'Navigator':'settingsNavigator'
            });

            // After a page is popped reintialize the settings.
            settingsNavigator.on('postpop', function() {
                $timeout(function() {
                    loadSettings();
                });

            });
            settingsNavigator.on('prepush',function(event){
                if(event.navigator._isPushing) event.cancel();       
            });
            //On destroy, dettach listener
            $scope.$on('$destroy', function() {
                settingsNavigator.off('postpop');
                settingsNavigator.off('prepush');
            });

        }

        function accountDeviceBackButton() {
            tabbar.setActiveTab(0);
        }

        function goToGeneralSettings() {
            NavigatorParameters.setParameters({
                'Navigator': 'settingsNavigator'
            });
            settingsNavigator.pushPage('./views/init/init-settings.html');
        }

        function loadSettings() {
            vm.mobilePlatform = (ons.platform.isIOS() || ons.platform.isAndroid());
            vm.FirstName = Patient.getFirstName();
            vm.LastName = Patient.getLastName();
            vm.PatientId = Patient.getPatientId();
            vm.Email = Patient.getEmail();
            vm.TelNum = Patient.getTelNum();
            vm.Language = UserPreferences.getLanguage();
            vm.ProfilePicture = Patient.getProfileImage();
        }

    }

})();

// Controller manages updating the user parameters
myApp.controller('ChangingSettingController',
    function($filter, $rootScope, FirebaseService, $translate, UserPreferences,
             Patient, RequestToServer, $scope, $timeout, UpdateUI, UserAuthorizationInfo,EncryptionService) {
        //Function sets account
        accountChangeSetUp();

        //Sets all the account settings depeding on the field that needs to be changed
        function accountChangeSetUp() {
            //Mappings between parameters and translation
            //Navigator parameter
            var page = settingsNavigator.getCurrentPage();
            var parameters = page.options.param;
            //Actual Value
            $scope.actualValue = '';

            //Instantiates values and parameters
            $scope.disableButton = true;
            $scope.title = 'UPDATE';
            $scope.value = parameters;
            $scope.valueLabel = parameters;
            $scope.personal = true;
            $scope.type1 = 'text';
            //Sets a watch on the values typed and runs the validation scripts for the respective values
            $scope.$watchGroup(['newValue', 'newValueValidate', 'oldValue'], function() {
                $scope.newUpdate = false;
                if (parameters !== 'LANGUAGE' && parameters !== 'FONTSIZE') {
                    if (parameters == 'EMAIL') {
                        $scope.disableButton = !validateEmail();
                    } else if (parameters == 'PASSWORD') {
                        $scope.disableButton = !validatePassword();
                    } else if (parameters == 'PHONENUMBER') {
                        $scope.disableButton = !validateTelNum();
                    } else {
                        $scope.disableButton = !validateAlias();
                    }
                }

            });

            //Sets the instructions depending on the value to update
            if (parameters === 'ALIAS') {
                $scope.actualValue = Patient.getAlias();
                $scope.newValue = $scope.actualValue;
                $scope.instruction = "ENTERYOURALIAS";
            } else if (parameters === 'PHONENUMBER') {
                $scope.actualValue = Patient.getTelNum();
                $scope.newValue = $scope.actualValue;
                $scope.instruction = "ENTERNEWTELEPHONE";
            } else if (parameters === 'EMAIL') {
                $scope.type1 = 'email';
                $scope.type2 = 'password';
                $scope.newValue = '';
                $scope.oldValue = '';
                $scope.placeHolder = $filter('translate')("ENTERPASSWORD");
                $scope.instruction = "ENTEREMAILADDRESS";
                $scope.instructionOld = "ENTERPASSWORD";
            } else if (parameters === 'PASSWORD') {
                $scope.type1 = 'password';
                $scope.type2 = 'password';
                $scope.newValue = '';
                $scope.oldValue = '';
                $scope.newValueValidate = '';
                var label = $filter('translate')('ENTEROLD');
                $scope.placeHolder = label + ' ' +$filter('translate')($scope.valueLabel);
                $scope.instruction = "ENTERNEWPASSWORD";
                $scope.instructionOld = "ENTEROLDPASSWORD";
                $scope.reenter_placeholder = "REENTER_PASSWORD"
            } else if (parameters === 'LANGUAGE') {
                var value = UserPreferences.getLanguage();
                $scope.instruction = 'SELECTLANGUAGE';
                $scope.personal = false;
                $scope.fontUpdated = false;
                $scope.pickLanguage = value;
                $scope.firstOption = 'EN';
                $scope.secondOption = 'FR';
                $scope.valueLabel = 'LANGUAGE';
                $scope.title = 'UPDATE';
            } else if (parameters === 'FONTSIZE') {
                var value = UserPreferences.getFontSize();
                $scope.firstOption = 'medium';
                $scope.secondOption = 'large';
                $scope.thirdOption = 'xlarge';
                $scope.instruction = "SELECTFONTSIZE";
                $scope.personal = false;
                $scope.fontUpdated = true;
                $scope.pickFont = value;
            }
        }
        //Function to update new value
        $scope.updateValue = function(val) {
            var objectToSend = {};
            objectToSend.NewValue = $scope.newValue;

            if (val.toUpperCase() === 'PASSWORD') {

                changePassword();
            } else if (val.toUpperCase() === 'EMAIL') {
                changeEmail();
            }else{
                changeField(val, $scope.newValue);
            }
            $scope.disableButton = true;
        };
        //Function to change Nickname and phone number
        function changeField(type, value)
        {
            var typeVal = (type.toUpperCase() === 'NICKNAME')?'Alias':'TelNum';
            var objectToSend = {};
            objectToSend.NewValue = value;
            objectToSend.FieldToChange = typeVal;
            RequestToServer.sendRequest('AccountChange', objectToSend);
            if (type.toUpperCase() === 'NICKNAME') Patient.setAlias(value);
            else Patient.setTelNum(value);
            $scope.actualValue = value;
            $scope.newUpdate = true;
            $scope.alertClass = "bg-success updateMessage-success";
            $scope.updateMessage = "FIELD_UPDATED";
        }

        //Function to change font size
        $scope.changeFont = function(newVal) {
            UserPreferences.setFontSize(newVal);
        };


        //FUnction to change the language
        $scope.changeLanguage = function(val) {
            var objectToSend = {};
            objectToSend.NewValue = val;
            objectToSend.FieldToChange = 'Language';
            RequestToServer.sendRequest('AccountChange', objectToSend);
            UserPreferences.setLanguage(val);
        };

        //Change password function
        function changePassword() {

            var user = FirebaseService.getAuthenticationCredentials();
            var credential = firebase.auth.EmailAuthProvider.credential(user.email, $scope.oldValue);

            user.reauthenticate(credential).then(function () {
                user.updatePassword($scope.newValue).then(updateOnServer).catch(handleError);
            }).catch(handleAuthenticationError);

            function updateOnServer(){
                var objectToSend = {};
                objectToSend.FieldToChange = 'Password';
                objectToSend.NewValue = $scope.newValue;

                localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/deviceID");
                localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");

                RequestToServer.sendRequestWithResponse('AccountChange', objectToSend)
                    .then(function (response) {
                        $timeout(function() {

                            $scope.alertClass = "bg-success updateMessage-success";
                            $scope.updateMessage = "PASSWORDUPDATED";
                            $scope.newUpdate = true;
                        });
                    })
                    .catch(function (error) {
                        $timeout(function () {
                            $scope.newUpdate = true;
                            $scope.alertClass = "bg-danger updateMessage-error";
                            $scope.updateMessage = "INTERNETERROR";
                        });
                    })

            }

            function handleError(error){
                switch (error.code) {
                    case "auth/weak-password":
                        $timeout(function () {
                            $scope.newUpdate = true;
                            $scope.alertClass = "bg-danger updateMessage-error";
                            $scope.updateMessage = "INVALID_PASSWORD";
                        });
                        break;
                    default:
                        $timeout(function () {
                            $scope.newUpdate = true;
                            $scope.alertClass = "bg-danger updateMessage-error";
                            $scope.updateMessage = "INTERNETERROR";
                        });
                }
            }
        }

        //Change email function
        function changeEmail() {

            var user = FirebaseService.getAuthenticationCredentials();
            var credential = firebase.auth.EmailAuthProvider.credential(user.email, $scope.oldValue);

            user.reauthenticate(credential).then(function () {
                user.updateEmail($scope.newValue).then(updateOnServer).catch(handleError);
            }).catch(handleAuthenticationError);

            function updateOnServer(){
                var objectToSend = {};
                objectToSend.FieldToChange = 'Email';
                objectToSend.NewValue = $scope.newValue;
                Patient.setEmail($scope.newValue);
                window.localStorage.setItem('Email',$scope.newValue);
                RequestToServer.sendRequest('AccountChange', objectToSend);
                $timeout(function() {
                    $scope.alertClass = "bg-success updateMessage-success";
                    $scope.updateMessage = "UPDATED_EMAIL";
                    $scope.newUpdate = true;
                });
            }

            function handleError(){
                switch (error.code) {
                    case "auth/invalid-email":
                        $timeout(function() {
                            $scope.alertClass = "bg-danger updateMessage-error";
                            $scope.newUpdate = true;
                            $scope.updateMessage = "INVALID_EMAIL";
                        });
                        break;
                    case "auth/email-already-in-use":
                        $timeout(function() {
                            $scope.alertClass = "bg-danger updateMessage-error";
                            $scope.newUpdate = true;
                            $scope.updateMessage = "EMAIL_TAKEN";
                        });
                        break;
                    default:
                        $timeout(function() {
                            $scope.alertClass = "bg-danger updateMessage-error";
                            $scope.newUpdate = true;
                            $scope.updateMessage = "INTERNETERROR";
                        });
                        break;
                }
            }
        }


        //Validating fields functions

        function validateTelNum() {
            var regex = /^[0-9]{10}$/;
            return ($scope.actualValue !== $scope.newValue && regex.test($scope.newValue));
        }

        function validateEmail() {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return ($scope.newValue !== $scope.actualValue && re.test($scope.newValue) && $scope.oldValue.length > 3);
        }

        function validatePassword() {
            return ($scope.newValue.length > 5 && $scope.oldValue.length > 4 && $scope.newValue === $scope.newValueValidate);
        }

        function validateAlias() {
            return ($scope.actualValue !== $scope.newValue && $scope.newValue.length > 3);
        }

        function handleAuthenticationError(error) {
            switch(error.code){
                case "auth/user-mismatch":
                    $timeout(function () {
                        $scope.newUpdate = true;
                        $scope.alertClass = "bg-danger updateMessage-error";
                        $scope.updateMessage = "INVALID_ASSOCIATION";
                    });
                    break;
                case "auth/user-not-found":
                    $timeout(function () {
                        $scope.newUpdate = true;
                        $scope.alertClass = "bg-danger updateMessage-error";
                        $scope.updateMessage = "INVALID_USER";
                    });
                    break;
                case "auth/invalid-credential":
                    $timeout(function () {
                        $scope.newUpdate = true;
                        $scope.alertClass = "bg-danger updateMessage-error";
                        $scope.updateMessage = "INVALID_CREDENTIAL";
                    });
                    break;
                case "auth/invalid-email":
                    $timeout(function () {
                        $scope.newUpdate = true;
                        $scope.alertClass = "bg-danger updateMessage-error";
                        $scope.updateMessage = "INVALID_EMAIL";
                    });
                    break;
                case "auth/wrong-password":
                    $timeout(function () {
                        $scope.newUpdate = true;
                        $scope.alertClass = "bg-danger updateMessage-error";
                        $scope.updateMessage = "INVALID_PASSWORD";
                    });
                    break;
                default:
                    $timeout(function () {
                        $scope.newUpdate = true;
                        $scope.alertClass = "bg-danger updateMessage-error";
                        $scope.updateMessage = "INTERNETERROR";
                    });
            }
        }

        

    });