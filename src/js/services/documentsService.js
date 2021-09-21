/*
 * Filename     :   documentsService.js
 * Description  :   Service that store and manages the user documents. Connects with the server to grab data.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   02 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */



var myApp=angular.module('MUHCApp');
/**
 *@ngdoc service
 *@name MUHCApp.service:Documents
 *@requires MUHCApp.service:UserPreferences
 *@requires MUHCApp.service:RequestToServer
 *@requires MUHCApp.service:LocalStorage
 *@requires MUHCApp.service:FileManagerService
 *@requires MUHCApp.service:UserAuthorizationInfo
 *@requires $q
 *@requires $filter
 *@description Sets the documents and provides an API to interact with them and the server
 **/
myApp.service('Documents',['UserPreferences', 'UserAuthorizationInfo','$q', '$filter','FileManagerService','RequestToServer','LocalStorage','Constants',
function(UserPreferences,UserAuthorizationInfo,$q,$filter,FileManagerService,RequestToServer,LocalStorage,Constants){
    //Array documentsArray contains all the documents for the patient
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#documentsArray
     *@propertyOf MUHCApp.service:Documents
     *@description Initializing array that represents all the information for documents, this array is passed to appropiate controllers.
     **/
    var documentsArray=[];

    /**
     *@ngdoc property
     *@name  MUHCApp.service.#lastUpdated
     *@propertyOf MUHCApp.service:Documents
     *@description Timestamp to check for updates
     **/
	var lastUpdated=0;

    //Check document, if its an update delete it from documentsArray
    function searchDocumentsAndDelete(documents)
    {
        var tmp=[];
        for (var i = 0; i < documents.length; i++) {
            for (var j = 0; j < documentsArray.length; j++) {
                if(documentsArray[j].DocumentSerNum==documents[i].DocumentSerNum)
                {
                    documentsArray.splice(j,1);
                    break;
                }
            }
        }
    }
    function copyObject(object)
    {
        var newObject={};
        for (var key in object)
        {
            newObject[key]=object[key];
        }
        return newObject;
    }
    //Checks to see if a documents
    function isDocumentStored(serNum){
        var user=UserAuthorizationInfo.getUsername();
        var key=user+Documents;

    }
    function addDocumentsToService(documents)
    {
        if(!documents) return;
        for (var i = 0; i < documents.length; i++) {
            documents[i].CreatedTimeStamp = $filter('formatDate')(documents[i].CreatedTimeStamp);
            documents[i].ApprovedTimeStamp = $filter('formatDate')(documents[i].ApprovedTimeStamp);
            documents[i].DocumentType = FileManagerService.getFileExtension(documents[i].FinalFileName);
            documents[i].FirstName = documents[i].FirstName.trim();
            documents[i].LastName = documents[i].LastName.trim();
            documentsArray.push(documents[i]);
        }
        documentsArray = $filter('orderBy')(documentsArray,'-CreatedTimeStamp');
        LocalStorage.WriteToLocalStorage('Documents',documentsArray);
        return documents;
    }

    /**
     * @description Deletes a single file from the device storage and removes it from the list on local storage if it's found there.
     * @param fileName - The name of the file to delete.
     */
    function deleteDocumentDownloaded(fileName) {
        FileManagerService.deleteFileFromStorage(fileName);

        // Remove the document from the storage list
        let docs = getDocumentsDownloaded();
        let index = docs.indexOf(fileName);
        if (index !== -1) docs.splice(index, 1);
        setDocumentsDownloaded(docs);
    }

    /**
     * @description Gets a list of downloaded documents from local storage and returns it as an array.
     *              This list represents names of all downloaded documents that should be deleted on exit of the app.
     *              Note: in local storage, document are saved in one string, each separated by a vertical bar '|'.
     * @author Stacey Beard
     * @date 2021-09-09
     * @returns {string[]} An array of names of documents on the device.
     */
    function getDocumentsDownloaded() {
	    let storedString = window.localStorage.getItem('DocumentsDownloaded');
	    return !storedString ? [] : storedString.split('|');
    }

    /**
     * @description Saves a list of downloaded documents to local storage.
     *              This list represents names of all downloaded documents that should be deleted on exit of the app.
     *              Note: in local storage, document are saved in one string, each separated by a vertical bar '|'.
     * @author Stacey Beard
     * @date 2021-09-09
     * @param {string[]} docArray - An array of names of documents on the device.
     */
    function setDocumentsDownloaded(docArray) {
        window.localStorage.setItem('DocumentsDownloaded', docArray.join('|'));
    }

    return{
        /**
         *@ngdoc method
         *@name setDocuments
         *@methodOf MUHCApp.service:Documents
         *@param {Object} documents Documents to be added to the model for the patient.
         *@description Setter method for documents
         **/
        setDocuments:function(documents){
        	lastUpdated = Date.now();
            documentsArray=[];
            return addDocumentsToService(documents);
        },
        /**
         *@ngdoc method
         *@name updateDocuments
         *@methodOf MUHCApp.service:Documents
         *@param {Object} documents Latest documents to be added to the model for the patient.
         *@description Updates the documentsArray with the new information contained in the documents parameter
         **/
        updateDocuments:function(documents)
        {
        	lastUpdated = Date.now();
            if(documents) searchDocumentsAndDelete(documents);
            return addDocumentsToService(documents);
        },
        /**
         *@ngdoc method
         *@name getDocuments
         *@methodOf MUHCApp.service:Documents
         *@description Getter for the documentsArray
         *@returns {Array} documentsArray
         **/
        getDocuments:function(){
            return documentsArray;
        },
        getUnreadDocuments:function()
        {
            var array=[];
            for (var i = 0; i < documentsArray.length; i++) {
                if(documentsArray[i].ReadStatus=='0'){
                    array.push(documentsArray[i]);
                }
            }
            array=$filter('orderBy')(array,'DateAdded');
            return array;
        },
        //Get number of unread news
        /**
         *@ngdoc method
         *@name getNumberUnreadDocuments
         *@methodOf MUHCApp.service:Documents
         *@description Gets unread documents
         *@returns {Array} Returns all the unread documents
         **/
        getNumberUnreadDocuments:function()
        {
            var number = 0;
            for (var i = 0; i < documentsArray.length; i++) {
                if(documentsArray[i].ReadStatus == '0')
                {
                    number++;
                }
            }
            return number;
        },
        /**
         *@ngdoc method
         *@name readDocument
         *@methodOf MUHCApp.service:Documents
         *@param {String} serNum DocumentSerNum to be read
         *@description Sets ReadStatus in documents to 1, sends request to backend, and syncs with device storage
         **/
        readDocument:function(serNum)
        {
            for (var i = 0; i < documentsArray.length; i++) {
                if(documentsArray[i].DocumentSerNum==serNum){
                    documentsArray[i].ReadStatus='1';
                    LocalStorage.WriteToLocalStorage('Documents', documentsArray);
                    RequestToServer.sendRequest('Read',{'Field':'Documents', Id:serNum});
                }
            }
        },
        /**
         *@ngdoc method
         *@name getDocumentNames
         *@methodOf MUHCApp.service:Documents
         *@param {String} serNum DocumentSerNum to be read
         *@description Gets the AliasName_EN, and AliasName_FR for the notifications
         *@returns {Object} Returns object containing only the names for a particular document, used by the {@link MUHCApp.service:Notifications Notifications Service}
         **/
        getDocumentNames:function(serNum)
        {
            for (var i = 0; i < documentsArray.length; i++) {
                if(documentsArray[i].DocumentSerNum==serNum){
                    return {NameEN: documentsArray[i].AliasName_EN, NameFR:documentsArray[i].AliasName_FR};
                }
            }
        },
        /**
         *@ngdoc method
         *@name getDocumentBySerNum
         *@methodOf MUHCApp.service:Documents
         *@param {String} serNum DocumentSerNum to be looked for
         *@description Iterates through the documents array and returns document object matching the serNum
         *@returns {Object} Returns object containing document
         **/
        getDocumentBySerNum:function(serNum)
        {
            for (var i = 0; i < documentsArray.length; i++) {
                if(documentsArray[i].DocumentSerNum==serNum){
                    return documentsArray[i];
                }
            }
        },

        /**
         * @description Saves the name of a downloaded file in order to delete it later.
         * @param {string} documentName - The name of the file.
         */
        addToDocumentsDownloaded: function(documentName)
        {
            let documentsDownloaded = getDocumentsDownloaded();
            if (!documentsDownloaded.includes(documentName)) documentsDownloaded.push(documentName); // Don't add duplicates
            setDocumentsDownloaded(documentsDownloaded);
        },

        /**
         * @description Deletes all files marked for deletion in local storage (those returned by the function getDocumentsDownloaded()).
         */
        deleteDocumentsDownloaded: function()
        {
            let documentsDownloaded = getDocumentsDownloaded();
            let remainingDocuments = []; // Keeps track of any documents that have failed to be deleted

            if (Constants.app) console.log("Deleting all documents downloaded to internal storage");
            for (let i = 0; i < documentsDownloaded.length; i++) {
                let document = documentsDownloaded[i];
                console.log(`+ + + + + + + + + + + + documentsDownloaded: ${document}`);

                // Delete file from local device storage; deletion is wrapped in a try block to prevent an error from crashing the whole function
                try {
                    FileManagerService.deleteFileFromStorage(document);
                }
                catch (error) {
                    console.error(`An error occurred while trying to delete file [${document}]: ${JSON.stringify(error)}`);
                    remainingDocuments.push(document);
                }
            }
            // Update the document array to reflect those that have been deleted
            setDocumentsDownloaded(remainingDocuments);
        },

        /**
         *@ngdoc method
         *@name getDocumentUrl
         *@methodOf MUHCApp.service:Documents
         *@description Returns documents url to be used by the {@link MUHCApp.service:Notifications Notifications Service}.
         *@returns {String} Returns Url for individual documents
         **/
        getDocumentUrl:function(serNum)
        {
            return './views/personal/documents/individual-document.html';
        },
        /**
         *@ngdoc method
         *@name downloadDocumentFromServer
         *@methodOf MUHCApp.service:Documents
         *@param {String} serNum DocumentSerNum
         *@description Downloads the document that matches that DocumentSerNum parameter from the server
         *@returns {Promise} Promise successful upon correct arrival of document, rejected if error in server, or request timeout
         **/
        downloadDocumentFromServer:function(serNum)
        {
            var _this = this;
            var r = $q.defer();
            RequestToServer.sendRequestWithResponse('DocumentContent',[serNum]).then(function(response)
            {
                if(response.Code == '3' && response.Data !== 'DocumentNotFound')
                {
                    var doc = _this.getDocumentBySerNum(serNum);
                    doc.Content = response.Data.Content;
                    r.resolve("success");
                }else{
                    r.reject(response);
                }

            }).catch(function(error)
            {
                r.reject(error);
            });
            return r.promise;
        },
        /**
         *@ngdoc method
         *@name setDocumentsLanguage
         *@methodOf MUHCApp.service:Documents
         *@param {Array} array Array with documents
         *@description Translates the array parameter containing documents to appropiate preferred language specified in {@link MUHCApp.service:UserPreferences UserPreferences}.
         *@returns {Array} Returns array with translated values
         **/
        setDocumentsLanguage:function(array)
        {
            //Get language
            var language = UserPreferences.getLanguage();

            //Check if array
            if (Object.prototype.toString.call( array ) === '[object Array]') {
                for (var i = 0; i < array.length; i++) {
                    //set language
                    array[i].Title = (language=='EN')? array[i].AliasName_EN : array[i].AliasName_FR;
                    array[i].Description = (language == 'EN')? array[i].AliasDescription_EN : array[i].AliasDescription_FR;
                }
            }else{
                //set language if string
                array.Description = (language == 'EN')? array.AliasDescription_EN : array.AliasDescription_FR;
                array.Title = (language=='EN')? array.AliasName_EN : array.AliasName_FR;
            }
            return array;
        },
        /**
         *@ngdoc method
         *@name clearDocuments
         *@methodOf MUHCApp.service:Documents
         *@description Clears the service of any saved state, function used by the {@link MUHCApp.controller:LogoutController LogoutController}
         **/
        clearDocuments:function()
        {
        	lastUpdated = 0;
            documentsArray=[];
        },

        /**
         * @description Deletes the downloaded content (base64, file download) from a document, leaving its meta data.
         */
        clearDocumentContent: function (document) {
            // Delete the document's base64 content
            document.Content = '';

            // Delete the document if it was downloaded
            if (Constants.app) deleteDocumentDownloaded(document.fileName);
        },

		getLastUpdated : function () {
			return lastUpdated;
        }
    };
}]);
