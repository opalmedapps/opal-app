/*
 * Filename     :   loggerService.js
 * Description  :   Service that sends user activity logs to the server.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   23 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
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

    /* @ngInject */
    function Logger($filter, RequestToServer) {

        var loggingEnabled = true;

        var service = {
            sendLog: sendLog,
            enableLogging: enableLogging,
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
         *@ngdoc method
         *@name sendLog
         *@param {String} activity the user activity type to be logged
         *@param {String} activityDetails the activity serial number to be logged
         *@description Sends a log of the current user activity to the server.
         **/
        function sendLog(activity, activityDetails) {

            if (loggingEnabled) {

                RequestToServer.sendRequestWithResponse('Log', {
                    Activity: angular.copy(activity),
                    ActivityDetails: angular.copy(activityDetails)
                })

            }
        }

        /**
         *@ngdoc method
         *@name enableLogging
         *@param {Boolean} bool Boolean value that sets the logging
         *@description Enables or disables logging of usage
         **/
        function enableLogging(bool){
            loggingEnabled = bool;
        }

        /**
         * @ngdoc method
         * @name sendLogPatientActionRequest
         * @author Stacey Beard
         * @date 2018-11-30
         * @description Sends a request of type 'LogPatientAction' to the server.
         * @param action The action taken by the user (ex: CLICKED, SCROLLED_TO_BOTTOM, etc.).
         * @param refTable The table containing the item the user acted upon (ex: EducationalMaterialControl).
         * @param refTableSerNum The SerNum identifying the item the user acted upon in RefTable
         *                       (ex: SerNum of a row in EducationalMaterialControl).
         * @returns {*} Promise
         */
        function sendLogPatientActionRequest(action, refTable, refTableSerNum){

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

        // Logs when a user clicks on an educational material.
        // Author: Tongyou (Eason) Yang, modified by Stacey Beard
        // Previously called writeClickedRequest()
        function logClickedEduMaterial(EducationalMaterialControlSerNum) {

            if (loggingEnabled) {
                return sendLogPatientActionRequest('CLICKED', 'EducationalMaterialControl', EducationalMaterialControlSerNum)
                // // For testing
                // .then((res)=>{
                //     console.log(res);
                //     ons.notification.alert({message:"Successfully wrote CLICKED in DB for EducationalMaterialControlSerNum="+EducationalMaterialControlSerNum});
                // })
                // .catch((err)=>{
                //     console.log("Error in logClickedEduMaterial for EducationalMaterialControlSerNum="+EducationalMaterialControlSerNum);
                //     console.log(err);
                // });
            }
        }

        // Logs when a user clicks on an educational sub-material (material contained in a booklet).
        // Author: Tongyou (Eason) Yang, modified by Stacey Beard
        // Previously called writeSubClickedRequest()
        function logSubClickedEduMaterial(EducationalMaterialTOCSerNum){

            if (loggingEnabled) {
                return sendLogPatientActionRequest('CLICKED', 'EducationalMaterialTOC', EducationalMaterialTOCSerNum)
                // // For testing
                // .then((res)=>{
                //     console.log(res);
                //     // console.log('Clicked on sub material '+EducationalMaterialTOCSerNum);
                //     ons.notification.alert({message:"Successfully wrote CLICKED in DB for EducationalMaterialTOCSerNum="+EducationalMaterialTOCSerNum});
                // })
                // .catch((err)=>{
                //     console.log('Error in logSubClickedEduMaterial for EducationalMaterialTOCSerNum='+EducationalMaterialTOCSerNum);
                //     console.log(err);
                // });
            }
        }

        // Logs when a user clicks on an educational material's pdf button to view or download the pdf.
        // Author: Stacey Beard
        function logClickedPdfEduMaterial(EducationalMaterialControlSerNum){

            if (loggingEnabled) {
                return sendLogPatientActionRequest('CLICKED_PDF', 'EducationalMaterialControl', EducationalMaterialControlSerNum)
                // // For testing
                // .then((res)=>{
                //     console.log(res);
                //     ons.notification.alert({message:"Successfully wrote CLICKED_PDF in DB for EducationalMaterialControlSerNum="+EducationalMaterialControlSerNum});
                // })
                // .catch((err)=>{
                //     console.log("Error in logClickedPdfEduMaterial for EducationalMaterialControlSerNum="+EducationalMaterialControlSerNum);
                //     console.log(err);
                // });
            }
        }

        // Logs when a user clicks back from an educational material.
        // Author: Tongyou (Eason) Yang, modified by Stacey Beard
        // Previously called writeClickedBackRequest()
        function logClickedBackEduMaterial(EducationalMaterialControlSerNum){

            if (loggingEnabled) {
                return sendLogPatientActionRequest('CLICKED_BACK', 'EducationalMaterialControl', EducationalMaterialControlSerNum)
                // // For testing
                // .then((res)=>{
                //     console.log(res);
                //     ons.notification.alert({message:"Successfully wrote CLICKED_BACK in DB for EducationalMaterialControlSerNum="+EducationalMaterialControlSerNum});
                // })
                // .catch((err)=>{
                //     console.log("Error in logClickedBackEduMaterial for EducationalMaterialControlSerNum="+EducationalMaterialControlSerNum);
                //     console.log(err);
                // });
            }
        }

        // Logs when a user clicks back from an educational sub-material (material contained in a booklet).
        // Author: Tongyou (Eason) Yang, modified by Stacey Beard
        // Previously called writeSubClickedBackRequest()
        function logSubClickedBackEduMaterial(EducationalMaterialTOCSerNum){

            if (loggingEnabled) {
                return sendLogPatientActionRequest('CLICKED_BACK', 'EducationalMaterialTOC', EducationalMaterialTOCSerNum)
                // // For testing
                // .then((res)=>{
                //     console.log(res);
                //     ons.notification.alert({message:"Successfully wrote CLICKED_BACK in DB for EducationalMaterialTOCSerNum="+EducationalMaterialTOCSerNum});
                // })
                // .catch((err)=>{
                //     console.log("Error in logSubClickedBackEduMaterial for EducationalMaterialTOCSerNum="+EducationalMaterialTOCSerNum);
                //     console.log(err);
                // });
            }
        }

        // Logs when a user scrolls to the bottom of an educational material.
        // Author: Tongyou (Eason) Yang, modified by Stacey Beard
        // Previously called writeScrollToBottomRequest()
        function logScrolledToBottomEduMaterial(EducationalMaterialControlSerNum){

            if (loggingEnabled) {
                return sendLogPatientActionRequest('SCROLLED_TO_BOTTOM', 'EducationalMaterialControl', EducationalMaterialControlSerNum)
                // // For testing
                // .then((res)=>{
                //     console.log(res);
                //     ons.notification.alert({message:"Successfully wrote SCROLLED_TO_BOTTOM in DB for EducationalMaterialControlSerNum="+EducationalMaterialControlSerNum});
                // })
                // .catch((err)=>{
                //     console.log("Error in logScrolledToBottomEduMaterial for EducationalMaterialControlSerNum="+EducationalMaterialControlSerNum);
                //     console.log(err);
                // });
            }
        }

        // Logs when a user scrolls to the bottom of an educational sub-material (material contained in a booklet).
        // Author: Tongyou (Eason) Yang, modified by Stacey Beard
        // Previously called writeSubScrollToBottomRequest()
        function logSubScrolledToBottomEduMaterial(EducationalMaterialTOCSerNum){

            if (loggingEnabled) {
                return sendLogPatientActionRequest('SCROLLED_TO_BOTTOM', 'EducationalMaterialTOC', EducationalMaterialTOCSerNum)
                // // For testing
                // .then((res)=>{
                //     console.log(res);
                //     ons.notification.alert({message:"Successfully wrote SCROLLED_TO_BOTTOM in DB for EducationalMaterialTOCSerNum="+EducationalMaterialTOCSerNum});
                // })
                // .catch((err)=>{
                //     console.log("Error in logSubScrolledToBottomEduMaterial for EducationalMaterialTOCSerNum="+EducationalMaterialTOCSerNum);
                //     console.log(err);
                // });
            }
        }

        // --- END OF EDUCATIONAL MATERIAL LOGGING --- //

    }

})();

