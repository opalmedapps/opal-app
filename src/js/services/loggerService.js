// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   loggerService.js
 * Description  :   Service that sends user activity logs to the server.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   23 Mar 2017
 *
 * Modification history:
 * 2018-11-30: Educational material logging added by Stacey Beard, based on work by Tongyou (Eason) Yang.
 */

/**
 *@ngdoc service
 *@description Service that logs user activity on the Opal server
 **/

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('Logger', Logger);

    Logger.$inject = ['$filter', 'RequestToServer'];

    function Logger($filter, RequestToServer) {

        let loggingEnabled = true;

        let service = {
            sendLog: sendLog,
            enableLogging: value => loggingEnabled = value,
            // --- BEGINNING OF EDUCATIONAL MATERIAL LOGGING --- //
            logClickedEduMaterial: logClickedEduMaterial,
            logSubClickedEduMaterial: logSubClickedEduMaterial,
            logClickedPdfEduMaterial: logClickedPdfEduMaterial,
            logClickedBackEduMaterial: logClickedBackEduMaterial,
            logSubClickedBackEduMaterial: logSubClickedBackEduMaterial,
            logScrolledToBottomEduMaterial: logScrolledToBottomEduMaterial,
            logSubScrolledToBottomEduMaterial: logSubScrolledToBottomEduMaterial,
            // --- END OF EDUCATIONAL MATERIAL LOGGING --- //
        };
        return service;

        ////////////////

        /**
         * @description Sends a log of the current user activity to the server.
         * @param {string} activity The user activity type to be logged.
         * @param {string|number} activityDetails The activity serial number to be logged.
         **/
        function sendLog(activity, activityDetails) {
            if (loggingEnabled) {
                RequestToServer.sendRequestWithResponse('Log', {
                    Activity: angular.copy(activity),
                    ActivityDetails: angular.copy(activityDetails)
                });
            }
        }

        /**
         * @author Stacey Beard
         * @date 2018-11-30
         * @description Sends a request of type 'LogPatientAction' to the server.
         * @param action The action taken by the user (ex: CLICKED, SCROLLED_TO_BOTTOM, etc.).
         * @param refTable The table containing the item the user acted upon (ex: EducationalMaterialControl).
         * @param refTableSerNum The SerNum identifying the item the user acted upon in RefTable
         *                       (ex: SerNum of a row in EducationalMaterialControl).
         * @returns {*} Promise
         */
        function sendLogPatientActionRequest(action, refTable, refTableSerNum) {
            if (loggingEnabled) {
                return RequestToServer.sendRequestWithResponse('LogPatientAction', {
                    'Action': action,
                    'RefTable': refTable,
                    'RefTableSerNum': refTableSerNum,
                    'ActionTime': $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                });
            }
        }

        // --- BEGINNING OF EDUCATIONAL MATERIAL LOGGING --- //

        /**
         * @description Logs when a user clicks on an educational material.
         * @author Tongyou (Eason) Yang, modified by Stacey Beard
         */
        function logClickedEduMaterial(EducationalMaterialControlSerNum) {
            if (loggingEnabled) {
                return sendLogPatientActionRequest('CLICKED', 'EducationalMaterialControl', EducationalMaterialControlSerNum);
            }
        }

        /**
         * @description Logs when a user clicks on an educational sub-material (material contained in a booklet).
         * @author Tongyou (Eason) Yang, modified by Stacey Beard
         */
        function logSubClickedEduMaterial(EducationalMaterialTOCSerNum) {
            if (loggingEnabled) {
                return sendLogPatientActionRequest('CLICKED', 'EducationalMaterialTOC', EducationalMaterialTOCSerNum);
            }
        }

        /**
         * @description Logs when a user clicks on an educational material's pdf button to view or download the pdf.
         * @author Stacey Beard
         */
        function logClickedPdfEduMaterial(EducationalMaterialControlSerNum) {
            if (loggingEnabled) {
                return sendLogPatientActionRequest('CLICKED_PDF', 'EducationalMaterialControl', EducationalMaterialControlSerNum);
            }
        }

        /**
         * @description Logs when a user clicks back from an educational material.
         * @author Tongyou (Eason) Yang, modified by Stacey Beard
         */
        function logClickedBackEduMaterial(EducationalMaterialControlSerNum) {
            if (loggingEnabled) {
                return sendLogPatientActionRequest('CLICKED_BACK', 'EducationalMaterialControl', EducationalMaterialControlSerNum);
            }
        }

        /**
         * @description Logs when a user clicks back from an educational sub-material (material contained in a booklet).
         * @author Tongyou (Eason) Yang, modified by Stacey Beard
         */
        function logSubClickedBackEduMaterial(EducationalMaterialTOCSerNum) {
            if (loggingEnabled) {
                return sendLogPatientActionRequest('CLICKED_BACK', 'EducationalMaterialTOC', EducationalMaterialTOCSerNum);
            }
        }

        /**
         * @description Logs when a user scrolls to the bottom of an educational material.
         * @author Tongyou (Eason) Yang, modified by Stacey Beard
         */
        function logScrolledToBottomEduMaterial(EducationalMaterialControlSerNum) {
            if (loggingEnabled) {
                return sendLogPatientActionRequest('SCROLLED_TO_BOTTOM', 'EducationalMaterialControl', EducationalMaterialControlSerNum);
            }
        }

        /**
         * @description Logs when a user scrolls to the bottom of an educational sub-material (material contained in a booklet).
         * @author Tongyou (Eason) Yang, modified by Stacey Beard
         */
        function logSubScrolledToBottomEduMaterial(EducationalMaterialTOCSerNum) {
            if (loggingEnabled) {
                return sendLogPatientActionRequest('SCROLLED_TO_BOTTOM', 'EducationalMaterialTOC', EducationalMaterialTOCSerNum);
            }
        }

        // --- END OF EDUCATIONAL MATERIAL LOGGING --- //
    }
})();
