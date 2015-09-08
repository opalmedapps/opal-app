app.controller('registerCtrl',['$scope','$http', function($scope,$http){
  /**
  * @ngdoc controller
  * @name AdminPanel.controller:registerCtrl
  * @requires $http
  * @requires $scope
  * @description
  * Controller for the patient registration view.
  */
  $scope.message=" "
  $scope.patientFound=false;
  $scope.FindPatient= function (ssn) {
    /**
   * @ngdoc method
   * @name FindPatient
   * @methodOf AdminPanel.controller:registerCtrl
   * @description
   * .Looks for the patient in the ARIA database based on it's Medicare SSN number.It resets the form values to empty if patient is found and sets the $scope.patientFound to true.
   * @param {Object} ssn Patient's SSN
   * @returns {String} $scope.patientFound
   */
     if ($scope.SSN.length>11){
        var msURL="http://localhost/devDocuments/mehryar/qplus/php/FindPatient.php?PatientSSN="+ssn;
        $http.get(msURL).success(function(response){
          $scope.ariaResponse=response
            });
        if ($scope.ariaResponse!=="PatientNotFound" ) {
          $scope.Alias="";
          $scope.message = " ";
          $scope.Email="";
          $scope.EmailConfirm="";
          $scope.PasswordConfirm="";
          $scope.TelNumForSMS="";
          $scope.patientFound=true;
          var PatientSSN=$scope.SSN;
          $scope.Language="EN";
         } else {
          $scope.message = "SSN was not found!\n please consult the reception.";
          $scope.patientFound=false;
         }
      }else {
       $scope.patientFound=false;
       $scope.message="SSN is invalid ! ";
      }

  };
  $scope.Register=function()
  {
    /**
   * @ngdoc method
   * @name Register
   * @methodOf AdminPanel.controller:registerCtrl
   * @description
   * .Creates and account in firebase and MySQL for the patient with the information provided in the HTML form.
   * @returns {String} $scope.message
   */
    if ($scope.Email!==$scope.EmailConfirm) { $scope.message ="The email addresses that you entered don't match!";}
    else if ($scope.Password !== $scope.PasswordConfirm ) {$scope.message="Passwords don't match!" ; }
    else if ($scope.TelNumForSMS && $scope.TelNumForSMS.length < 10 ) { $scope.message = "Phone number is not valid! must be at least 10 digits." ;}
    else {
      $scope.message=" ";
      //Register to FireBase
            var FB=new Firebase("https://luminous-heat-8715.firebaseio.com/");
            FB.createUser({
              email : $scope.Email,
              password: $scope.Password
            },function(error,userData)
            {
                          if (error)
                          {
                            switch(error.code){
                            case "EMAIL_TAKEN": $("#firebaseError").empty();
                            $(document).ready(function(){
                                $("#firebaseError").append("<p class='bg-danger'>Email is already registered !</p>");
                                });
                            break;
                            case "INVALID_EMAIL": $("#firebaseError").empty();
                            $(document).ready(function(){
                                $("#firebaseError").append("<p class='bg-danger'>Email is not valid!</p>");
                                });
                            break;
                            default :
                            $("#firebaseError").empty();
                            $(document).ready(function()
                            {
                                $("#firebaseError").append("<p class='bg-danger'>An Error occured while creating user: </p>");
                            });
                            }
                          } else {
                                  // Register to MySQL
                                  var EnableSMS=0;
                                  if ($scope.TelNumForSMS) { EnableSMS=1;}
                                  $scope.myURL="http://localhost/devDocuments/mehryar/qplus/php/MysqlRegister.php?PatientSerNum="
                                  +$scope.ariaResponse[0]["PatientSerNum"]+"&PatientId="+PatientID+"&FirstName="+$scope.PatientFirstName+"&LastName="
                                  +$scope.PatientLastName+"&TelNumForSMS="+$scope.TelNumForSMS+"&Email="+$scope.Email+"&loginID="+userData.uid+"&Password="+$scope.Password
                                  +"&Language="+$scope.Language+"&Diagnosis="+Diagnosis+"&PatientSSN="+PatientSSN+"&Alias="+$scope.Alias+"&EnableSMS="+EnableSMS ;
                                  $http.get($scope.myURL).success( function(result)
                                  {
                                  $scope.message=result;
                                  //Send Confirmation SMS and Email with a $http request to SP
                                  });
                              }
                  });
                          }
                        }
                      }]);
