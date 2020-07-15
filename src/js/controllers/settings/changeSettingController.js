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
        '$timeout', 'UserAuthorizationInfo', 'NavigatorParameters', '$window', 'Params'];

    /* @ngInject */
    function ChangeSettingController($filter, FirebaseService, UserPreferences, Patient, RequestToServer, $timeout,
                                     UserAuthorizationInfo, NavigatorParameters, $window, Params) {

        var vm = this;
        var page;
        var parameters;
        var navigatorName;
        const MIN_PASSWORD_LENGTH = 8;
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
                vm.title = Params.setUpdateTitle;
                vm.value = parameters;
                vm.valueLabel = parameters;
                vm.personal = true;
                vm.type1 = 'text';

                //Sets the instructions depending on the value to update
                if (parameters === Params.setAliasParam) {
                    vm.actualValue = Patient.getAlias();
                    vm.newValue = vm.actualValue;
                    vm.instruction = Params.setAliasInstruction;
                } else if (parameters === Params.setPhoneNumbersParam) {
                    vm.actualValue = Patient.getTelNum();
                    vm.newValue = vm.actualValue;
                    vm.instruction = Params.setPhoneNumberInstruction;
                } else if (parameters === Params.setEmailParam) {
                    vm.type1 = Params.setEmailType;
                    vm.type2 = Params.setPasswordType;
                    vm.newValue = '';
                    vm.oldValue = '';
                    vm.placeHolder = $filter('translate')("ENTERPASSWORD");
                    vm.instruction = Params.setEmailInstruction;
                    vm.instructionOld = Params.setPasswordInstruction;
                    vm.inputInstruction = Params.setEmailInputInstruction;
                } else if (parameters === Params.setPasswordParam) {
                    vm.type1 = Params.setPasswordType;
                    vm.type2 = Params.setPasswordType;
                    vm.title = Params.setUpdatePasswordParam;
                    vm.newValue = '';
                    vm.newValueValidate = '';
                    vm.oldValue = '';
                    var label = $filter('translate')("ENTEROLDPASSWORDPLACEHOLDER");
                    vm.placeHolder = label;
                    vm.instruction = Params.setInstructionNewPassword;
                    vm.instructionOld = Params.setInstructionOldPassword;
                    vm.inputInstruction = $filter('translate')("REENTERPASSWORDPLACEHOLDER");
                    vm.valueLabel = $filter('translate')("SETNEWPASSWORDPLACEHOLDER");
                } else if (parameters === Params.setLanguageParam) {
                    var value = UserPreferences.getLanguage();
                    vm.instruction = Params.setLanguageInstruction;
                    vm.personal = false;
                    vm.fontUpdated = false;
                    vm.pickLanguage = value;
                    vm.firstOption = Params.setFirstLanguageInstruction;
                    vm.secondOption = Params.setSecondLanguageInstruction;
                    vm.valueLabel = Params.setLanguageParam;
                    vm.title = Params.setUpdateTitle;
                } else if (parameters === Params.setFontSizeParam) {
                    var value = UserPreferences.getFontSize();
                    vm.firstOption = Params.setFontOptionMedium;
                    vm.secondOption = Params.setFontOptionLarge;
                    vm.thirdOption = Params.setFontOptionExtraLarge;
                    vm.instruction = Params.setFontSizeTitle;
                    vm.personal = false;
                    vm.fontUpdated = true;
                    vm.pickFont = value;
                }
            });
        }

        //Sets a watch on the values typed and runs the validation scripts for the respective values
        function evaluate () {
            vm.newUpdate = false;
            if (parameters !== Params.setLanguageParam && parameters !== Params.setFontSizeParam) {
                if (parameters === Params.setEmailParam) {
                    vm.disableButton = !validateEmail();
                } else if (parameters === Params.setPasswordParam) {
                    vm.disableButton = !validatePassword();
                } else if (parameters === Params.setPhoneNumbersParam) {
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

            if (val.toUpperCase() === Params.setPasswordParam) {
                changePassword();
            } else if (val.toUpperCase() === Params.setEmailParam) {
                changeEmail();
            }else{
                changeField(val, vm.newValue);
            }
            vm.disableButton = true;
        }

        //Function to change Nickname and phone number
        function changeField(type, value)
        {
            var typeVal = (type.toUpperCase() === Params.setNicknameAlias) ? Params.setAliasLowerCaseParam : Params.setTelephoneNumberParam;
            var objectToSend = {};
            objectToSend.NewValue = value;
            objectToSend.FieldToChange = typeVal;
            RequestToServer.sendRequest('AccountChange', objectToSend);
            if (type.toUpperCase() === Params.setNicknameAlias) Patient.setAlias(value);
            else Patient.setTelNum(value);
            vm.actualValue = value;
            vm.newUpdate = true;
            vm.alertClass = Params.alertClassUpdateMessageSuccess;
            vm.updateMessage = Params.setUpdateMessageField;
        }

        //Function to change font size
        function changeFont (newVal) {
            UserPreferences.setFontSize(newVal);
        }

        //FUnction to change the language
        function changeLanguage (val) {
            var objectToSend = {};
            objectToSend.NewValue = val;
            objectToSend.FieldToChange = Params.setLanguageParamProperCase;
            RequestToServer.sendRequest('AccountChange', objectToSend);
            UserPreferences.setLanguage(val, true);
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
                objectToSend.FieldToChange = Params.setPasswordField;
                objectToSend.NewValue = vm.newValue;
                RequestToServer.sendRequestWithResponse('AccountChange', objectToSend)
                    .then(function () {
                        $timeout(function(){
                            vm.alertClass = Params.alertClassUpdateMessageSuccess;
                            vm.updateMessage = Params.setUpdatePasswordMessage;
                            vm.newUpdate = true;
                        });

                        localStorage.removeItem("deviceID");
                        localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
                    })
                    .catch(function (error) {
                        $timeout(function() {
                            vm.newUpdate = true;
                            vm.alertClass = Params.alertClassUpdateMessageSuccess;
                            vm.updateMessage = Params.secondNetworkErrorMessage;
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
                objectToSend.FieldToChange = Params.setEmailField;
                objectToSend.NewValue = vm.newValue;
                Patient.setEmail(vm.newValue);
                window.localStorage.setItem(Params.setEmailField,vm.newValue);
                RequestToServer.sendRequestWithResponse('AccountChange', objectToSend)
                    .then(function(){
                        $timeout(function(){
                            vm.alertClass = Params.alertClassUpdateMessageSuccess;
                            vm.updateMessage = Params.setEmailUpdateParam;
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
            return (vm.newValue.length >= MIN_PASSWORD_LENGTH && vm.newValue === vm.newValueValidate);
        }

        /**
         * validatePasswordContents
         * @author Stacey Beard, Yuan Chen
         * @date 2020-06-08
         * @desc Checks the contents of a password to make sure it matches security criteria.
         *       For example, checks that the password contains at least one capital letter, one special character and one number.
         *       Used after the UPDATE button is pressed to refuse the password and produce an error message
         *       if necessary.
         * @returns {boolean} True if the password contents are valid; false otherwise
         */
        function validatePasswordContents() {
            let containsANumber = vm.newValue.search(/\d{1}/) > -1;
            let containsACapitalLetter = vm.newValue.search(/[A-Z]{1}/) > -1;
            let containsSpecialChar = vm.newValue.search(/\W|_{1}/) > -1;

            return containsACapitalLetter && containsANumber && containsSpecialChar;
        }

        function validateAlias() {
            return (vm.actualValue !== vm.newValue && vm.newValue.length > 3);
        }

        function handleError(error) {
            $timeout(function(){
                switch(error.code){
                    case Params.userMismatch:
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = Params.invalidUserAssociation;
                        break;
                    case Params.invalidUser:
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = Params.invalidUserMessage;
                        break;
                    case Params.invalidCredentials:
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = Params.invalidCredentialsMessage;
                        break;
                    case Params.invalidEmail:
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = Params.invalidEmailMessage;
                        break;
                    case Params.invalidPassword:
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = Params.invalidPasswordMessage;
                        break;
                    case Params.emailInUse:
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.newUpdate = true;
                        vm.updateMessage = Params.emailInUseMessage;
                        break;
                    case Params.weakPasswordCase:
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = Params.invalidPasswordMessage;
                        break;
                    case Params.passwordDisrespectCase:
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = Params.passwordDisrespectMessage;
                        break;
                    default:
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = Params.secondNetworkErrorMessage;
                        break;
                }
            })
        }
    }
})();
