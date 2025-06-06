// SPDX-FileCopyrightText: Copyright (C) 2015 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import { CancelledPromiseError } from '../models/utility/cancelled-promise-error';

/**
 * @description Service providing access to the Opal Listener.
 * @author David Herrera, Summer 2016, Email:davidfherrerar@gmail.com
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('RequestToServer', RequestToServer);

    RequestToServer.$inject = ['$injector','UserAuthorizationInfo','EncryptionService','Firebase','Constants','UUID',
        'ResponseValidator','Params','UserPreferences'];

    function RequestToServer($injector, UserAuthorizationInfo, EncryptionService, Firebase, Constants, UUID,
                             ResponseValidator, Params, UserPreferences) {
        return {
            sendRequest: sendRequest,
            sendRequestWithResponse: sendRequestWithResponse,
            sendRequestWithResponseCancellable: sendRequestWithResponseCancellable,
            apiRequest: apiRequest,
            handleMultiplePatientsRequests: handleMultiplePatientsRequests
        }

        /**
         * @description Sends a request to the listener via Firebase, without waiting for a response.
         * @param {string} typeOfRequest The type of request to make to the listener.
         * @param {object} [parameters] Optional parameters to send with the request.
         * @param {string} [encryptionKey] Optional key, to be used only when making atypical requests requiring different encryption.
         *                                 When this parameter is undefined, default encryption is used.
         * @param {string} [referenceField] Optional different Firebase path on which to post the request.
         * @param {string|number} [patientID] Optional legacy PatientSerNum to use as the TargetPatientID, when making a request for a patient
         *                                    other than the one from the currently selected profile.
         * @returns {Promise<string>} Resolves to the Firebase reference key where the request was pushed, or rejects
         *                            with an error (for example, permission denied if the Firebase rules were violated).
         */
        async function sendRequest(typeOfRequest, parameters, encryptionKey, referenceField, patientID) {
            // Clone the parameters object to avoid encrypting the original
            if (parameters) parameters = JSON.parse(JSON.stringify(parameters));
            let encryptedRequestType = encryptionKey ? typeOfRequest : EncryptionService.encryptData(typeOfRequest);
            let encryptedParameters = encryptionKey ? EncryptionService.encryptWithKey(parameters, encryptionKey) : EncryptionService.encryptData(parameters);
            let requestObject = getRequestObject(typeOfRequest, encryptedRequestType, encryptedParameters, patientID);
            let reference = getReferenceField(typeOfRequest, referenceField);
            // Using 'await' here allows this function to wait long enough to find out if there's a permission denied from writing to Firebase
            let pushID = await Firebase.push(Firebase.getDBRef(reference), requestObject);

            return pushID.key;
        }

        /**
         * @description Call the new listener structure that relays the request to Django backend
         * @param {object} parameters Required fields to process request
         * @param {object | null} data Optional params (for 'get') or data (for 'post') that are passed in the request.
         * @returns Promise that contains the response data
         */
        function apiRequest(parameters, data = null) {
            return new Promise(async (resolve, reject) => {
                let formattedParams = formatParams(parameters, data);
                let requestKey = await sendRequest('api', formattedParams);
                let dbReference = Firebase.getDBRef(`users/${UserAuthorizationInfo.getUsername()}/${requestKey}`);

                Firebase.onValue(dbReference, snapshot => {
                    if (snapshot.exists()) {
                        const apiData = ResponseValidator.validateApiResponse(snapshot.val());
                        Firebase.set(dbReference, null);
                        Firebase.off(dbReference);
                        apiData instanceof Error ? reject(apiData) : resolve(apiData);
                    }
                });
            });
        }

        function formatParams(parameters, data){
            if (parameters.method === 'get' && data) parameters.params = data;
            if (parameters.method === 'post' && data) parameters.data = data;

            const headers = {
                ...Params.API.REQUEST_HEADERS,
                'Accept-Language': UserPreferences.getLanguage(),
                'Appuserid': UserAuthorizationInfo.getUsername()
            };

            return {
                ...parameters,
                headers: headers,
            }
        }

        /**
         * @description - Execute multiple requests to get a categorical data (e.g., announcement) per patient
         *               then merge the data together.
         * @param {string} typeOfRequest - Type of request send to the listener
         * @param {object} parameters - Extra parameters to identify data to be query
         * @param {string} categoryRequested - The data category requested
         * @returns Response with merge data
         */
        async function handleMultiplePatientsRequests(typeOfRequest, parameters, categoryRequested) {
            const ProfileSelectorService = $injector.get('ProfileSelector');
            const patientList = ProfileSelectorService.getConfirmedProfiles();
            let combinedArrays = [];
            let results = await Promise.all(patientList.map(patient => {
                if (!patient.patient_legacy_id) return Promise.resolve();
                return sendRequestWithResponse(typeOfRequest, parameters, null, null, null, patient.patient_legacy_id);
            }));

            results.forEach(result => {
                if (result && result.Data !== 'empty') combinedArrays = [...combinedArrays, ...result.Data[categoryRequested]]
            });

            return {
                ...results[0],
                Data: {[categoryRequested]: combinedArrays}
            }
        }

        /**
         * @description Sends a request to the listener and resolves after receiving a response (or after a timeout).
         *
         *              This function's requests cannot be cancelled. This function is provided to simplify the code
         *              when cancellation is not needed. See below for a cancellable version.
         * @param {string} typeOfRequest The type of request to make to the listener.
         * @param {object} [parameters] Optional parameters to send with the request.
         * @param {string} [encryptionKey] Optional key, to be used only when making atypical requests requiring different encryption.
         *                                 When this parameter is undefined, default encryption is used.
         * @param {string} [referenceField] Optional different Firebase path on which to post the request. Must be used with responseField.
         * @param {string} [responseField] Optional different Firebase path on which to receive the response. Must be used with referenceField.
         * @param {string|number} [patientID] Optional legacy PatientSerNum to use as the TargetPatientID, when making a request for a patient
         *                                    other than the one from the currently selected profile.
         * @returns {Promise<object>} Resolves with the response from the listener, or rejects with an error.
         */
        function sendRequestWithResponse(typeOfRequest, parameters, encryptionKey, referenceField, responseField, patientID) {
            let promiseWrapper = sendRequestWithResponseCancellable(typeOfRequest, parameters, encryptionKey, referenceField, responseField, patientID);
            // Return only the promise without the cancellation feature
            return promiseWrapper.promise;
        }

        /**
         * @description Cancellable version of `sendRequestWithResponse`.
         *              Sends a request to the listener and resolves after receiving a response (or after a timeout).
         *              To cancel the request, call the `cancel` function in the return object.
         *              When cancelled, an unfinished request will still execute in the listener, but the response will be
         *              ignored and .then() will not be triggered. Instead, a CancelledPromiseError will be rejected.
         *
         *              For information about the parameters, see `sendRequestWithResponse`.
         *
         *              Implementation based on: https://medium.com/@masnun/creating-cancellable-promises-33bf4b9da39c
         * @returns {{promise: Promise<object>, cancel: function}} Returns an object containing the Promise for the request,
         *                                                         and a function that can be called to cancel it.
         *                                                         If cancelled, the promise rejects with a CancelledPromiseError.
         */
        function sendRequestWithResponseCancellable(typeOfRequest, parameters, encryptionKey, referenceField, responseField, patientID) {
            let returnObject = {}

            const cancellationTrigger = new Promise((resolve, reject) => {
                // If the cancel function below is called, this Promise rejects, which is used to cancel the request
                returnObject.cancel = () => reject(new CancelledPromiseError());
            });

            returnObject.promise = new Promise(async (resolve, reject) => {
                try {
                    let key = await sendRequest(typeOfRequest, parameters, encryptionKey, referenceField, patientID);

                    // Sets the reference to fetch a response
                    const username = UserAuthorizationInfo.getUsername();
                    let refRequestResponse = referenceField
                        ? Firebase.getDBRef(`${responseField}/${key}`)
                        : Firebase.getDBRef(`users/${username}/${key}`);
                    // Waits to obtain the response data
                    Firebase.onValue(refRequestResponse, snapshot => {
                        if (snapshot.exists()) {
                            let data = snapshot.val();
                            Firebase.set(refRequestResponse, null);
                            Firebase.off(refRequestResponse);
                            data = ResponseValidator.validate(data, encryptionKey, timeOut);
                            data.success ? resolve(data.success) : reject(data.error)
                        }
                    }, error => {
                        Firebase.set(refRequestResponse, null);
                        Firebase.off(refRequestResponse);
                        reject(error);
                    });

                    // If request takes longer than 1.5 minutes to come back with timeout request, delete the listener
                    const timeOut = setTimeout(function() {
                        Firebase.off(refRequestResponse);
                        reject({Response:'timeout'});
                    }, Params.requestTimeout);

                    // Cancellation code: if the cancel function is called before the request finishes, we reject the request Promise.
                    cancellationTrigger.catch(cancelMessage => {
                        reject(cancelMessage);

                        // Clean up
                        Firebase.off(refRequestResponse);
                        clearTimeout(timeOut);
                    });
                }
                catch (error) {
                    // Catch and reject any permission denied errors, or other unexpected errors. This is necessary since we're handling a Promise object manually.
                    reject(error);
                }
            });

            return returnObject;
        }

        /**
         * @description Set the correct reference field to queue a request in the new part of the listener.
         *              If referenceField is provided, use it; if typeOfRequest is `api`, send the request
         *              to the new listener part; otherwise, use the default `requests` legacy path.
         * @param {string} typeOfRequest Type of request to be processed by the listener
         * @param {string} referenceField Specifies a type of request other than `api` or `request`
         * @returns {string} The required reference field
         */
        function getReferenceField(typeOfRequest, referenceField) {
            if (referenceField) return referenceField;
            return typeOfRequest === 'api' ? 'api' : 'requests';
        }

        /**
         * @description Puts together a request object for upload to Firebase.
         * @param {string} typeOfRequest The type of request, unencrypted.
         * @param {string} encryptedRequestType The type of request, encrypted for upload to Firebase.
         *                                      Special case: security request types stay unencryped when saved in this parameter.
         * @param {object} encryptedParameters The encrypted parameters sent with the request.
         * @param {string|number} [patientID] Optional legacy PatientSerNum to use as the TargetPatientID, when making a request for a patient
         *                                    other than the one from the currently selected profile.
         * @returns {object} A formatted request object.
         */
        function getRequestObject(typeOfRequest, encryptedRequestType, encryptedParameters, patientID) {
            let params = {
                Request : encryptedRequestType,
                DeviceId: UUID.getUUID(),
                UserID: UserAuthorizationInfo.getUsername(),
                Parameters: encryptedParameters,
                UserEmail: UserAuthorizationInfo.getEmail(),
                AppVersion: Constants.version(),
                Timestamp: Firebase.serverTimestamp(),
            };
            // Add a target patient if the request type is for patient data
            if (Params.REQUEST.PATIENT_TARGETED_REQUESTS.includes(typeOfRequest)) params.TargetPatientID = patientID || getPatientId();
            return params;
        }

        /**
         * @description Get the patientSerNum from the currently selected profile, currently selected profile for multiple patient data loading
         *  or fallback to the old patient/user service patientSernum
         * @returns {number} The patientSerNum id required to make the request
         */
        function getPatientId() {
            const ProfileSelectorService = $injector.get('ProfileSelector');
            const selectedProfile = ProfileSelectorService.getActiveProfile();
            return selectedProfile?.patient_legacy_id;
        }
    }
})();
