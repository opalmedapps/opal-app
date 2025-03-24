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
        '$timeout', 'UserAuthorizationInfo', 'NavigatorParameters', '$window', 'Params',
        'EncryptionService'];

    /* @ngInject */
    function ChangeSettingController(Firebase, UserPreferences, RequestToServer, $timeout,
                                    UserAuthorizationInfo, NavigatorParameters, $window, Params,
                                    EncryptionService) {
        var vm = this;
        var page;
        var parameters;
        var navigatorName;

        // Values set by the password strength checker directive
        vm.passwordIsValid = false;
        vm.passwordErrors = [];

        vm.changePassword = changePassword;
        vm.changeFont = changeFont;
        vm.changeLanguage = changeLanguage;
        vm.passwordFieldChange = passwordFieldChange;
        // Used to show an error when the password confirmation doesn't match the password
        vm.passwordConfirmationInvalid = () => !vm.newValueValidate || vm.newValue !== vm.newValueValidate;

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

        /**
         * @description Updates variables when the user types in the password fields, for example,
         *              enables/disables the submit button.
         */
        function passwordFieldChange() {
            // Use $timeout to compute the changes after vm.passwordIsValid is set
            $timeout(() => {
                vm.newUpdate = false;
                vm.disableButton = !vm.oldValue || !vm.passwordIsValid || vm.passwordConfirmationInvalid();
            });
        }

        /**
         * @description Re-authenticates the user with their old password, then sets their new password in Firebase
         *              and on the server.
         */
        async function changePassword() {
            try {
                vm.disableButton = true;
                await Firebase.reauthenticateCurrentUser(vm.oldValue);
                await Firebase.updateCurrentUserPassword(vm.newValue);
                await updateOnServer();
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
                    localStorage.removeItem(EncryptionService.getStorageKey());
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
                        vm.updateMessage = "INVALID_OLD_PASSWORD";
                        break;
                    case Params.emailInUse:
                        vm.alertClass = Params.alertClassUpdateMessageError;
                        vm.newUpdate = true;
                        vm.updateMessage = "EMAIL_TAKEN";
                        break;
                    case Params.weakPassword:
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
