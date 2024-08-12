/**
 * @file Service that handles downloading, updating and setting other services with patient data for the whole application.
 * @author David Herrera, Stacey Beard
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('UpdateUI', UpdateUI);

    UpdateUI.$inject = ['Announcements','Appointments','Diagnoses','Documents',
        'EducationalMaterial', 'Notifications', 'PatientTestResults',
        'Questionnaires','RequestToServer','TxTeamMessages','UserPreferences'];

    function UpdateUI(Announcements, Appointments, Diagnoses, Documents,
                      EducationalMaterial, Notifications, PatientTestResults,
                      Questionnaires, RequestToServer, TxTeamMessages, UserPreferences) {
        /**
         * @desc Mapping of all request types made by this service to the listener. Each key is the name of a
         *       request, and each value contains a last updated timestamp and functions used to save response
         *       data into the service corresponding to the category of data received.
         *
         *       - set: Saves the data into the service by first clearing away all existing data.
         *       - update: Saves the data by overwriting duplicate data (according to SerNum) and leaving the rest alone.
         *       - lastUpdated: Timestamp at which data was last requested from the listener.
         *       - multiProfileEnabled: Enable getting data for multiple patient for a single category (Only supports one request type in Fields).
         * @type {{'Category': {set: function, lastUpdated: number, update: function}}}
         */
        let sectionServiceMappings = {
            'Announcements': {
                set: Announcements.setAnnouncements,
                update: Announcements.updateAnnouncements,
                lastUpdated: 0,
                multiProfileEnabled: true,
            },
            'Appointments': {
                set: Appointments.setUserAppointments,
                update: Appointments.updateUserAppointments,
                lastUpdated: 0,
                multiProfileEnabled: false,
            },
            'Diagnosis': {
                set: Diagnoses.setDiagnoses,
                update: Diagnoses.updateDiagnoses,
                lastUpdated: 0,
                multiProfileEnabled: false,
            },
            'Documents': {
                set: Documents.setDocuments,
                update: Documents.updateDocuments,
                lastUpdated: 0,
                multiProfileEnabled: false,
            },
            'EducationalMaterial': {
                set: EducationalMaterial.setEducationalMaterial,
                update: EducationalMaterial.updateEducationalMaterial,
                lastUpdated: 0,
                multiProfileEnabled: false,
            },
            'Notifications': {
                set: Notifications.setNotifications,
                update: Notifications.updateUserNotifications,
                lastUpdated: 0,
                multiProfileEnabled: true,
            },
            'PatientTestDates': {
                set: PatientTestResults.setTestDates,
                update: PatientTestResults.updateTestDates,
                lastUpdated: 0,
                multiProfileEnabled: false,
            },
            'PatientTestTypes': {
                set: PatientTestResults.setTestTypes,
                update: PatientTestResults.updateTestTypes,
                lastUpdated: 0,
                multiProfileEnabled: false,
            },
            'QuestionnaireList': {
                set: Questionnaires.setQuestionnaireList,
                update: Questionnaires.updateQuestionnaireList,
                lastUpdated: 0,
                multiProfileEnabled: false,
            },
            'TxTeamMessages': {
                set: TxTeamMessages.setTxTeamMessages,
                update: TxTeamMessages.updateTxTeamMessages,
                lastUpdated: 0,
                multiProfileEnabled: false,
            },
        };

        let service = {
            init: init,
            haveBeenInitialized: haveBeenInitialized,
            getData: getData,
            getSingleItem: getSingleItem,
            clearUpdateUI: () => updateTimestamps(Object.keys(sectionServiceMappings), 0),
            updateTimestamps: updateTimestamps
        };

        return service;

        ////////////////

        /**
         * @desc Initializes the data necessary for login, and sets observers to watch for changes.
         * @returns {Promise<void>} Resolves when initial data is done downloading.
         */
        async function init() {
            // When the language changes, force questionnaires to be cleared (since they're saved only for one language)
            UserPreferences.observeLanguage(() => {
                Questionnaires.clearAllQuestionnaire();
                updateTimestamps('QuestionnaireList', 0);
            });
        }

        /**
         * @desc Takes the data from a listener response and assigns it the right services for each category
         *       using the 'set' functions in sectionServiceMappings.
         * @param responseData A response from the listener containing data in one or many categories.
         */
        function setServices(responseData, requestedCategories) {
            if (responseData === 'empty') responseData = handleEmptyResponse(requestedCategories);
            Object.entries(responseData).forEach(([category, data]) => {
                if(sectionServiceMappings.hasOwnProperty(category)) sectionServiceMappings[category].set(data);
            })
        }

        /**
         * @desc Patch function to hanldle empty categories when switching profile with the profile selector.
         *       This should not be required when switching to data loading from new backend.
         * @param {object} categories Requested data categories.
         * @returns array of requested categories with empty arrays as value.
         */
         function handleEmptyResponse(categories) {
            let result = {};
            categories.forEach(item => result[item] = []);
            return result;
        }

        /**
         * @desc Takes the data from a listener response and assigns it the right services for each category
         *       using the 'update' functions in sectionServiceMappings.
         * @param responseData A response from the listener containing data in one or many categories.
         */
        function updateServices(responseData) {
            if (responseData === 'empty') return;
            Object.entries(responseData).forEach(([category, data]) => {
                if(sectionServiceMappings.hasOwnProperty(category)) sectionServiceMappings[category].update(data);
            })
        }

        /**
         * @description Queries the backend for newly updated data in the given categories, receiving only data that has
         *              been changed since the last update. Updates the corresponding services with this new data.
         * @param {Array<string>} parameters - The categories of data to update.
         * @param {Object} auxiliaryParams - Optional auxiliary parameters that are used to update a category of data.
         * @returns {Promise<void>} Resolves if all data was successfully updated, or rejects with an error.
         */
        async function updateSection(parameters, auxiliaryParams = null) {
            let refreshParams = {
                Fields: parameters,
                purpose: auxiliaryParams?.purpose,
                Timestamp: findSmallestTimestamp(parameters),
                Language: UserPreferences.getLanguage(),
            };
            let response = await cueRequests('Refresh', refreshParams);
            validateResponse(response);
            await updateServices(response.Data);
            updateTimestamps(parameters, response.Timestamp);
        }

        /**
         * @description Queries the backend for all data in each of the given categories. Initializes the corresponding
         *              services with this data (clearing any existing data).
         * @param {Array<string>} parameters - The categories of data to initialize.
         * @param {Object} auxiliaryParams - Optional auxiliary parameters that are used to initialize a category of data.
         * @returns {Promise<void>} Resolves if all data was successfully initialized, or rejects with an error.
         */
        async function setSection(parameters, auxiliaryParams = null) {
            let refreshParams = {
                Fields: parameters,
                Language: UserPreferences.getLanguage(),
                purpose: auxiliaryParams?.purpose,
            };

            let response = await cueRequests('Refresh', refreshParams);
            validateResponse(response);
            await setServices(response.Data, parameters);
            updateTimestamps(parameters, response.Timestamp);
        }

        /**
         * @description - Cue request between multiple patient requests for announcements or normal single request to server.
         * @param {string} typeOfRequest - Type of request send to the listener
         * @param {object} parameters - Extra parameters to identify data to be query
         * @returns Requested data from the listener.
         */
        async function cueRequests(typeOfRequest, parameters) {
            return sectionServiceMappings[parameters.Fields[0]].multiProfileEnabled
                ? RequestToServer.handleMultiplePatientsRequests(typeOfRequest, parameters, parameters.Fields[0])
                : RequestToServer.sendRequestWithResponse(typeOfRequest, parameters);
        }

        /**
         * Helper functions
         */

        /**
         * @description Iterates through the 'lastUpdated' timestamps in the given categories in sectionServiceMappings
         *              and sets them to a certain value.
         * @param {string| Array<string>} categories - The category or categories to update.
         * @param {number} time - The new value to which to set lastUpdated.
         */
        function updateTimestamps(categories, time) {
            if (angular.isArray(categories)) for (let section of categories) sectionServiceMappings[section].lastUpdated = time;
            else sectionServiceMappings[categories].lastUpdated = time;
        }

        /**
         * @description Finds and returns the smallest 'lastUpdated' timestamp among the given categories.
         * @param {string| Array<string>} categories - The category or categories to check.
         * @returns {number|undefined} The smallest lastUpdated value for the given categories.
         */
        function findSmallestTimestamp(categories) {
            if (Array.isArray(categories)) {
                if (categories.length === 0) return undefined;
                return categories.reduce((min, category) => {
                    let lastUpdated = sectionServiceMappings[category].lastUpdated;
                    if (lastUpdated < min) return lastUpdated;
                    else return min;
                }, Infinity);
            }
            else return sectionServiceMappings[categories].lastUpdated;
        }

        /**
         * @description Determines whether all provided category have been successfully initialized.
         *              Note: if an error occurred during its initialization process, a category is not considered initialized.
         * @param {string| Array<string>} categories - The category or categories to check.
         * @returns {boolean} True if the category has been successfully initialized; false otherwise.
         *                    If an array is provided, this function will return false if at least one category has not been initialized.
         */
        function haveBeenInitialized(categories) {
            validateCategories(categories);
            if (!Array.isArray(categories)) return haveBeenInitialized([categories]);
            return categories.every(category => sectionServiceMappings[category].lastUpdated !== 0);
        }

        /**
         * @description Validates a category or array of categories by checking whether it's in sectionServiceMappings.
         * @param {string | Array<string>} categories - The category or categories to check.
         * @throws {string} An error if a category is invalid.
         */
        function validateCategories(categories) {
            if (!Array.isArray(categories)) return validateCategories([categories]);
            categories.forEach(category => {
                if (!sectionServiceMappings.hasOwnProperty(category)) throw `Invalid UpdateUI category: ${category}`;
            });
        }

        /**
         * @description Initializes or updates data in the requested categories. If data in a category has not been
         *              requested yet, or an error has prevented it from being requested successfully, it will
         *              be initialized; otherwise, it will be updated.
         * @param {string | Array<string>} categories - The categories of data to initialize or update.
         * @param {Object} parameters - Optional parameters that are used to initialize or update data.
         * @returns {Promise<void>} Resolves if all data was successfully initialized / updated, or rejects with an error.
         */
        async function getData(categories, parameters = null) {
            // Validate input

            validateCategories(categories);
            if (typeof categories === "string" || typeof parameters === "string")
                return getData([categories], JSON.parse(parameters));

            // Iterate through all categories to initialize or update them
            let toSet = [], toUpdate = [];
            for (let category of categories) {
                // Depending on its status, dispatch the category to be initialized or updated
                if (haveBeenInitialized(category)) toUpdate.push(category);
                else toSet.push(category);
            }

            // Execute all initializations or updates simultaneously
            let setPromise = toSet.length === 0 ? undefined : setSection(toSet, parameters);
            let updatePromise = toUpdate.length === 0 ? undefined : updateSection(toUpdate, parameters);
            await Promise.all([setPromise, updatePromise]);
        }

        /**
         * @desc Requests a single item in a category by SerNum, and saves it in the right service using the update function.
         * @param {string} category The category of data item to download.
         * @param {number|string} serNum The SerNum of the item in its category (e.g. DocumentSerNum, AppointmentSerNum, etc.)
         * @returns {Promise<void>} Resolves once the item has been successfully downloaded and saved.
         */
        async function getSingleItem(category, serNum) {
            validateCategories(category);

            // Request and save the single item by SerNum
            let response = await RequestToServer.sendRequestWithResponse('GetOneItem', {category: category, serNum: serNum});
            validateResponse(response);
            await updateServices(response.Data);
        }

        /**
         * @desc Validates that a response object (of type 'Login' or 'Refresh') has the expected properties.
         * @param response The response to check.
         * @throws Throws an error if a required property is missing.
         */
        function validateResponse(response) {
            let printInvalidResponse = () => console.error(response);

            // Check for required properties
            let requiredProperties = ['Data', 'Timestamp'];
            requiredProperties.forEach(property => {
                if (!response.hasOwnProperty(property)) {
                    printInvalidResponse();
                    throw new Error(`Invalid response object received in UpdateUI service; '${property}' property is missing`);
                }
            });

            // Check the format of the Data property
            if (typeof response.Data !== 'object' && response.Data !== 'empty') {
                printInvalidResponse();
                throw new Error(`Malformed Data property in response object from UpdateUI service: type = ${typeof response.Data}`);
            }
        }
    }
})();
