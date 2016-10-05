var app=angular.module('adminPanelApp');

app.service('Messages',function(api,$http, $q, $rootScope,$filter,AllPatients, User,URLs){
   function findPatientConversationIndexBySerNum(array,serNum){
      for (var i = 0; i < array.length; i++) {
        if(array[i].PatientSerNum==serNum){
          return i;
        }
      }
    }
 	return{
 		getMessagesFromServer:function(){
 			var r=$q.defer();
 			var userDoctor=$rootScope.currentUser.DoctorSerNum;
    		var userAdmin=$rootScope.currentUser.AdminSerNum;
    		patientsURL='';
    		if(userDoctor){
		       	patientsURL=URLs.getMessagesUrl()+"?DoctorSerNum="+userDoctor;
            console.log(patientsURL);
		    }else if(userAdmin){
		       	patientsURL=URLs.getMessagesUrl()+"?AdminSerNum="+userAdmin;
		       	console.log(patientsURL);
		    }
	 		$http.get(patientsURL).success(function(response)
	      	{
	        if (response == 'No Users!')
	        {
            console.log(response);
            r.resolve('No Messages Found');

	         }else if(response=='No parameters set!'){
            console.log(response);
            r.reject('Incorrect Parameters');
	         }else{
            r.resolve(response);
           }
	      });
      return r.promise;
    },
    findPatientConversationIndexBySerNum:  function (serNum){
       for (var i = 0; i < this.UserConversationsArray.length; i++) {
         if(this.UserConversationsArray[i].PatientSerNum==serNum){
           return i;
         }
       }
     },
    setMessages:function (messages){
      console.log(messages);
        var userDoctor=$rootScope.currentUser.DoctorSerNum;
        var userAdmin=$rootScope.currentUser.AdminSerNum;
        var UserTypeSerNum;
        var userRole;
        if(userDoctor){
          UserTypeSerNum=userDoctor;
          userRole='Doctor';
         }else if(userAdmin){
          UserTypeSerNum=userAdmin;
          userRole='Admin';
         }

        this.UserConversationsArray = [];
         $rootScope.NumberOfNewMessages=0;
         if (messages === undefined) return -1;
        //Iterating through each conversation
        this.ConversationsObject={};
        var keysArray = Object.keys(messages);
        var patients=AllPatients.getPatients();
        console.log(patients);
        for (var i = 0; i < patients.length; i++) {
            var conversation={}
            var partnerSerNum=patients[i].PatientSerNum;
            var key='Patient:'+partnerSerNum;
            console.log(key);
            console.log(patients[i]);
            conversation.PatientSerNum=partnerSerNum;
            conversation.ConversationPartnerFirstName=patients[i].FirstName;
            conversation.ConversationPartnerLastName=patients[i].LastName;
            conversation.Messages=[];
            conversation.DateOfLastMessage=null;
            conversation.EmptyConversation=true;
            conversation.ReadStatus=1;
            conversation.Role='Patient';
            conversation.PatientId=patients[i].PatientId;
            conversation.AriaSer=patients[i].PatientAriaSer;
            this.ConversationsObject[key]=conversation;
        };
        console.log(this.ConversationsObject);
        console.log(messages);
        if(messages!=='No Messages Found'){
          for (var i = 0; i < keysArray.length; i++) {
              var Message={};
              var message=messages[keysArray[i]];
              if(messages[i].ReceiverRole==userRole&&messages[i].ReceiverSerNum==UserTypeSerNum)
              {
                partnerSerNum=message.SenderSerNum;
                key=message.SenderRole+':'+message.SenderSerNum;
                Message.Role=0;
                Message.MessageContent=message.MessageContent;
                Message.Date=new Date(message.MessageDate);
                console.log(message.ReadStatus);
                Message.ReadStatus=parseInt(message.ReadStatus);
                Message.MessageSerNum=message.MessageSerNum;
                this.ConversationsObject[key].EmptyConversation=false;
                this.ConversationsObject[key].Messages.push(Message);

              }else{
                partnerSerNum=message.ReceiverSerNum;
                key=message.ReceiverRole+':'+message.ReceiverSerNum;
                Message.Role=1;
                Message.MessageContent=message.MessageContent;
                Message.Date=new Date(message.MessageDate);
                Message.ReadStatus=1;
                Message.MessageSerNum=message.MessageSerNum;
                this.ConversationsObject[key].EmptyConversation=false;
                this.ConversationsObject[key].Messages.push(Message);
              }
          }
          var keysArrayConvo = Object.keys(this.ConversationsObject);
          for (var i = 0; i < keysArrayConvo.length; i++) {
              this.ConversationsObject[keysArrayConvo[i]].Messages=$filter('orderBy')(this.ConversationsObject[keysArrayConvo[i]].Messages,'Date',false);

              if(this.ConversationsObject[keysArrayConvo[i]].Messages[this.ConversationsObject[keysArrayConvo[i]].Messages.length-1]!==undefined){
                  this.ConversationsObject[keysArrayConvo[i]].DateOfLastMessage=this.ConversationsObject[keysArrayConvo[i]].Messages[this.ConversationsObject[keysArrayConvo[i]].Messages.length-1].Date;
                  this.ConversationsObject[keysArrayConvo[i]].ReadStatus=this.ConversationsObject[keysArrayConvo[i]].Messages[this.ConversationsObject[keysArrayConvo[i]].Messages.length-1].ReadStatus;
                  if(this.ConversationsObject[keysArrayConvo[i]].ReadStatus===0){
                      $rootScope.NumberOfNewMessages+=1;
                  }
              }
              this.UserConversationsArray.push(this.ConversationsObject[keysArrayConvo[i]]);


          };
          console.log(this.UserConversationsArray);
        }else{
          var objectKeys=Object.keys(this.ConversationsObject);
          for (var i = 0; i < objectKeys.length; i++) {
            this.UserConversationsArray.push(this.ConversationsObject[objectKeys[i]]);
          }
        }


        return this.UserConversationsArray;


    },
    getMessages:function(){
        return this.UserConversationsArray;
    },
    readConversation:function(conversationNumber)
    {
      for (var i = this.UserConversationsArray[conversationNumber].Messages.length - 1; i >= 0; i--) {
        if(this.UserConversationsArray[conversationNumber].Messages[i].ReadStatus==0)
        {
          this.UserConversationsArray[conversationNumber].Messages[i].ReadStatus=1;
          api.getFieldFromServer(URLs.readMessageUrl(),{MessageSerNum:this.UserConversationsArray[conversationNumber].Messages[i].MessageSerNum}).then(
          function(response){
            console.log('Messages Read');
          });
      };
        }

    },
    sendMessage:function(content, patientSerNum, dateOfmessage){
      var r=$q.defer();
      var objectToSend={};
      objectToSend.MessageContent=content;
      objectToSend.MessageDate=$filter('date')(dateOfmessage,'yyyy-MM-dd HH:mm:ss');;
      objectToSend.ReceiverReadStatus=0;
      objectToSend.SenderRole=User.getUserRole();
      objectToSend.SenderSerNum=User.getUserTypeSerNum();
      objectToSend.ReceiverRole='Patient';
      objectToSend.ReceiverSerNum=patientSerNum;
      objectMessage={};
      objectMessage.Role='1';
      objectMessage.Date=dateOfmessage;
      objectMessage.MessageContent=content;
      objectMessage.ReadStatus=1;

      var indexConvo=findPatientConversationIndexBySerNum(this.UserConversationsArray , patientSerNum);
      this.UserConversationsArray[indexConvo].Messages.push(objectMessage);
      var req = {
       method: 'POST',
       url: URLs.getSendMessageUrl(),
       headers: {
         'Content-Type': undefined
       },
       data: objectToSend
      }

      $http(req).then(function(data){
        if(data=='MessageSent'){
          console.log(data);
        }

      }, function(error){
        console.log(error);
      });
    }

};


 });
 
