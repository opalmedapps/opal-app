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

            //On destroy, dettach listener
            $scope.$on('destroy', function() {
                settingsNavigator.off('postpop');
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


myApp.controller('ChangingSettingController', function($filter, $rootScope, FirebaseService, $translate, UserPreferences, Patient, RequestToServer, $scope, $timeout, UpdateUI, UserAuthorizationInfo,LocalStorage) {
    console.log(UserAuthorizationInfo);

    //Function sets account
    accountChangeSetUp();

    //Sets all the account settings depeding on the field that needs to be changed
    function accountChangeSetUp() {
        //Mappings between parameters and translation
        var fieldsMappings = {
            "Font-size": "FONTSIZE",
            "Language": "LANGUAGE",
            "Tel. Number": "PHONENUMBER",
            "Password": "PASSWORD",
            "Email": "EMAIL",
            "Nickname": "ALIAS"
        };
        //Navigator parameter
        var page = settingsNavigator.getCurrentPage();
        var parameters = page.options.param;
        //Actual Value
        $scope.actualValue = '';

        //Instantiates values and parameters
        $scope.disableButton = true;
        $scope.value = parameters;
        console.log(fieldsMappings);
        $scope.title = $filter('translate')('UPDATE');
        $scope.valueLabel = $filter('translate')(fieldsMappings[parameters]);
        $scope.personal = true;
        $scope.type1 = 'text';
        //Sets a watch on the values typed and runs the validation scripts for the respective values
        $scope.$watchGroup(['newValue', 'oldValue'], function() {
            $scope.newUpdate = false;
            if (parameters !== 'Language' && parameters !== 'Font-size') {
                if (parameters == 'Email') {
                    $scope.disableButton = !validateEmail();
                } else if (parameters == 'Password') {
                    console.log(validatePassword());
                    $scope.disableButton = !validatePassword();
                } else if (parameters == 'Tel. Number') {
                    $scope.disableButton = !validateTelNum();
                } else {
                    console.log('alias, boom', $scope.actualValue, $scope.newValue);
                    $scope.disableButton = !validateAlias();
                }
            }

        });

        //Sets the instructions depending on the value to update
        if (parameters === 'Nickname') {
            $scope.actualValue = Patient.getAlias();
            $scope.newValue = $scope.actualValue;
            $scope.instruction = "ENTERYOURALIAS";
        } else if (parameters === 'Tel. Number') {
            $scope.actualValue = Patient.getTelNum();
            $scope.newValue = $scope.actualValue;
            $scope.instruction = "ENTERNEWTELEPHONE";
        } else if (parameters === 'Email') {
            $scope.type1 = 'email';
            $scope.type2 = 'password';
            $scope.newValue = '';
            $scope.oldValue = '';
            $scope.placeHolder = $filter('translate')("ENTERPASSWORD");
            $scope.instruction = "ENTEREMAILADDRESS";
            $scope.instructionOld = "ENTERPASSWORD";
        } else if (parameters === 'Password') {
            $scope.type1 = 'password';
            $scope.type2 = 'password';
            $scope.newValue = '';
            $scope.oldValue = '';
            var label = $filter('translate')('ENTEROLD');
            $scope.placeHolder = label + ' ' +$scope.valueLabel;
            $scope.instruction = "ENTERNEWPASSWORD";
            $scope.instructionOld = "ENTEROLDPASSWORD";
        } else if (parameters === 'Language') {
            var value = UserPreferences.getLanguage();
            $scope.instruction = 'SELECTLANGUAGE';
            $scope.personal = false;
            $scope.fontUpdated = false;
            $scope.pickLanguage = value;
            $scope.firstOption = 'EN';
            $scope.secondOption = 'FR';
        } else if (parameters === 'Font-size') {
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

        if (val == 'Password') {
            changePassword();
        } else if (val == 'Email') {
            changeEmail();
        }else{
            changeField(val, $scope.newValue);
        }
        $scope.disableButton = true;
    };
    //Function to change Nickname and phone number
    function changeField(type, value)
    {
        var typeVal = (type == 'Nickname')?'Alias':'TelNum';
        var objectToSend = {};
        objectToSend.NewValue = value;
        objectToSend.FieldToChange = typeVal;
        RequestToServer.sendRequest('AccountChange', objectToSend);
        if (type == 'Nickname') Patient.setAlias(value);
        else Patient.setTelNum(value);
        $scope.actualValue = value;
        $scope.newUpdate = true;
        $scope.alertClass = "bg-success updateMessage-success";
        $scope.updateMessage = $filter('translate')("FIELD_UPDATED");
        console.log($scope.updateMessage, $scope.alertClass);

    }

    //Function to change font size
    $scope.changeFont = function(newVal) {
        UserPreferences.setFontSize(newVal);
    };


    //FUnction to change the language
    $scope.changeLanguage = function(val) {
        console.log(val);
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
            RequestToServer.sendRequest('AccountChange', objectToSend);
            var oldPassword= UserAuthorizationInfo.getPassword();
            console.log(oldPassword);
            LocalStorage.updateLocalStorageAfterPasswordChange(oldPassword,$scope.newValue);
            UserAuthorizationInfo.setPassword($scope.newValue);
            var newPassword = UserAuthorizationInfo.getPassword();
            console.log(newPassword);
            $timeout(function() {

                $scope.alertClass = "bg-success updateMessage-success";
                $scope.updateMessage = $filter('translate')("PASSWORDUPDATED");
                $scope.newUpdate = true;
            });
        }

        function handleError(error){
            switch (error.code) {
                case "auth/weak-password":
                    $timeout(function () {
                        $scope.newUpdate = true;
                        $scope.alertClass = "bg-danger updateMessage-error";
                        $scope.updateMessage = $filter('translate')("INVALID_PASSWORD");
                    });
                    break;
                default:
                    $timeout(function () {
                        $scope.newUpdate = true;
                        $scope.alertClass = "bg-danger updateMessage-error";
                        $scope.updateMessage = $filter('translate')("INTERNETERROR");
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
                $scope.updateMessage = $filter('translate')("UPDATED_EMAIL");
                $scope.newUpdate = true;
            });
        }

        function handleError(){
            switch (error.code) {
                case "auth/invalid-email":
                    $timeout(function() {
                        $scope.alertClass = "bg-danger updateMessage-error";
                        $scope.newUpdate = true;
                        $scope.updateMessage = $filter('translate')("INVALID_EMAIL");
                    });
                    break;
                case "auth/email-already-in-use":
                    $timeout(function() {
                        $scope.alertClass = "bg-danger updateMessage-error";
                        $scope.newUpdate = true;
                        $scope.updateMessage = $filter('translate')("EMAIL_TAKEN");
                    });
                    break;
                default:
                    $timeout(function() {
                        $scope.alertClass = "bg-danger updateMessage-error";
                        $scope.newUpdate = true;
                        $scope.updateMessage = $filter('translate')("INTERNETERROR");
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
        return ($scope.newValue.length > 3 && $scope.oldValue.length > 3);
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
                    $scope.updateMessage = $filter('translate')("INVALID_ASSOCIATION");
                });
                break;
            case "auth/user-not-found":
                $timeout(function () {
                    $scope.newUpdate = true;
                    $scope.alertClass = "bg-danger updateMessage-error";
                    $scope.updateMessage = $filter('translate')("INVALID_USER");
                });
                break;
            case "auth/invalid-credential":
                $timeout(function () {
                    $scope.newUpdate = true;
                    $scope.alertClass = "bg-danger updateMessage-error";
                    $scope.updateMessage = $filter('translate')("INVALID_CREDENTIAL");
                });
                break;
            case "auth/invalid-email":
                $timeout(function () {
                    $scope.newUpdate = true;
                    $scope.alertClass = "bg-danger updateMessage-error";
                    $scope.updateMessage = $filter('translate')("INVALID_EMAIL");
                });
                break;
            case "auth/wrong-password":
                $timeout(function () {
                    $scope.newUpdate = true;
                    $scope.alertClass = "bg-danger updateMessage-error";
                    $scope.updateMessage = $filter('translate')("INVALID_PASSWORD");
                });
                break;
            default:
                $timeout(function () {
                    $scope.newUpdate = true;
                    $scope.alertClass = "bg-danger updateMessage-error";
                    $scope.updateMessage = $filter('translate')("INTERNETERROR");
                });
        }
    }

});