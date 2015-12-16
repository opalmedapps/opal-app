var myApp=angular.module('MUHCApp');
/**
*@ngdoc service
*@name MUHCApp.services:UserMessages
*@requires $filter
*@requires MUHCApp.service:UserAuthorizationInfo
*@description Service deals with patient/doctor messaging portal, parses Firebase object into the appropiate format
*             and defines methods for sending messages back to Firebase.
**/
myApp.service('Messages', ['$filter', 'UserAuthorizationInfo', 'Patient', 'Doctors','$rootScope', function($filter, UserAuthorizationInfo, Patient,Doctors,$rootScope){
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
             this.UserConversationsArray = [];
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
                var conversation={}
                conversation.MessageRecipient=doctors[i].FirstName+' '+ doctors[i].LastName;
                conversation.Messages=[];
                conversation.ReadStatus=1;
                conversation.Role='Doctor';
                conversation.UserSerNum=doctors[i].DoctorSerNum;
                this.ConversationsObject[doctors[i].DoctorSerNum]=conversation;
            };
            for (var i = 0; i < keysArray.length; i++) {
                var Message={};
                var message=messages[keysArray[i]];
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
                    Message.ReadStatus=message.ReadStatus;
                    Message.MessageSerNum=message.MessageSerNum;
                    this.ConversationsObject[message.SenderSerNum].Messages.push(Message);
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
        },
        /**
        *@ngdoc method
        *@name getUserMessages
        *@methodOf MUHCApp.services:UserMessages
        *@returns {Array} Returns the UserConversationsArray.
        **/
        getUserMessages:function(){

            return this.UserConversationsArray;
        },
        setDateOfLastMessage:function(index, date){
            this.UserConversationsArray[index].DateOfLastMessage=date;
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
            this.UserConversationsArray[conversationIndex].Messages.push(messageToService);
            this.UserConversationsArray[conversationIndex].DateOfLastMessage=date;
        },
        changeConversationReadStatus:function(conversationIndex){
            this.UserConversationsArray[conversationIndex].ReadStatus=1;
            for (var i = 0; i < this.UserConversationsArray[conversationIndex].Messages.length; i++) {
                this.UserConversationsArray[conversationIndex].Messages[i].ReadStatus=1;
            };
        },
        isEmpty:function()
        {
          return this.emptyMessages;
        }



    }
}]);
