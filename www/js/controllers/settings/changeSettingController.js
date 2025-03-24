/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-08-08
 * Time: 10:02 AM
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('ChangeSettingController', ChangeSettingController);

    ChangeSettingController.$inject = ['$filter', 'FirebaseService', 'UserPreferences', 'Patient', 'RequestToServer',
        '$timeout', 'UserAuthorizationInfo', 'EncryptionService'];

    /* @ngInject */
    function ChangeSettingController($filter, FirebaseService, UserPreferences, Patient, RequestToServer, $timeout,
                                     UserAuthorizationInfo, EncryptionService) {

        var vm = this;
        var page;
        var parameters;
        vm.updateValue = updateValue;
        vm.changeFont = changeFont;
        vm.changeLanguage = changeLanguage;
        vm.evaluate = evaluate;

        activate();

        ////////////////////////

        //Sets all the account settings depeding on the field that needs to be changed
        function activate() {
            //Mappings between parameters and translation
            //Navigator parameter
            page = settingsNavigator.getCurrentPage();
            parameters = page.options.param;
            //Actual Value
            vm.actualValue = '';

            //Instantiates values and parameters
            vm.disableButton = true;
            vm.title = 'UPDATE';
            vm.value = parameters;
            vm.valueLabel = parameters;
            vm.personal = true;
            vm.type1 = 'text';

            //Sets the instructions depending on the value to update
            if (parameters === 'ALIAS') {
                vm.actualValue = Patient.getAlias();
                vm.newValue = vm.actualValue;
                vm.instruction = "ENTERYOURALIAS";
            } else if (parameters === 'PHONENUMBER') {
                vm.actualValue = Patient.getTelNum();
                vm.newValue = vm.actualValue;
                vm.instruction = "ENTERNEWTELEPHONE";
            } else if (parameters === 'EMAIL') {
                vm.type1 = 'email';
                vm.type2 = 'password';
                vm.newValue = '';
                vm.oldValue = '';
                vm.placeHolder = $filter('translate')("ENTERPASSWORD");
                vm.instruction = "ENTEREMAILADDRESS";
                vm.instructionOld = "ENTERPASSWORD";
            } else if (parameters === 'PASSWORD') {
                vm.type1 = 'password';
                vm.type2 = 'password';
                vm.newValue = '';
                vm.newValueValidate = '';
                vm.oldValue = '';
                var label = $filter('translate')('ENTEROLD');
                vm.placeHolder = label + ' ' +$filter('translate')(vm.valueLabel);
                vm.instruction = "ENTERNEWPASSWORD";
                vm.instructionOld = "ENTEROLDPASSWORD";
            } else if (parameters === 'LANGUAGE') {
                var value = UserPreferences.getLanguage();
                vm.instruction = 'SELECTLANGUAGE';
                vm.personal = false;
                vm.fontUpdated = false;
                vm.pickLanguage = value;
                vm.firstOption = 'EN';
                vm.secondOption = 'FR';
                vm.valueLabel = 'LANGUAGE';
                vm.title = 'UPDATE';
            } else if (parameters === 'FONTSIZE') {
                var value = UserPreferences.getFontSize();
                vm.firstOption = 'medium';
                vm.secondOption = 'large';
                vm.thirdOption = 'xlarge';
                vm.instruction = "SELECTFONTSIZE";
                vm.personal = false;
                vm.fontUpdated = true;
                vm.pickFont = value;
            }
        }

        //Sets a watch on the values typed and runs the validation scripts for the respective values
        function evaluate () {
            vm.newUpdate = false;
            if (parameters !== 'LANGUAGE' && parameters !== 'FONTSIZE') {
                if (parameters == 'EMAIL') {
                    vm.disableButton = !validateEmail();
                } else if (parameters == 'PASSWORD') {
                    vm.disableButton = !validatePassword();
                } else if (parameters == 'PHONENUMBER') {
                    vm.disableButton = !validateTelNum();
                } else {
                    vm.disableButton = !validateAlias();
                }
            }
        }

        //Function to update new value
        function updateValue (val) {
            var objectToSend = {};
            objectToSend.NewValue = vm.newValue;

            if (val.toUpperCase() === 'PASSWORD') {

                changePassword();
            } else if (val.toUpperCase() === 'EMAIL') {
                changeEmail();
            }else{
                changeField(val, vm.newValue);
            }
            vm.disableButton = true;
        }

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
            vm.actualValue = value;
            vm.newUpdate = true;
            vm.alertClass = "bg-success updateMessage-success";
            vm.updateMessage = "FIELD_UPDATED";
        }

        //Function to change font size
        function changeFont (newVal) {
            UserPreferences.setFontSize(newVal);
        }

        //FUnction to change the language
        function changeLanguage (val) {
            console.log('changed language to : ' + val);
            var objectToSend = {};
            objectToSend.NewValue = val;
            objectToSend.FieldToChange = 'Language';
            RequestToServer.sendRequest('AccountChange', objectToSend);
            UserPreferences.setLanguage(val);
        }

        //Change password function
        function changePassword() {

            var user = FirebaseService.getAuthenticationCredentials();
            var credential = firebase.auth.EmailAuthProvider.credential(user.email, vm.oldValue);

            user.reauthenticate(credential).then(function () {
                user.updatePassword(vm.newValue).then(updateOnServer).catch(handleError);
            }).catch(handleAuthenticationError);

            function updateOnServer(){
                var objectToSend = {};
                objectToSend.FieldToChange = 'Password';
                objectToSend.NewValue = vm.newValue;
                RequestToServer.sendRequestWithResponse('AccountChange', objectToSend)
                    .then(function () {
                        vm.alertClass = "bg-success updateMessage-success";
                        vm.updateMessage = "PASSWORDUPDATED";
                        vm.newUpdate = true;
                        localStorage.removeItem("deviceID");
                        localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
                    })
                    .catch(function (error) {
                        vm.newUpdate = true;
                        vm.alertClass = "bg-danger updateMessage-error";
                        vm.updateMessage = "INTERNETERROR";
                    })

            }

            function handleError(error){
                switch (error.code) {
                    case "auth/weak-password":
                        vm.newUpdate = true;
                        vm.alertClass = "bg-danger updateMessage-error";
                        vm.updateMessage = "INVALID_PASSWORD";
                        break;
                    default:
                        vm.newUpdate = true;
                        vm.alertClass = "bg-danger updateMessage-error";
                        vm.updateMessage = "INTERNETERROR";
                        break;
                }
            }
        }
        //Change email function
        function changeEmail() {

            var user = FirebaseService.getAuthenticationCredentials();
            var credential = firebase.auth.EmailAuthProvider.credential(user.email, vm.oldValue);

            user.reauthenticate(credential).then(function () {
                user.updateEmail(vm.newValue).then(updateOnServer).catch(handleError);
            }).catch(handleAuthenticationError);

            function updateOnServer(){
                var objectToSend = {};
                objectToSend.FieldToChange = 'Email';
                objectToSend.NewValue = vm.newValue;
                Patient.setEmail(vm.newValue);
                window.localStorage.setItem('Email',vm.newValue);
                RequestToServer.sendRequestWithResponse('AccountChange', objectToSend)
                    .then(function(){
                        vm.alertClass = "bg-success updateMessage-success";
                        vm.updateMessage = "UPDATED_EMAIL";
                        vm.newUpdate = true;
                    }).catch(handleError);
            }

            function handleError(){
                switch (error.code) {
                    case "auth/invalid-email":
                        vm.alertClass = "bg-danger updateMessage-error";
                        vm.newUpdate = true;
                        vm.updateMessage = "INVALID_EMAIL";
                        break;
                    case "auth/email-already-in-use":
                        vm.alertClass = "bg-danger updateMessage-error";
                        vm.newUpdate = true;
                        vm.updateMessage = "EMAIL_TAKEN";
                        break;
                    default:
                        vm.alertClass = "bg-danger updateMessage-error";
                        vm.newUpdate = true;
                        vm.updateMessage = "INTERNETERROR";
                        break;
                }
            }
        }
        //Validating fields functions
        function validateTelNum() {
            var regex = /^[0-9]{10}$/;
            return (vm.actualValue !== vm.newValue && regex.test(vm.newValue));
        }

        function validateEmail() {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return (vm.newValue !== vm.actualValue && re.test(vm.newValue) && vm.oldValue.length > 3);
        }

        function validatePassword() {
            return (vm.newValue.length > 5 && vm.oldValue.length > 4 && vm.newValue === vm.newValueValidate);
        }

        function validateAlias() {
            return (vm.actualValue !== vm.newValue && vm.newValue.length > 3);
        }

        function handleAuthenticationError(error) {
            switch(error.code){
                case "auth/user-mismatch":
                    vm.newUpdate = true;
                    vm.alertClass = "bg-danger updateMessage-error";
                    vm.updateMessage = "INVALID_ASSOCIATION";
                    break;
                case "auth/user-not-found":
                    vm.newUpdate = true;
                    vm.alertClass = "bg-danger updateMessage-error";
                    vm.updateMessage = "INVALID_USER";
                    break;
                case "auth/invalid-credential":
                    vm.newUpdate = true;
                    vm.alertClass = "bg-danger updateMessage-error";
                    vm.updateMessage = "INVALID_CREDENTIAL";
                    break;
                case "auth/invalid-email":
                    vm.newUpdate = true;
                    vm.alertClass = "bg-danger updateMessage-error";
                    vm.updateMessage = "INVALID_EMAIL";
                    break;
                case "auth/wrong-password":
                    vm.newUpdate = true;
                    vm.alertClass = "bg-danger updateMessage-error";
                    vm.updateMessage = "INVALID_PASSWORD";
                    break;
                default:
                    vm.newUpdate = true;
                    vm.alertClass = "bg-danger updateMessage-error";
                    vm.updateMessage = "INTERNETERROR";
                    break;
            }
        }
    }
})();
