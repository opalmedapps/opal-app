// SPDX-FileCopyrightText: Copyright (C) 2015 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   documentsService.js
 * Description  :   Service that store and manages the user documents. Connects with the server to grab data.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   02 Mar 2017
 */



var myApp=angular.module('OpalApp');
/**
 *@ngdoc service
 *@requires $q
 *@requires $filter
 *@description Sets the documents and provides an API to interact with them and the server
 **/
myApp.service('Documents',['UserPreferences', 'UserAuthorizationInfo','$q', '$filter','FileManagerService','RequestToServer','LocalStorage','Constants',
function(UserPreferences,UserAuthorizationInfo,$q,$filter,FileManagerService,RequestToServer,LocalStorage,Constants){
    //Array documentsArray contains all the documents for the patient
    /**
     *@ngdoc property
     *@description Initializing array that represents all the information for documents, this array is passed to appropriate controllers.
     **/
    var documentsArray=[];

    /**
     *@ngdoc property
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
         *@description Getter for the documentsArray
         *@returns {Array} documentsArray
         **/
        getDocuments:function(){
            return documentsArray;
        },

        /**
         *@ngdoc method
         *@name readDocument
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
         *@name getDocumentBySerNum
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
         *@description Returns documents url to be used by the {@link OpalApp.service:Notifications Notifications Service}.
         *@returns {String} Returns Url for individual documents
         **/
        getDocumentUrl:function(serNum)
        {
            return './views/personal/documents/individual-document.html';
        },
        /**
         *@ngdoc method
         *@name downloadDocumentFromServer
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
                if (response.Data)
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
         *@param {object[]|object} documents Array of documents, or single document object.
         *@description Translates the array parameter containing documents to appropriate preferred language specified in {@link OpalApp.service:UserPreferences UserPreferences}.
         *@returns {Array} Returns array with translated values
         **/
        setDocumentsLanguage:function(documents)
        {
            let language = UserPreferences.getLanguage();
            let documentsList = Array.isArray(documents) ? documents : [documents];

            documentsList.forEach(document => {
                document.Title = document[`AliasName_${language}`];
                document.Description = document[`AliasDescription_${language}`];
            });

            return documents;
        },
        /**
         *@ngdoc method
         *@name clearDocuments
         *@description Clears the service of any saved state, function used by the {@link OpalApp.controller:LogoutController LogoutController}
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
