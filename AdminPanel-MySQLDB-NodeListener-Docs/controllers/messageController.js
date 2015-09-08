app.controller('messagesController',['Upload','$scope','$http','$rootScope','$timeout',function(Upload,$scope,$http,$rootScope,$timeout)
{
  /**
  * @ngdoc controller
  * @name AdminPanel.controller:messagesController
  @requires $http
  @requires $rootScope
  @requires $scope
  @requires $timeout
  @requires Upload
  * @description
  * Controller for the messaging view.
  */
      $scope.WantToSend=false;

      $scope.ToggleFiles = function ()
      {
        /**
       * @ngdoc method
       * @name ToggleFiles
       * @methodOf AdminPanel.controller:messagesController
       * @description
       * Sets the value of $scope.WantToSend to false if its true and vice versa.
       * @returns {String} $scope.WantToSend
       */
        $scope.WantToSend=!$scope.WantToSend;
      }
      $scope.SendFile = function(file)
      {
        /**
       * @ngdoc method
       * @name SendFile
       * @methodOf AdminPanel.controller:messagesController
       * @description
       * Sends a message with an attachment to MySQL with a POST request (using the Upload service ).The attachment is saved to 'PatientFiles/^patientsernum^/Attachment', It then adds the new message to the Conversations inside the scope.
       * @param {Object} file file selected by user
       * @returns {String} $scope.errorMsg
       */
          if (!$scope.newMessage) { $scope.newMessage = " ";}
          var messageArray=[ $rootScope.Admin.AdminSerNum, $scope.currentConversation, $scope.newMessage ];
          console.log(messageArray);
          file.upload = Upload.upload({
            url: 'http://localhost/devDocuments/mehryar/qplus/php/SendFile.php',
            method: 'POST',
            headers: {
              'my-header': 'my-header-value'
            },
            sendFieldsAs: 'form',
            fields: {
        'message':messageArray } ,
            file: file,
            fileFormDataName: 'file'
          });

          file.upload.then(function (response) {
            $timeout(function () {
              file.result = response.data;
              var RecentMessage={'MessageContent':$scope.newMessage , 'MessageDate': "Now" , 'SenderRole':"Admin",Attachment:"PatientFiles/"+$scope.currentConversation+"/Attachments/"+file[0].name,'PatientFirstName':$scope.Conversations[$scope.currentConversation][0].PatientFirstName};
              $scope.newMessage="";
              length=$scope.Conversations[$scope.currentConversation].length;
              //console.log($scope.Conversations[$scope.currentConversation]);
              $scope.Conversations[$scope.currentConversation][length]=RecentMessage;
            });
          }, function (response)
          {
            if (response.status > 0)
              $scope.errorMsg = response.status + ': ' + response.data;
          });

          file.upload.progress(function (evt) {
            // Math.min is to fix IE which reports 200% sometimes
            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
          });
          }
          $scope.FindPatient = function ()
            {
              /**
             * @ngdoc method
             * @name FindPatient
             * @methodOf AdminPanel.controller:messagesController
             * @description
             * looks for patient in the MySQL database based on last name and saves it to the $scope. This method is used to then create a new conversation with an arbitrary patient.
             * @returns {Object} $scope.Patients
             */
              var patientURL="http://localhost/devDocuments/mehryar/qplus/php/MySQLFind.php?";
              if ($scope.LastName)
              {
                patientURL=patientURL+"LastName='"+$scope.LastName+"'";
              }
              $http.get(patientURL).success(function(response)
              {
                  if (response!=="PatientNotFound" && response!=='' )
                  {
                    $scope.patientFound=true;
                    $scope.Patients=response;
                   } else
                   {
                    $scope.alerts={};
                    $scope.alerts['foundAlert']={message : "Doesn't exist!", type:'danger' };
                    $scope.patientFound=false;
                   }
                });

              };
    $scope.GetMessages = function ()
    {
      /**
     * @ngdoc method
     * @name GetMessages
     * @methodOf AdminPanel.controller:messagesController
     * @description
     * Saves all messages relevant to the current administrator to the $scope. It then sorts them into different conversations between admin and each individual user.
     * @returns {String} $scope.Conversations
     */
      $http.get("http://localhost/devDocuments/mehryar/qplus/php/GetMessages.php?Username='"+$rootScope.currentUser+"'").success(function(response)
      {
        if (response !== "NoMessageFound")
        {
          $scope.Messages=response;
          $scope.Conversations={};
          // Divide messages into conversations with individual patients
          for ( var message in $scope.Messages )
          {
            // One participant of each conversation is the admin himself , Who's the other one?
            var Patient="";
            var length=0;
            if ($scope.Messages[message].ReceiverRole=="Patient")
            {
              Patient=$scope.Messages[message].ReceiverSerNum;
            }
            else if ($scope.Messages[message].SenderRole=="Patient")
            {
              Patient=$scope.Messages[message].SenderSerNum;
            }
            else { break; }
            if ( !$scope.Conversations[Patient])
            {
              $scope.Conversations[Patient]=new Array();
              $scope.Conversations[Patient][0]=$scope.Messages[message];
            }
            else
            {
              length=$scope.Conversations[Patient].length;
              $scope.Conversations[Patient][length]=$scope.Messages[message];
            }
          }
          if ( !$scope.currentConversation ) {$scope.currentConversation=Object.keys($scope.Conversations)[0];}
        }
      });
    };
    $scope.GetMessages();
    $scope.SetCurrentConversation = function (key)
    {
      /**
     * @ngdoc method
     * @name SetCurrentConversation
     * @methodOf AdminPanel.controller:messagesController
     * @description
     * Sets the current conversation's key to the $scope.
     * @param {Integer} key key of the a conversation in $scope.Conversations which is equal to patient's patientsernum. It makes use of the ReadMessages method.
     * @returns {String} $scope.currentConversation
     */
      $scope.currentConversation=key;
      $scope.ReadMessages(key);
    };
    $scope.NewConversation = function (patient)
     {
       /**
      * @ngdoc method
      * @name NewConversation
      * @methodOf AdminPanel.controller:messagesController
      * @description
      * Creates a new conversation and sets the $scope.currentConversation afterwards or if the  conversation with that patient already exists. Makes use of SetCurrentConversation method.
      * @param {Object} patient Object containing patient's general information.
      */
         var patientsernum=patient.PatientSerNum;
         if ($scope.patientFound)
         {

         if ( !$scope.Conversations[patientsernum])
         {
           $scope.Conversations[patientsernum]=new Array();
           $scope.Conversations[patientsernum][0]={'PatientFirstName':patient.FirstName , 'PatientLastName':patient.LastName}
           $scope.SetCurrentConversation(patientsernum);
           $scope.patientFound=false;
         }
         else
         {
           $scope.SetCurrentConversation(patientsernum);
           $scope.patientFound=false;
         }
     }
    };
    $scope.SendMessage = function ()
    {
      /**
     * @ngdoc method
     * @name SendMessage
     * @methodOf AdminPanel.controller:messagesController
     * @description
     * Sends a new message to the messages table in MySQL database. It also adds it to the $scope.Conversations locally.
     */
      $http.get("http://localhost/devDocuments/mehryar/qplus/php/SendMessage.php?SenderSerNum="+$rootScope.Admin.AdminSerNum+"&ReceiverSerNum="+$scope.currentConversation+"&MessageContent="+$scope.newMessage).success(function(response)
      {
        if ( response=="MessageSent")
        {
          var RecentMessage={'MessageContent':$scope.newMessage , 'MessageDate': "Now" , 'SenderRole':"Admin",'PatientFirstName':$scope.Conversations[$scope.currentConversation][0].PatientFirstName};
          $scope.newMessage="";
          length=$scope.Conversations[$scope.currentConversation].length;
          //console.log($scope.Conversations[$scope.currentConversation]);
          $scope.Conversations[$scope.currentConversation][length]=RecentMessage;
        }
      });
    };
    $scope.ReadMessages = function (currentconversation)
    {
      /**
     * @ngdoc method
     * @name ReadMessages
     * @methodOf AdminPanel.controller:messagesController
     * @description
     * Sets the ReadStatus of all of messages in the selected conversation to read.
     * @param {Integer} currentconversation key of the selected conversation in $scope.Conversations.
     * @returns {String} message.ReadStatus
     */
      for (var message in $scope.Conversations[currentconversation])
      {
        if (message.SenderRole=="Patient" && message.ReadStatus=="0")
        {
          $http.get("http://localhost/devDocuments/mehryar/qplus/php/ReadMessage.php?MessageSerNum='"+message.MessageSerNum+"'").success(function(response)
          {
            if (response=='MessageRead') {message.ReadStatus=="1";}
          });
        }
      }
    };

}]);
