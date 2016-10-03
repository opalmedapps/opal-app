//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp = angular.module('MUHCApp');
myApp.controller('accountSettingController', ['Patient', 'UserPreferences', '$scope', '$timeout', 'UpdateUI', 'RequestToServer', '$filter', 'NavigatorParameters', function(Patient, UserPreferences, $scope, $timeout, UpdateUI, RequestToServer, $filter, NavigatorParameters) {


    //Backbutton android pressed action, only Android devices
    var backButtonPressed = 0;
    $scope.accountDeviceBackButton = function() {
        tabbar.setActiveTab(0);
    };
    //General device settings and privacy settings
    $scope.goToGeneralSettings = function() {
        NavigatorParameters.setParameters({
            'Navigator': 'settingsNavigator'
        });
        settingsNavigator.pushPage('./views/init/init-settings.html');
    };


    //Pull to refresh function
    $scope.load2 = function($done) {
        UpdateUI.update('All').then(function()
		{
			$timeout(function()
			{
				updated=true;
				backButtonPressed = 0;
				accountInit();
				clearTimeout(timeOut);
				$done();
			});
		}).catch(function(error){
			console.log(error);
			clearTimeout(timeOut);
			$done();
		});
		var timeOut = setTimeout(function(){
			$done();
		},5000);
    };
    //Initiate account settings function
    accountInit();

    //On postpop initialize the account settings to make sure the changes went through
    settingsNavigator.on('postpop', function() {
        $timeout(function() {
            backButtonPressed = 0;
            accountInit();
        });

    });
    //On destroy, dettach listener
    $scope.$on('destroy', function() {
        settingsNavigator.off('postpop');
    });
    //Initializing all the user preferences
    function accountInit() {
        var nativeCalendar = Number(window.localStorage.getItem('NativeCalendar'));
        $scope.passFill = '********';
        $scope.mobilePlatform = (ons.platform.isIOS() || ons.platform.isAndroid());
        $scope.checkboxModelCalendar = (nativeCalendar) ? nativeCalendar:0;
        $scope.calendarPreference = $scope.checkboxModelCalendar;
        $scope.checkboxModel = UserPreferences.getEnableSMS();
        $scope.smsPreference = $scope.checkboxModel;
        $scope.FirstName = Patient.getFirstName();
        $scope.LastName = Patient.getLastName();
        $scope.PatientId = Patient.getPatientId();
        $scope.Alias = Patient.getAlias();
        $scope.Email = Patient.getEmail();
        $scope.TelNum = Patient.getTelNum();
        $scope.Language = UserPreferences.getLanguage();
        console.log(UserPreferences.getLanguage());
        $scope.ProfilePicture = Patient.getProfileImage();
        $scope.passwordLength = 7;
    }
    //Function changes the enableSMS for the sms notifications and Calendar settings for the device calendar 
/*    $scope.saveSettings = function(option) {

        if ($scope.mobilePlatform) {
                var message = '';
                if (option === 'EnableSMS') {
                    if ($scope.checkboxModel === 1) {
                        message = $filter('translate')("ENABLESMSNOTIFICATIONQUESTION");
                    } else {
                        message = $filter('translate')("DISABLESMSNOTIFICATIONQUESTION");
                    }
                    navigator.notification.confirm(message, confirmCallbackSMS, $filter('translate')("CONFIRMALERTSMSLABEL"), [$filter('translate')("CONTINUE"), $filter('translate')("CANCEL")]);

                } else if (option === 'Calendar') {
                    if ($scope.checkboxModelCalendar === 1) {
                        message = $filter('translate')("ENABLECALENDARACCESSQUESTION");
                    } else {
                        message = $filter('translate')("DISABLECALENDARACCESSQUESTION");
                    }
                    navigator.notification.confirm(message, confirmCallbackCalendar, $filter('translate')("CONFIRMALERTCALENDARLABEL"), [$filter('translate')("CONTINUE"), $filter('translate')("CANCEL")]);
                }
        } else {
            if (option === 'EnableSMS') {
                var objectToSend = {};
                objectToSend.FieldToChange = 'EnableSMS';
                objectToSend.NewValue = $scope.checkboxModel;
                UserPreferences.setEnableSMS(objectToSend.NewValue);
                RequestToServer.sendRequest('AccountChange', objectToSend);
            }
        }
    };

    function confirmCallbackCalendar(index) {
        console.log(index);
        if (index == 1) {
            window.localStorage.setItem('NativeCalendar', $scope.checkboxModelCalendar);
        } else {
            $timeout(function() {
                $scope.checkboxModelCalendar = ($scope.checkboxModelCalendar == 1)?0:1;
            });
        }
    }

    function confirmCallbackSMS(index) {
        console.log(index);
        if (index == 1) {
            var objectToSend = {};
            objectToSend.FieldToChange = 'EnableSMS';
            objectToSend.NewValue = $scope.checkboxModel;
            UserPreferences.setEnableSMS(objectToSend.NewValue);
            $scope.smsPreference = $scope.checkboxModel;
            RequestToServer.sendRequest('AccountChange', objectToSend);
        } else {
            $timeout(function() {
                $scope.checkboxModel = ($scope.checkboxModel == 1)?0:1;
            });
        }
    }*/
}]);



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
            $scope.placeHolder = label + $scope.valueLabel;
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
        var ref = new Firebase(FirebaseService.getFirebaseUrl());
        ref.changePassword({
            email: Patient.getEmail(),
            oldPassword: $scope.oldValue,
            newPassword: $scope.newValue
        }, function(error) {
            if (error) {
                switch (error.code) {
                    case "INVALID_PASSWORD":
                        $timeout(function() {
                            $scope.newUpdate = true;
                            $scope.alertClass = "bg-danger updateMessage-error";
                            $scope.updateMessage = $filter('translate')("INVALID_PASSWORD");
                        });
                        break;
                    case "INVALID_USER":
                        console.log("The specified user account does not exist.");
                        break;
                    default:
                        $timeout(function() {
                            $scope.newUpdate = true;
                            $scope.alertClass = "bg-danger updateMessage-error";
                            $scope.updateMessage = $filter('translate')("INTERNETERROR");
                        });
                }
            } else {
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
        });
    }

    //Change email function
    function changeEmail() {
        var ref = new Firebase(FirebaseService.getFirebaseUrl());

        ref.changeEmail({
            oldEmail: Patient.getEmail(),
            newEmail: $scope.newValue,
            password: $scope.oldValue
        }, function(error) {
            if (error) {
                console.log(error.code);
                switch (error.code) {
                    case "INVALID_PASSWORD":
                        $timeout(function() {
                            $scope.alertClass = "bg-danger updateMessage-error";
                            $scope.newUpdate = true;
                            $scope.updateMessage = $filter('translate')("INVALID_PASSWORD");
                        });
                        break;
                     case "EMAIL_TAKEN":
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
                            $scope.updateMessage = $filter('translate')("PROBLEM_UPDATING_PASSWORD");
                        });
                        break;
                }
                
                console.log("Error changing email:", error);
            } else {
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
        });
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

});