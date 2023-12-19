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

    ChangeSettingController.$inject = ['Firebase', 'UserPreferences', 'RequestToServer',
        '$timeout', 'UserAuthorizationInfo', 'NavigatorParameters', '$window', 'Params'];

    /* @ngInject */
    function ChangeSettingController(Firebase, UserPreferences, RequestToServer, $timeout,
                                    UserAuthorizationInfo, NavigatorParameters, $window, Params) {
        var vm = this;
        var page;
        var parameters;
        var navigatorName;
        const MIN_PASSWORD_LENGTH = 8;

        // Value set by the password strength checker directive
        vm.passwordIsStrongEnough = false;

        vm.changePassword = changePassword;
        vm.changeFont = changeFont;
        vm.changeLanguage = changeLanguage;
        vm.validatePassword = validatePassword;

        activate();

        ////////////////////////

        //Sets all the account settings depending on the field that needs to be changed
        function activate() {
            //Mappings between parameters and translation
            //Navigator parameter
            navigatorName = NavigatorParameters.getParameters().Navigator;
            page = $window[navigatorName].getCurrentPage();
            parameters = page.options.param;

            $timeout(function () {
                //Instantiates values and parameters
                vm.disableButton = true;
                vm.title = "UPDATE";
                vm.value = parameters;
                //Sets the instructions depending on the value to update
                if (parameters === Params.setPasswordParam) {
                    vm.title = "UPDATEPASSWORDTITLE";
                    vm.newValue = '';
                    vm.newValueValidate = '';
                    vm.oldValue = '';
                    vm.placeHolderCurrent = "ENTEROLDPASSWORDPLACEHOLDER";
                    vm.placeHolderNew = "SETNEWPASSWORDPLACEHOLDER";
                    vm.placeHolderValidate = "REENTERPASSWORDPLACEHOLDER";
                    vm.instruction = "ENTERNEWPASSWORD";
                    vm.instructionOld = "ENTEROLDPASSWORD";
                } else if (parameters === Params.setLanguageParam) {
                    vm.instruction = "SELECTLANGUAGE";
                    vm.pickLanguage = UserPreferences.getLanguage();
                    vm.settingsLanguageOptions = Params.settingsLanguageOptions;
                } else if (parameters === Params.setFontSizeParam) {
                    vm.settingFontOptions = Params.settingFontOptions;
                    vm.instruction = "SELECTFONTSIZE";
                    vm.pickFont = UserPreferences.getFontSize();
                }
            });
        }

        //Function to change font size
        function changeFont(newVal) {
            UserPreferences.setFontSize(newVal);
        }

        //Function to change the language
        function changeLanguage(val) {
            var objectToSend = {};
            objectToSend.NewValue = val;
            objectToSend.FieldToChange = Params.setLanguageParamProperCase;
            RequestToServer.sendRequest('AccountChange', objectToSend);
            UserPreferences.setLanguage(val, true);
        }

        // Used to enable or disable the UPDATE button
        function validatePassword() {
            vm.newUpdate = false;
            let passwordIsValid = vm.newValue.length >= MIN_PASSWORD_LENGTH
                && vm.newValue === vm.newValueValidate
                && vm.passwordIsStrongEnough;

            vm.disableButton = !passwordIsValid;
        }

        /**
         * @description Re-authenticates the user with their old password, then sets their new password in Firebase
         *              and on the server.
         */
        async function changePassword() {
            try {
                vm.disableButton = true;
                await Firebase.reauthenticateCurrentUser(vm.oldValue);

                // Before updating it, check that the new password meets the minimum security requirements
                if (validatePasswordContents(vm.newValue)) {
                    await Firebase.updateCurrentUserPassword(vm.newValue);
                    await updateOnServer();
                }
                else {
                    handleError({code:"password-disrespects-criteria"});
                }
            }
            catch (error) {
                handleError(error);
            }
        }

        // Change the password on Opal servers
        function updateOnServer() {
            var objectToSend = {};
            objectToSend.FieldToChange = Params.setPasswordField;
            objectToSend.NewValue = vm.newValue;
            RequestToServer.sendRequestWithResponse('AccountChange', objectToSend)
                .then(function () {
                    $timeout(function(){
                        vm.alertClass = Params.alertClassUpdateMessageSuccess;
                        vm.updateMessage = "PASSWORDUPDATED";
                        vm.newUpdate = true;
                    });

                    localStorage.removeItem("deviceID");
                    localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
                })
                .catch(function (error) {
                    console.error(error);
                    $timeout(function() {
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = "ERROR_GENERIC";
                    });
                })
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
        function validatePasswordContents(passwordValue) {
            let containsANumber = passwordValue.search(/\d{1}/) > -1;
            let containsACapitalLetter = passwordValue.search(/[A-Z]{1}/) > -1;
            let containsSpecialChar = passwordValue.search(/\W|_{1}/) > -1;

            return containsACapitalLetter && containsANumber && containsSpecialChar;
        }

        function handleError(error) {
            console.error(error);
            $timeout(function(){
                switch(error.code){
                    case Params.userMismatch:
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = "INVALID_ASSOCIATION";
                        break;
                    case Params.invalidUser:
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = "INVALID_USER";
                        break;
                    case Params.invalidCredentials:
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = "INVALID_CREDENTIAL";
                        break;
                    case Params.invalidEmail:
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = "INVALID_EMAIL";
                        break;
                    case Params.invalidPassword:
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = "INVALID_PASSWORD";
                        break;
                    case Params.emailInUse:
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.newUpdate = true;
                        vm.updateMessage = "EMAIL_TAKEN";
                        break;
                    case Params.weakPassword:
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = "INVALID_PASSWORD";
                        break;
                    case "password-disrespects-criteria":
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = "PASSWORD_CRITERIA";
                        break;
                    default:
                        vm.newUpdate = true;
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.updateMessage = "ERROR_GENERIC";
                        break;
                }
            })
        }
    }
})();
