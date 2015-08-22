angular.module('MUHCApp')

    .controller('accountSettingController', ['Patient', 'UserPreferences','$scope','$timeout','UpdateUI', 'RequestToServer','$timeout', function (Patient, UserPreferences, $scope, $timeout,UpdateUI, RequestToServer,$timeout) {
    //Patient.setData($rootScope.FirstName, $rootScope.LastName, $rootScope.Pictures, $rootScope.TelNum, $rootScope.Email);
    //console.log(Patient.getFirstName());
    //var setNameFunction= Patient.setFirstName('as');
    $scope.closeAlert = function () {
   
        $rootScope.showAlert=false;
    };
    var updatedField=null;
    //setTimeout(function () {
    //    $scope.$apply(function () {
        
        function loadInfo(){
                var UserData=UpdateUI.UpdateUserFields();
                UserData.then(function(dataValues){
                    $timeout(function(){
                            $scope.FirstName = Patient.getFirstName();
                            $scope.LastName = Patient.getLastName();
                            $scope.Email = Patient.getEmail();
                            $scope.TelNum = Patient.getTelNum();
                            $scope.smsPreference=UserPreferences.getEnableSMS();
                            $scope.Language=UserPreferences.getLanguage();
                            $scope.passwordLength=(window.localStorage.getItem('pass')).length;
                        });
                    
                },function(error){
                    console.log(error);
                });
        };


         $scope.load2 = function($done) {
        RequestToServer.sendRequest('Refresh');
          $timeout(function() {
            loadInfo();
                $done();
                
          }, 2000);
        };
    $scope.passFill='********';
    $scope.mobilePlatform=(ons.platform.isIOS()||ons.platform.isAndroid());

    $scope.editingDiv = {
        //editFirstNameDiv: false,
        //editLastNameDiv: false,
        editEmailDiv: false,
        editTelNumDiv: false,
        editLanDiv: false,
        editPasswordDiv: false,
        editSMSDiv:false

    };

    function printError(error) {
        console.log(error);
    }
    $scope.hideSectionsBut = function (onlyDivToShow) {
        for (var div in $scope.editingDiv) {
            if (div !== onlyDivToShow) {
                //console.log($scope.editingDiv[div]);
                $scope.editingDiv[div] = false;

            }

        }
    };
    var nativeCalendar=window.localStorage.getItem('NativeCalendar');
    (nativeCalendar)?$scope.checkboxModelCalendar=nativeCalendar:$scope.checkboxModelCalendar=0;
    $scope.checkboxModel=UserPreferences.getEnableSMS();
    $scope.FirstName = Patient.getFirstName();
    $scope.LastName = Patient.getLastName();
    $scope.Email = Patient.getEmail();
    $scope.TelNum = Patient.getTelNum();
    $scope.Language=UserPreferences.getLanguage();
    if((window.localStorage.getItem('pass')).length>7){
        $scope.passwordLength=7;
    }else{
        $scope.passwordLength=window.localStorage.getItem('pass').length;
    }
    $scope.saveSettings=function(option){
        if($scope.mobilePlatform){
            var message=''
            if(option==='EnableSMS'){
                if($scope.checkboxModel===1){
                    message='Would you like to enable your SMS messaging notifications?';
                }else{
                    message='Would you like to disable your SMS messaging notifications?';
                }
                navigator.notification.confirm(message, confirmCallbackSMS, 'Language Setting', ['Continue', 'Cancel'] );
                function confirmCallbackSMS(index){
                    console.log(index);
                    if(index==1){
                        var objectToSend={};
                        objectToSend.FieldToChange='EnableSMS';
                        objectToSend.NewValue=$scope.checkboxModel;
                        UserPreferences.setEnableSMS(objectToSend.NewValue);
                        RequestToServer.sendRequest('AccountChange',objectToSend);


                    }else{
                        $timeout(function(){
                            ($scope.checkboxModel==1)?$scope.checkboxModel=0:$scope.checkboxModel=1;
                        });
                    }
                }
            }else if(option==='Calendar'){
                if($scope.checkboxModelCalendar===1){
                    message='Would you like save your appointment schedule in your phone calendar?';
                }else{
                    message='Would you like to disable your SMS messaging notifications?';
                }
                navigator.notification.confirm(message, confirmCallbackCalendar, 'Calendar Setting', ['Continue', 'Cancel'] );
                function confirmCallbackCalendar(index){
                    console.log(index);
                    if(index==1){
                        window.localStorage.setItem('NativeCalendar',$scope.checkboxModelCalendar);
                    }else{
                        $timeout(function(){
                            ($scope.checkboxModelCalendar==1)?$scope.checkboxModelCalendar=0:$scope.checkboxModelCalendar=1;
                        })
                    }
                }
                
            }
        }else{
             if(option==='EnableSMS'){
                var objectToSend={};
                objectToSend.FieldToChange='EnableSMS';
                objectToSend.NewValue=$scope.checkboxModel;
                UserPreferences.setEnableSMS(objectToSend.NewValue);
                RequestToServer.sendRequest('AccountChange',objectToSend); 
            }
        }

    };
   // console.log($scope.Language);
   // console.log($scope.smsPreference);
    $scope.changeField = function (fieldToChange) {
        console.log(fieldToChange);
        if (fieldToChange === 'Password' || fieldToChange === 'Email') {
            var ref = new Firebase("https://luminous-heat-8715.firebaseio.com");
            if (fieldToChange === 'Password') {
                changePassword();
            } else {
                changeEmail();

            }
           

        }else{
                function alertDismissed() {
    // do something
  }

  navigator.notification.alert(
     'You are the winner!',  // message
     alertDismissed,         // callback
      'Game Over',            // title
      'Done'                  // buttonName
  );
    //console.log(Patient.FirstName);
    // Patient.setFirstName('david');
   // console.log(Patient.getFirstName());

        }
    };


//Auxiliary functions to change the respective sections
    
}]);



myApp.controller('ChangingSettingController',function(tmhDynamicLocale, $translate, UserPreferences,Patient,RequestToServer,$scope,$timeout,UpdateUI, UserAuthorizationInfo){

    accountChangeSetUp();

    function accountChangeSetUp(){
    var page = myNavigatorAccount.getCurrentPage();
    var parameters=page.options.param;
    $scope.alertClass="bg-success updateMessage-success";
    $scope.value=parameters;
    $scope.personal=true;
    $scope.type1='text';
    $scope.updateMessage='Your '+ $scope.value+' has been updated!';
    if(parameters==='First Name'){
        $scope.newValue=Patient.getFirstName();
        $scope.instruction='Enter your new first name:'
    }else if(parameters==='Last Name'){
        $scope.newValue=Patient.getLastName();
        $scope.instruction='Enter your new last name:'
    }else if(parameters==='Tel. Number'){
        $scope.newValue=Patient.getTelNum();
        $scope.instruction='Enter your new telephone number:'
    }else if(parameters==='Email'){
        $scope.type1='email';
        $scope.type2='password';
        $scope.newValue='';
        $scope.oldValue='';
        $scope.placeHolder='Enter your Password';
        $scope.instruction='Enter your new email address:'
        $scope.instructionOld='Enter your password:'
    }else if(parameters==='Password'){
        $scope.type1='password';
        $scope.type2='password';
        $scope.newValue='';
        $scope.oldValue='';
        $scope.placeHolder='Enter your old '+$scope.value;
        $scope.instruction='Enter your new password:'
        $scope.instructionOld='Enter your old password:'
    }else if(parameters==='Language'){
        var value=UserPreferences.getLanguage();
        $scope.instruction==='Select language:'
        $scope.personal=false;
        $scope.pickOption=value;
        $scope.firstOption='EN';
        $scope.secondOption='FR';
    }
}

    $scope.updateValue=function(val){
        if(val=='Password'){
            changePassword();
        }else if(val=='Email'){
            changeEmail();
        }else{
            objectToSend={};
            valChange=val.replace(' ','');
            if(val=='Tel. Number'){
                valChange=valChange.substring(0,7);
                objectToSend.FieldToChange=valChange;
            }else{
                objectToSend.FieldToChange=val;
            }

            objectToSend.NewValue=$scope.newValue;
            RequestToServer.sendRequest('AccountChange',objectToSend);
            RequestToServer.sendRequest('Refresh');
            
            $timeout(function(){

                $scope.newUpdate=true;
                UpdateUI.UpdateUserFields();
            },2000);
        }
    };
    $scope.changeLanguage=function(val){
        console.log(val);
        var objectToSend={};
        objectToSend.NewValue=val;
        objectToSend.FieldToChange='Language';
        RequestToServer.sendRequest('AccountChange',objectToSend);
        RequestToServer.sendRequest('Refresh');
        UserPreferences.setLanguage(val);
        if(val==='EN'){
            tmhDynamicLocale.set('en');
            $translate.use('en');
        }else{
            tmhDynamicLocale.set('fr');
            $translate.use('fr');
        }
        $scope.newUpdate=true;
        
    };


    function changePassword() {
        var ref = new Firebase("https://luminous-heat-8715.firebaseio.com");

            ref.changePassword({
                email: Patient.getEmail(),
                oldPassword: $scope.oldValue,
                newPassword: $scope.newValue
            }, function (error) {
                if (error) {
                    switch (error.code) {
                        case "INVALID_PASSWORD":
                            $timeout(function(){
                                $scope.alertClass="bg-danger updateMessage-error";
                                $scope.newUpdate=true;
                                $scope.updateMessage='Password is invalid!';
                            });
                            console.log("The specified user account password is incorrect.");
                            break;
                        default:
                            $timeout(function(){
                                $scope.alertClass="bg-danger updateMessage-error";
                               $scope.newUpdate=true;
                               $scope.updateMessage='Error changing your Password!';
                            });
                            
                            console.log("Error changing password:", error);
                    }
                } else {
                    var objectToSend={};
                    objectToSend.FieldToChange='Password';
                    objectToSend.NewValue=$scope.newValue;
                    RequestToServer.sendRequest('AccountChange',objectToSend);
                    RequestToServer.sendRequest('Refresh');
                    UserAuthorizationInfo.setPassword($scope.newValue);
                    $timeout(function(){
                        UpdateUI.UpdateUserFields().then(function(){
                            $scope.updateMessage='User password was successfully changed!';
                            $scope.newUpdate=true;
                        }); 
                    },2000);
                    console.log("User password changed successfully!");
                }
            });
    }

    function changeEmail() {
        var ref = new Firebase("https://luminous-heat-8715.firebaseio.com");
        
        ref.changeEmail({
            oldEmail: Patient.getEmail(),
            newEmail: $scope.newValue,
            password: $scope.oldValue
        }, function (error) {
            if (error) {
                  $timeout(function(){
                   $scope.alertClass="bg-danger updateMessage-error";
                   $scope.newUpdate=true;
                   $scope.updateMessage='Password is not correct!';
                });      
                console.log("Error changing email:", error);
            } else {
                var objectToSend={};
                objectToSend.FieldToChange='Email';
                objectToSend.NewValue=$scope.newValue;
                Patient.setEmail($scope.newValue);
                RequestToServer.sendRequest('AccountChange',objectToSend);
                RequestToServer.sendRequest('Refresh');
                $timeout(function(){
                    UpdateUI.UpdateUserFields().then(function(){
                        $scope.updateMessage='User email was successfully updated!';
                        $scope.newUpdate=true;
                    }); 
                },2000);
            }
        });
    }

});