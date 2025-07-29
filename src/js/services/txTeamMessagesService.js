// SPDX-FileCopyrightText: Copyright (C) 2016 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('OpalApp');
/**
 *@ngdoc service
 *@requires $filter
 *@description Service that deals with the treatment team message information
 **/
myApp.service('TxTeamMessages', ['$filter','RequestToServer','LocalStorage', 'UserPreferences', function($filter,RequestToServer, LocalStorage,UserPreferences){
    //Initializing array that represents all the information for TxTeamMessages
    /**
     *@ngdoc property
     *@description Initializing array that represents all the information for TxTeamMessages, this array is passed to appropriate controllers.
     **/
    var txTeamMessagesArray=[];

    /**
     *@ngdoc property
     *@description Timestamp to check for updates
     **/
    var lastUpdated=0;

    //When there is an update, find the matching message and delete it, its added later by addToTreatmentTeamMessages function
    function findAndDeleteTreatmentTeamMessages(messages)
    {
        for (var i = 0; i < messages.length; i++) {
            for (var j = 0; j < txTeamMessagesArray.length; j++) {
                if(txTeamMessagesArray[j].TxTeamMessageSerNum==messages[i].TxTeamMessageSerNum)
                {
                    txTeamMessagesArray.splice(j,1);
                }
            }
        }
    }
    //Formats the input dates and gets it ready for controllers, updates txTeamMessagesArray
    function addTreatmentTeamMessages(messages)
    {

        //If messages are undefined simply return
        if(typeof messages=='undefined') return;
        for (var i = 0; i < messages.length; i++) {
            //Format the date to javascript
            messages[i].DateAdded=$filter('formatDate')(messages[i].DateAdded);
            //Add to my TxTeamMessages array
            txTeamMessagesArray.push(messages[i]);
        }
    }
    return {
        //Setter the messages from 0
        /**
         *@ngdoc method
         *@name setTxTeamMessages
         *@param {Object} messages messages array that contains the new messages
         *@description Setter method for TxTeamMessages
         **/
        setTxTeamMessages:function(messages)
        {
            txTeamMessagesArray=[];
            addTreatmentTeamMessages(messages);
            lastUpdated = Date.now();
        },
        //Update the messages
        /**
         *@ngdoc method
         *@name updateTxTeamMessages
         *@param {Object} messages Finds messages to update or adds new messages if not found
         *@description Updates the txTeamMessagesArray with the new information contained in the messages parameter
         **/
        updateTxTeamMessages:function(messages)
        {
            //Find and delete to be added later
            findAndDeleteTreatmentTeamMessages(messages);
            //Call formatting function
            addTreatmentTeamMessages(messages);
            lastUpdated = Date.now();
        },
        //Getter for the main array
        /**
         *@ngdoc method
         *@name getTxTeamMessages
         *@description Getter for the txTeamMessagesArray
         *@returns {Array} txTeamMessagesArray
         **/
        getTxTeamMessages:function()
        {
            return txTeamMessagesArray;
        },

        //Obtain a team message by ser num
        /**
         *@ngdoc method
         *@name getTxTeamMessageBySerNum
         *@param {String} serNum TxTeamMessageSerNum to be looked for
         *@description Iterates through the TxTeamMessages array and returns TxTeamMessage object matching the serNum
         *@returns {Object} Returns object containing TxTeamMessage
         **/
        getTxTeamMessageBySerNum:function(serNum)
        {


            for (var i = 0; i < txTeamMessagesArray.length; i++) {
                if(txTeamMessagesArray[i].TxTeamMessageSerNum==serNum)
                {
                    return angular.copy(txTeamMessagesArray[i]);
                }
            }
        },
        //Reads the treatment team message and sends it to backend for processing
        /**
         *@ngdoc method
         *@name readTxTeamMessageBySerNum
         *@param {String} serNum TxTeamMessageSerNum to be read
         *@description Sets ReadStatus in TxTeamMessage to 1, sends request to backend, and syncs with device storage
         **/
        readTxTeamMessageBySerNum:function(serNum)
        {
            for (var i = 0; i < txTeamMessagesArray.length; i++) {
                if(txTeamMessagesArray[i].TxTeamMessageSerNum==serNum)
                {
                    txTeamMessagesArray[i].ReadStatus='1';
                    RequestToServer.sendRequest('Read',{'Id':serNum, 'Field':'TxTeamMessages'});
                }
            }
        },
        /**
         *@ngdoc method
         *@name readTxTeamMessage
         *@param {String} index index in the TxTeamMessages array to be read
         *@param {String} serNum TxTeamMessageSerNum to be read
         *@description Faster method to read an TxTeamMessages, no iteration required.
         **/
        readTxTeamMessage:function(serNum)
        {
            for (var i = 0; i < txTeamMessagesArray.length; i++) {
                if(serNum == txTeamMessagesArray[i].TxTeamMessageSerNum)
                {
                    txTeamMessagesArray[i].ReadStatus = '1';
                    LocalStorage.WriteToLocalStorage('TxTeamMessages',txTeamMessagesArray);
                    RequestToServer.sendRequest('Read',{'Id':serNum, 'Field':'TxTeamMessages'});
                    break;
                }
            }
        },

        /**
         *@ngdoc method
         *@name getTxTeamMessageUrl
         *@description Returns TxTeamMessage url to be used by the {@link OpalApp.service:Notifications Notifications Service}.
         *@returns {String} Returns Url for individual TxTeamMessages
         **/
        getTxTeamMessageUrl:function(serNum)
        {
            return './views/personal/treatment-team-messages/individual-team-message.html';
        },
        /**
         *@ngdoc method
         *@name setLanguageTxTeamMessages
         *@param {object[]|object} messages Array of messages, or single message object.
         *@description Translates the array parameter containing announcements to appropriate preferred language specified in {@link OpalApp.service:UserPreferences UserPreferences}.
         *@returns {Array} Returns array with translated values
         **/
        setLanguageTxTeamMessages :function(messages)
        {
            let language = UserPreferences.getLanguage();
            let messageList = Array.isArray(messages) ? messages : [messages];

            messageList.forEach(message => {
                message.Title = message[`PostName_${language}`];
                message.Body = message[`Body_${language}`];
            });

            return messages;
        },
        /**
         *@ngdoc method
         *@name clearTxTeamMessages
         *@description Clears the service of any saved state, function used by the {@link OpalApp.controller:LogoutController LogoutController}
         **/
        clearTxTeamMessages:function()
        {
            lastUpdated = 0;
            txTeamMessagesArray=[];
        },

        getLastUpdated : function () {
            return lastUpdated;
        }

    };
}]);
