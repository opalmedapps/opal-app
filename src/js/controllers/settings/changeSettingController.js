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

    ChangeSettingController.$inject = ['$filter', 'FirebaseService', 'UserPreferences', 'RequestToServer',
        '$timeout', 'UserAuthorizationInfo', 'NavigatorParameters', '$window', 'Params'];

    /* @ngInject */
    function ChangeSettingController($filter, FirebaseService, UserPreferences, RequestToServer, $timeout,
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

        //Sets all the account settings depending on the field that needs to be changed
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
                vm.title = "UPDATE";
                vm.value = parameters;
                vm.valueLabel = parameters;
                vm.personal = true;
                vm.type1 = 'text';
                //Sets the instructions depending on the value to update
                if (parameters === Params.setPasswordParam) {
                    vm.type1 = Params.setPasswordType;
                    vm.type2 = Params.setPasswordType;
                    vm.title = "UPDATEPASSWORDTITLE";
                    vm.newValue = '';
                    vm.newValueValidate = '';
                    vm.oldValue = '';
                    var label = $filter('translate')("ENTEROLDPASSWORDPLACEHOLDER");
                    vm.placeHolder = label;
                    vm.instruction = "ENTERNEWPASSWORD";
                    vm.instructionOld = "ENTEROLDPASSWORD";
                    vm.inputInstruction = $filter('translate')("REENTERPASSWORDPLACEHOLDER");
                    vm.valueLabel = $filter('translate')("SETNEWPASSWORDPLACEHOLDER");
                } else if (parameters === Params.setLanguageParam) {
                    var value = UserPreferences.getLanguage();
                    vm.instruction = "SELECTLANGUAGE";
                    vm.personal = false;
                    vm.fontUpdated = false;
                    vm.pickLanguage = value;
                    vm.firstOption = Params.setFirstLanguageInstruction;
                    vm.secondOption = Params.setSecondLanguageInstruction;
                    vm.valueLabel = Params.setLanguageParam;
                    vm.title = "UPDATE";
                } else if (parameters === Params.setFontSizeParam) {
                    var value = UserPreferences.getFontSize();
                    vm.firstOption = Params.setFontOptionMedium;
                    vm.secondOption = Params.setFontOptionLarge;
                    vm.thirdOption = Params.setFontOptionExtraLarge;
                    vm.instruction = "SELECTFONTSIZE";
                    vm.personal = false;
                    vm.fontUpdated = true;
                    vm.pickFont = value;
                }
            });
        }

        //Sets a watch on the values typed and runs the validation scripts for the respective values
        function evaluate() {
            vm.newUpdate = false;
            if (parameters !== Params.setLanguageParam && parameters !== Params.setFontSizeParam) {
                if (parameters === Params.setPasswordParam) {
                    vm.disableButton = !validatePassword();
                } else {
                    vm.disableButton = !validateAlias();
                }
            }
        }

        //Function to update new value
        function updateValue(val) {
            var objectToSend = {};
            objectToSend.NewValue = vm.newValue;
            val.toUpperCase() === Params.setPasswordParam ? changePassword() : changeField(val, vm.newValue);
            vm.disableButton = true;
        }

        //Function to change font size
        function changeFont (newVal) {
            UserPreferences.setFontSize(newVal);
        }

        //Function to change the language
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
                            vm.updateMessage = "PASSWORDUPDATED";
                            vm.newUpdate = true;
                        });

                        localStorage.removeItem("deviceID");
                        localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
                    })
                    .catch(function (error) {
                        $timeout(function() {
                            vm.newUpdate = true;
                            vm.alertClass = Params.alertClassUpdateMessageSuccess;
                            vm.updateMessage = "INTERNETERROR";
                        });
                    })
            }
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

        function handleError(error) {
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
                        vm.updateMessage = "INTERNETERROR";
                        break;
                }
            })
        }
    }
})();
