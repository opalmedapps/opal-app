// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-08-08
 * Time: 10:02 AM
 */

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('ChangeSettingController', ChangeSettingController);

    ChangeSettingController.$inject = ['$filter', '$timeout', 'EncryptionService', 'Firebase', 'LogOutService',
        'NativeNotification', 'Navigator', 'Params', 'RequestToServer', 'UserPreferences'];

    /* @ngInject */
    function ChangeSettingController($filter, $timeout, EncryptionService, Firebase, LogOutService,
                                     NativeNotification, Navigator, Params, RequestToServer, UserPreferences) {
        let vm = this;

        // Values set by the password strength checker directive
        vm.passwordIsValid = false;
        vm.passwordErrors = [];

        // Error message displayed when an issue occurs
        vm.alert = {
            type: Params.alertTypeDanger,
            message: '',
        }

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
            let parameters = Navigator.getParameters().param;

            // Mapping between parameters and their translations
            $timeout(function () {
                //Instantiates values and parameters
                vm.disableButton = true;
                vm.title = "UPDATE";
                vm.value = parameters;
                //Sets the instructions depending on the value to update
                if (parameters === Params.setPasswordParam) {
                    vm.title = "UPDATE_PASSWORD_TITLE";
                    vm.newValue = '';
                    vm.newValueValidate = '';
                    vm.oldValue = '';
                    vm.instruction = "ENTER_NEW_PASSWORD";
                    vm.instructionOld = "ENTER_OLD_PASSWORD";
                } else if (parameters === Params.setLanguageParam) {
                    vm.instruction = "SELECT_LANGUAGE";
                    vm.pickLanguage = UserPreferences.getLanguage();
                    vm.settingsLanguageOptions = UserPreferences.getSupportedLanguages();
                } else if (parameters === Params.setFontSizeParam) {
                    vm.settingFontOptions = Params.settingFontOptions;
                    vm.instruction = "SELECT_FONT_SIZE";
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
            UserPreferences.setLanguage(val, true);
            RequestToServer.sendRequest('AccountChange', {
                NewValue: val,
                FieldToChange: Params.setLanguageParamProperCase,
            });
        }

        /**
         * @description Updates variables when the user types in the password fields, for example,
         *              enables/disables the submit button.
         */
        function passwordFieldChange() {
            // Use $timeout to compute the changes after vm.passwordIsValid is set
            $timeout(() => {
                vm.alert.message = '';
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
                await updatePasswordOnServer();
                localStorage.removeItem("deviceID");
                localStorage.removeItem(EncryptionService.getStorageKey());

                // Update the UI to reflect success
                $timeout(() => {
                    clearForm();
                    NativeNotification.showNotificationAlert(
                        $filter('translate')('PASSWORD_UPDATED_LOG_IN'),
                        $filter('translate')('SUCCESS'),
                        LogOutService.logOut,
                    );
                });
            }
            catch (error) {
                handleError(error);
            }
        }

        /**
         * @description Sends an AccountChange request to the listener with a password update.
         * @returns {Promise<void>}
         */
        async function updatePasswordOnServer() {
            let requestParameters = {
                FieldToChange: Params.setPasswordField,
                NewValue: vm.newValue,
            }
            await RequestToServer.sendRequestWithResponse('AccountChange', requestParameters);
        }

        /**
         * @description Handles and displays an error to the user.
         * @param {object} error The error to be processed.
         */
        function handleError(error) {
            console.error(error);
            $timeout(() => {
                switch(error.code) {
                    case Params.invalidUser:
                        vm.alert.message = "INVALID_USER";
                        break;
                    case Params.invalidEmail:
                        vm.alert.message = "INVALID_EMAIL";
                        break;
                    case Params.invalidPassword:
                        vm.alert.message = "INVALID_OLD_PASSWORD";
                        break;
                    case Params.weakPassword:
                        vm.alert.message = "PASSWORD_CRITERIA";
                        break;
                    default:
                        clearForm();
                        vm.alert.message = "ERROR_GENERIC";
                        break;
                }
            })
        }

        /**
         * @description Clears all form data from the UI.
         *              Usually called upon successful form submission, or if an error occurs that the user
         *              can't correct immediately by updating the form content.
         */
        function clearForm() {
            vm.alert.message = '';
            vm.newValue = '';
            vm.newValueValidate = '';
            vm.oldValue = '';
            vm.disableButton = false;
        }
    }
})();
