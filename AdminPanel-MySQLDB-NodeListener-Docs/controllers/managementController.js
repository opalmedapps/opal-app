app.controller('managementCtrl',function($scope,$http,$rootScope)
{
  /**
  * @ngdoc controller
  * @name AdminPanel.controller:managementController
  @requires $http
  @requires $rootScope
  @requires $scope
  * @description
  * Controller for the patient manager view.
  */
//  $scope.alerts={foundAlert:{message:'',type:''} , removeAlert:{message:'',type:''}};
      $scope.ChangeValue= function(key)
      {
        /**
       * @ngdoc method
       * @name ChangeValue
       * @methodOf AdminPanel.controller:managementController
       * @description
       * Changes the specified column by prompting user to enter the new value. Uses the $scope.FindPatient method to refresh the patient info after the change has been made.
       * @param {String} key The name of the column whose value is going to be changed in MySQL.
       * @returns {String} $scope.message
       */
        if (key=="Language" || key=="Alias" || key=="EnableSMS" || key=="FirstName" || key=="LastName" || key=="PatientId" || key=="TelNumForSMS" || key=="SSN")
        {
          var question="Please enter the new value : ";
          if (key=="Language") { question="Please enter the new value (EN,FR,SN):";}
          var newValue=prompt(question);
          if(newValue)
          {
            var changeURL="http://localhost/devDocuments/mehryar/qplus/php/ChangeValue.php?fieldToChange='"+key+"'&newValue='"+newValue+"'&PatientSerNum='"+$scope.PatientInfo[0].PatientSerNum+"'";
            console.log(changeURL);
            $http.get(changeURL).success(function(response)
            {
              if (response=="Success")
              {
                alert("Value changed successfully!");
              }
              else
              {
                alert("There was a problem with your request. Please contact the administrator.");
              }
              $scope.FindPatient();
            });
          }
        }
        else
        {
          alert("This field can't be changed manually!");
        }
      };
      $scope.FindPatient= function ()
        {
          /**
         * @ngdoc method
         * @name FindPatient
         * @methodOf AdminPanel.controller:managementController
         * @description
         * Finds the patient based on last name or patient ID number or both and saves different relevant information for that patient to $scope.
         * @returns {Object} $scope.Doctors
         * @returns {Object} $scope.PatientInfo
         * @returns {Object} $scope.Activities
         * @returns {Object} $scope.Appointments
         * @returns {Object} $scope.alerts['foundAlert']
         */
          var patientURL="http://localhost/devDocuments/mehryar/qplus/php/MySQLFind.php?";
          var doctorURL="http://localhost/devDocuments/mehryar/qplus/php/GetDoctors.php?";
          var activityURL="http://localhost/devDocuments/mehryar/qplus/php/GetActivities.php?";
          var appointmentURL="http://localhost/devDocuments/mehryar/qplus/php/GetAppointments.php?";
          if ($scope.LastName)
          {
            patientURL=patientURL+"LastName='"+$scope.LastName +"'&";
            doctorURL=doctorURL+"LastName='"+$scope.LastName +"'&";
            activityURL=activityURL+"LastName='"+$scope.LastName +"'&";
            appointmentURL=appointmentURL+"LastName='"+$scope.LastName +"'&";
          }
          if ($scope.PatientId)
          {
            patientURL=patientURL+"PatientId='"+$scope.PatientId+"'&";
            doctorURL=doctorURL+"PatientId='"+$scope.PatientId+"'&";
            activityURL=activityURL+"PatientId='"+$scope.PatientId +"'&";
            appointmentURL=appointmentURL+"PatientId='"+$scope.PatientId +"'&";
          }
          //First Async Call for basic patientinfo
          $http.get(patientURL).success(function(response)
          {
              if (response!=="PatientNotFound" && response!=='' )
              {
                $scope.alerts={};
                $scope.patientFound=true;
                $scope.PatientInfo=response;
                $scope.alerts['foundAlert']={message: "Patient Found : "+$scope.PatientInfo[0].LastName+" ,"+$scope.PatientInfo[0].FirstName ,type: 'success'}
                //Second Async Call for patient's doctors
                $http.get(doctorURL).success(function(response)
                {
                  $scope.Doctors=response;
                  //Third Async Call for patient activity log
                  $http.get(activityURL).success(function(response)
                  {
                    $scope.Activities=response;
                    $http.get(appointmentURL).success(function(response)
                    {
                      $scope.Appointments=response;
                    });
                  });
                });
               } else {
                $scope.alerts={};
                $scope.alerts['foundAlert']={message : "Patient was not found in the database", type:'danger' };
                $scope.patientFound=false;
               }
            });

          };
    $scope.RemoveUser=function()
      {
        /**
       * @ngdoc method
       * @name RemoveUser
       * @methodOf AdminPanel.controller:managementController
       * @description
       *  Removes the currently found user's account from MySQL patient table by using the patient Patient ID number.
       * @returns {Object} $scope.alerts['removeAlert']
       */
        var areYouSure=confirm("Removing a patient from the Qplus database will cancel their account and remove most of their information, Do you wish to proceed?");
        if (areYouSure)
         {
            var RemoveURL="http://localhost/devDocuments/mehryar/qplus/php/RemoveUser.php?PatientId="+$scope.PatientId;
            $http.get(RemoveURL).success(function (response){
              $scope.alerts.removeAlert.message=response;
              if  (response=='Patient was successfully removed.')
              {
              $scope.alerts.removeAlert.type='success';
            } else
            {
                $scope.alerts.removeAlert.type='danger';
            }
            });
        }
      };
});
