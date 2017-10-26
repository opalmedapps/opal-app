//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
/**
 *@ngdoc service
 *@name MUHCApp.service:TxTeamMessages
 *@requires $filter
 *@requires MUHCApp.service:RequestToServer
 *@requires MUHCApp.service:UserPreferences
 *@requires MUHCApp.service:LocalStorage
 *@description Service that deals with the treatment team message information
 **/
myApp.service('TxTeamMessages', ['$filter','RequestToServer','LocalStorage', 'UserPreferences', function($filter,RequestToServer, LocalStorage,UserPreferences){
    //Initializing array that represents all the informations for TxTeamMessages
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#txTeamMessagesArray
     *@propertyOf MUHCApp.service:TxTeamMessages
     *@description Initializing array that represents all the information for TxTeamMessages, this array is passed to appropiate controllers.
     **/
    var txTeamMessagesArray=[];

    /**
     *@ngdoc property
     *@name  MUHCApp.service.#lastUpdated
     *@propertyOf MUHCApp.service:TxTeamMessages
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
         *@methodOf MUHCApp.service:TxTeamMessages
         *@param {Object} messages messages array that containts the new messages
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
         *@methodOf MUHCApp.service:TxTeamMessages
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
         *@methodOf MUHCApp.service:TxTeamMessages
         *@description Getter for the txTeamMessagesArray
         *@returns {Array} txTeamMessagesArray
         **/
        getTxTeamMessages:function()
        {
            return txTeamMessagesArray;
        },
        //Gets unread messages for notifications and badges
        /**
         *@ngdoc method
         *@name getUnreadTxTeamMessages
         *@methodOf MUHCApp.service:TxTeamMessages
         *@description Gets unread tx team messages
         *@returns {Array} Returns all the unread messages
         **/
        getUnreadTxTeamMessages:function()
        {
            var array=[];
            for (var i = 0; i < txTeamMessagesArray.length; i++) {
                if(txTeamMessagesArray[i].ReadStatus =='0')
                {
                    array.push(txTeamMessagesArray[i]);
                }
            }
            return array;
        },
        //Get number of unread news
        /**
         *@ngdoc method
         *@name getNumberUnreadTxTeamMessages
         *@methodOf MUHCApp.service:TxTeamMessages
         *@description Iterates through array object and returns the number of unread messages
         *@returns {Number} Returns number of unread news
         **/
        getNumberUnreadTxTeamMessages:function()
        {
            var number = 0;
            for (var i = 0; i < txTeamMessagesArray.length; i++) {
                if(txTeamMessagesArray[i].ReadStatus == '0')
                {
                    number++;
                }
            }
            return number;
        },
        //Obtain a team message by ser num
        /**
         *@ngdoc method
         *@name getTxTeamMessageBySerNum
         *@methodOf MUHCApp.service:TxTeamMessages
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
         *@methodOf MUHCApp.service:TxTeamMessages
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
         *@methodOf MUHCApp.service:TxTeamMessages
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
         *@name getTxTeamMessageName
         *@methodOf MUHCApp.service:TxTeamMessages
         *@param {String} serNum TxTeamMessageSerNum to be read
         *@description Gets the PostName_EN, and PostName_FR for the notifications
         *@returns {Object} Returns object containing only the names for a particular TxTeamMessage, used by the {@link MUHCApp.service:Notifications Notifications Service}
         **/
        getTxTeamMessageName:function(serNum)
        {


            for (var i = 0; i < txTeamMessagesArray.length; i++) {
                if(txTeamMessagesArray[i].TxTeamMessageSerNum === serNum)
                {

                    return { NameEN: txTeamMessagesArray[i].PostName_EN, NameFR:txTeamMessagesArray[i].PostName_FR};
                }
            }
        },
        /**
         *@ngdoc method
         *@name getTxTeamMessageUrl
         *@methodOf MUHCApp.service:TxTeamMessages
         *@description Returns TxTeamMessage url to be used by the {@link MUHCApp.service:Notifications Notifications Service}.
         *@returns {String} Returns Url for individual TxTeamMessages
         **/
        getTxTeamMessageUrl:function(serNum)
        {
            return './views/personal/treatment-team-messages/individual-team-message.html';
        },
        /**
         *@ngdoc method
         *@name setLanguageTxTeamMessages
         *@methodOf MUHCApp.service:TxTeamMessages
         *@param {Array} array Array with TxTeamMessages
         *@description Translates the array parameter containing announcements to appropiate preferred language specified in {@link MUHCApp.service:UserPreferences UserPreferences}.
         *@returns {Array} Returns array with translated values
         **/
        setLanguageTxTeamMessages :function(array)
        {
            var language = UserPreferences.getLanguage();
            //Check if array
            if (Object.prototype.toString.call( array ) === '[object Array]') {
                for (var i = 0; i < array.length; i++) {
                    //set language
                    array[i].Title = (language=='EN')? array[i].PostName_EN : array[i].PostName_FR;
                    array[i].Body = (language == 'EN')? array[i].Body_EN : array[i].Body_FR;
                }
            }else{
                //set language if string
                array.Title = (language=='EN')? array.PostName_EN : array.PostName_FR;
                array.Body = (language == 'EN')? array.Body_EN: array.Body_FR;
            }
            return array;
        },
        /**
         *@ngdoc method
         *@name clearTxTeamMessages
         *@methodOf MUHCApp.service:TxTeamMessages
         *@description Clears the service of any saved state, function used by the {@link MUHCApp.controller:LogoutController LogoutController}
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
