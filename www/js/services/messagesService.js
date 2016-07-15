var myApp=angular.module('MUHCApp');
/**
*@ngdoc service
*@name MUHCApp.services:UserMessages
*@requires $filter
*@requires MUHCApp.service:UserAuthorizationInfo
*@description Service deals with patient/doctor messaging portal, parses Firebase object into the appropiate format
*             and defines methods for sending messages back to Firebase.
**/
myApp.service('Messages', ['$filter', 'UserAuthorizationInfo', 'Patient', 'Doctors','$rootScope','LocalStorage', function($filter, UserAuthorizationInfo, Patient,Doctors,$rootScope,LocalStorage){
/**
*@ngdoc property
*@name  UserConversationsArray
*@propertyOf MUHCApp.services:Messages
*@description Contains all the conversations for the User, UserConversationsArray[0] contains the first conversation.
*
**/
/**
*@ngdoc property
*@name  UserMessagesLastUpdated
*@propertyOf MUHCApp.services:UserMessages
*@description Date of the last message.
*
**/
var UserConversationsArray=[];
var messagesLocalStorage=[];
    return {
        /**
        *@ngdoc method
        *@name MUHCApp.UserMessages#setUserMessages
        *@methodOf MUHCApp.services:UserMessages
        *@description Parses message into right format, parses Date of messages to a Javascript date, organizes the messages in coversation in chronological order,
        then instatiates UserMessages property UserConversationsArray and lastly instiates UserMessages property
        *UserMessagesLastUpdated
        *@param {string} messages {@link MUHCApp.services:UpdateUI UpdateUI} calls setUserMessages with the object Message obtained from the Firebase user fields.
        **/
        setUserMessages:function(messages){

            //Initializing the array of conversations

             UserConversationsArray = [];
             this.ConversationsObject={};
             $rootScope.NumberOfNewMessages=0;
            //Iterating through each conversation
            var keysArray =[];
            if(messages!==undefined)
            {
              keysArray = Object.keys(messages);
            }else{
              this.emptyMessages=true;
            }
            var doctors=Doctors.getContacts();
            for (var i = 0; i < doctors.length; i++) {
                var conversation={};
                if(typeof doctors[i].ProfileImage!=='undefined'&&doctors[i].ProfileImage!=='')
                {
                  conversation.Image=doctors[i].ProfileImage;
                }else{
                  conversation.Image='./img/doctor.png';
                }
                conversation.MessageRecipient=doctors[i].FirstName+' '+ doctors[i].LastName;
                conversation.Messages=[];
                conversation.ReadStatus=1;
                conversation.Role='Doctor';
                conversation.UserSerNum=doctors[i].DoctorSerNum;
                this.ConversationsObject[doctors[i].DoctorSerNum]=conversation;
            };
            for (var i = 0; i < keysArray.length; i++) {
                var Message={};
                var message=angular.copy(messages[i]);
                delete messages[i].Attachment;
                messagesLocalStorage.push(messages[i]);

                if(message.SenderSerNum==Patient.getUserSerNum()){
                    Message.Role='1';
                    Message.MessageContent=message.MessageContent;
                    Message.Date=$filter('formatDate')(message.MessageDate);
                    Message.ReadStatus=1;
                    Message.MessageSerNum=message.MessageSerNum;
                    this.ConversationsObject[message.ReceiverSerNum].Messages.push(Message);
                }else if(message.ReceiverSerNum===Patient.getUserSerNum()){
                    Message.Role='0';
                    Message.MessageContent=message.MessageContent;
                    Message.Date=$filter('formatDate')(message.MessageDate);
                    Message.ReadStatus=Number(message.ReadStatus);
                    Message.MessageSerNum=message.MessageSerNum;
                    this.ConversationsObject[message.SenderSerNum].Messages.push(Message);
                }
            }
            var keysArrayConvo = Object.keys(this.ConversationsObject);
            for (var i = 0; i < keysArrayConvo.length; i++) {
                this.ConversationsObject[keysArrayConvo[i]].Messages=$filter('orderBy')(this.ConversationsObject[keysArrayConvo[i]].Messages,'Date',false);
                if(this.ConversationsObject[keysArrayConvo[i]].Messages[this.ConversationsObject[keysArrayConvo[i]].Messages.length-1]!==undefined){
                    this.ConversationsObject[keysArrayConvo[i]].LastMessageContent=this.ConversationsObject[keysArrayConvo[i]].Messages[this.ConversationsObject[keysArrayConvo[i]].Messages.length-1].MessageContent;
                    this.ConversationsObject[keysArrayConvo[i]].DateOfLastMessage=this.ConversationsObject[keysArrayConvo[i]].Messages[this.ConversationsObject[keysArrayConvo[i]].Messages.length-1].Date;
                    this.ConversationsObject[keysArrayConvo[i]].ReadStatus=this.ConversationsObject[keysArrayConvo[i]].Messages[this.ConversationsObject[keysArrayConvo[i]].Messages.length-1].ReadStatus;
                    if(this.ConversationsObject[keysArrayConvo[i]].ReadStatus===0){
                        $rootScope.NumberOfNewMessages+=1;
                    }
                }
                UserConversationsArray.push(this.ConversationsObject[keysArrayConvo[i]]);


            };

            LocalStorage.WriteToLocalStorage('Messages',messagesLocalStorage);
            console.log(UserConversationsArray);
        },
      updateUserMessages:function(messages)
      {
          if(typeof messages=='undefined') return;
          for (var i = 0; i < messages.length; i++) {
            var messageTmp=angular.copy(messages);

            for (var j = 0; j< UserConversationsArray.length; j++) {
              messageTmp[i].Date=new Date(messageTmp[i].MessageDate);
              if((messageTmp[i].ReceiverRole=='Patient'&&messageTmp[i].SenderSerNum==UserConversationsArray[j].UserSerNum))
              {
                messageTmp[i].Role='0';
                UserConversationsArray[j].ReadStatus=1;

                UserConversationsArray[j].DateOfLastMessage=messageTmp[i].MessageDate;
                UserConversationsArray[j].LastMessageContent=messageTmp[i].MessageContent;
                UserConversationsArray[j].Messages.push(messageTmp[i]);
                messagesLocalStorage.push(messages[i]);
                break;
              }

            }
          }
          LocalStorage.WriteToLocalStorage('Messages',messagesLocalStorage);
        },
        /**
        *@ngdoc method
        *@name getUserMessages
        *@methodOf MUHCApp.services:UserMessages
        *@returns {Array} Returns the UserConversationsArray.
        **/
        getUserMessages:function(){

            return UserConversationsArray;
        },
        setDateOfLastMessage:function(index, date){
            UserConversationsArray[index].DateOfLastMessage=date;
        },
        /**
        *@ngdoc method
        *@name getUserMessagesLastUpdated
        *@methodOf MUHCApp.services:UserMessages
        *@returns {Array} Returns the UserMessagesLastUpdated.
        **/
        getUserMessagesLastUpdated:function(){
            return this.UserMessagesLastUpdated;
        },
        /**
        *@ngdoc method
        *@name addNewMessageToConversation
        *@methodOf MUHCApp.services:UserMessages
        *@param {number} conversationIndex Index of conversation in the UserConversationsArray
        *@param {string} senderRole User or Doctor
        *@param {string} messageCotent Content of message
        *@param {Object} date Date of message
        *@description Sends the message to Firebase request fields.
        **/
        addNewMessageToConversation:function(conversationIndex, messageContent, date, attachment)
        {
            //Adding Message To Service! and sending it to firebase storage
            messageToService={};
            messageToService.Role='1';
            messageToService.MessageContent=messageContent;
            messageToService.Date=date;
            messageToService.Attachment=attachment;
            UserConversationsArray[conversationIndex].LastMessageContent=messageContent;
            UserConversationsArray[conversationIndex].Messages.push(messageToService);
            UserConversationsArray[conversationIndex].DateOfLastMessage=date;
        },
        changeConversationReadStatus:function(conversationIndex){
            UserConversationsArray[conversationIndex].ReadStatus=1;
            for (var i = 0; i < UserConversationsArray[conversationIndex].Messages.length; i++) {
                UserConversationsArray[conversationIndex].Messages[i].ReadStatus=1;
            };
        },
        getConversationBySerNum:function(role, serNum)
        {
          for (var i = 0; i < UserConversationsArray.length; i++) {
            if(UserConversationsArray[i].Role==role&&UserConversationsArray[i].UserSerNum==serNum)
            {
              return i;
            }
          }
          return -1;
        },
        isEmpty:function()
        {
          return this.emptyMessages;
        }



    }
}]);
