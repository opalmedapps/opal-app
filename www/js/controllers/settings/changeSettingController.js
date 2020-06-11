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
        '$timeout', 'UserAuthorizationInfo', 'NavigatorParameters', '$window'];

    /* @ngInject */
    function ChangeSettingController($filter, FirebaseService, UserPreferences, Patient, RequestToServer, $timeout,
                                     UserAuthorizationInfo, NavigatorParameters, $window) {

        var vm = this;
        var page;
        var parameters;
        var navigatorName;
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
            navigatorName = NavigatorParameters.getParameters().Navigator;
            page = $window[navigatorName].getCurrentPage();
            parameters = page.options.param;
            //Actual Value
            vm.actualValue = '';

            $timeout(function () {
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
                    vm.inputInstruction = "REENTER_EMAIL";
                } else if (parameters === 'PASSWORD') {
                    vm.type1 = 'password';
                    vm.type2 = 'password';
                    vm.title = 'UPDATEPASSWORDTITLE';
                    vm.newValue = '';
                    vm.newValueValidate = '';
                    vm.oldValue = '';
                    var label = $filter('translate')("ENTEROLDPASSWORDPLACEHOLDER");
                    vm.placeHolder = label;
                    vm.instruction = "ENTERNEWPASSWORD";
                    vm.instructionOld = "ENTEROLDPASSWORD";
                    vm.inputInstruction = $filter('translate')("REENTERPASSWORDPLACEHOLDER");
                    vm.valueLabel = $filter('translate')("SETNEWPASSWORDPLACEHOLDER");
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
            });
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

                // Before updating the password, check that the new password's contents are valid. -SB
                if (validatePasswordContents()) {
                    user.updatePassword(vm.newValue).then(updateOnServer).catch(handleError);
                }
                else{
                    handleError({
                       code:"password-disrespects-criteria"
                    });
                }
            }).catch(handleError);

            function updateOnServer(){
                var objectToSend = {};
                objectToSend.FieldToChange = 'Password';
                objectToSend.NewValue = vm.newValue;
                RequestToServer.sendRequestWithResponse('AccountChange', objectToSend)
                    .then(function () {
                        $timeout(function(){
                            vm.alertClass = "bg-success updateMessage-success";
                            vm.updateMessage = "PASSWORDUPDATED";
                            vm.newUpdate = true;
                        });

                        localStorage.removeItem("deviceID");
                        localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
                    })
                    .catch(function (error) {
                        $timeout(function() {
                            vm.newUpdate = true;
                            vm.alertClass = "bg-danger updateMessage-error";
                            vm.updateMessage = "INTERNETERROR";
                        });
                    })
            }
        }
        //Change email function
        function changeEmail() {

            var user = FirebaseService.getAuthenticationCredentials();
            var credential = firebase.auth.EmailAuthProvider.credential(user.email, vm.oldValue);

            user.reauthenticate(credential).then(function () {
                user.updateEmail(vm.newValue).then(updateOnServer).catch(handleError);
            }).catch(handleError);

            function updateOnServer(){
                var objectToSend = {};
                objectToSend.FieldToChange = 'Email';
                objectToSend.NewValue = vm.newValue;
                Patient.setEmail(vm.newValue);
                window.localStorage.setItem('Email',vm.newValue);
                RequestToServer.sendRequestWithResponse('AccountChange', objectToSend)
                    .then(function(){
                        $timeout(function(){
                            vm.alertClass = "bg-success updateMessage-success";
                            vm.updateMessage = "UPDATED_EMAIL";
                            vm.newUpdate = true;
                        });
                    }).catch(handleError);
            }
        }
        //Validating fields functions
        function validateTelNum() {
            var regex = /^[0-9]{10}$/;
            return (vm.actualValue !== vm.newValue && regex.test(vm.newValue));
        }

        function validateEmail() {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return (vm.newValue !== vm.actualValue && re.test(vm.newValue));
        }

        // Used to enable or disable the UPDATE button
        function validatePassword() {
            return (vm.newValue.length > 5 && vm.newValue === vm.newValueValidate);
        }

        /**
         * validatePasswordContents
         * @author Stacey Beard
         * @date 2018-10-09
         * @desc Checks the contents of a password to make sure it matches security criteria.
         *       For example, checks that the password contains at least one letter and one number.
         *       Used after the UPDATE button is pressed to refuse the password and produce an error message
         *       if necessary.
         * @returns {boolean} True if the password contents are valid; false otherwise
         */
        function validatePasswordContents() {
            let containsALetter = vm.newValue.search(/[a-zA-Z]{1}/) > -1;
            let containsANumber = vm.newValue.search(/\d{1}/) > -1;
            return containsALetter && containsANumber;
        }

        function validateAlias() {
            return (vm.actualValue !== vm.newValue && vm.newValue.length > 3);
        }

        function handleError(error) {
            $timeout(function(){
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
                    case "auth/email-already-in-use":
                        vm.alertClass = "bg-danger updateMessage-error";
                        vm.newUpdate = true;
                        vm.updateMessage = "EMAIL_TAKEN";
                        break;
                    case "auth/weak-password":
                        vm.newUpdate = true;
                        vm.alertClass = "bg-danger updateMessage-error";
                        vm.updateMessage = "INVALID_PASSWORD";
                        break;
                    case "password-disrespects-criteria":
                        vm.newUpdate = true;
                        vm.alertClass = "bg-danger updateMessage-error";
                        vm.updateMessage = "PASSWORD_CRITERIA";
                        break;
                    default:
                        vm.newUpdate = true;
                        vm.alertClass = "bg-danger updateMessage-error";
                        vm.updateMessage = "INTERNETERROR";
                        break;
                }
            })
        }
    }
})();
