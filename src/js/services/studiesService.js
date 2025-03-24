/*
 * Filename     :   studiesService.js
 * Description  :   Service that store and manages the studies information.
 * Created by   :   Kayla O'Sullivan-Steben
 * Date         :   March 2021
 */
(function () {
    angular
        .module('MUHCApp')
        .service('Studies', StudiesService);

    StudiesService.$inject = ['RequestToServer', '$filter', '$q'];

    function StudiesService(RequestToServer, $filter, $q) {

        var studies = [];

        return {
            getNumberUnreadStudies: getNumberUnreadStudies,
            getStudies: getStudies,
            getStudiesList: getStudiesList,
            readStudy: readStudy,
            updateConsentStatus: updateConsentStatus
        };


        /**
         * @name getStudies
         * @desc Requests the list of all studies from the listener and stores it in the studies array.
         * @return {promise} 
         */
        async function getStudies() {
            try {
                let response = await RequestToServer.sendRequestWithResponse('Studies');

                // check if response contains studies
                if (!response?.Data?.studies) return;

                studies = response.Data.studies;

                studies.forEach(function (study) {
                    study.creationDate = $filter('formatDate')(study.creationDate)
                    if (study?.startDate) {
                        study.startDate = $filter('formatDate')(study.startDate)
                    }
                    if (study?.endDate) {
                        study.endDate = $filter('formatDate')(study.endDate)
                    }
                });
            } catch (error) {
                console.log('Error in getStudies: ', error);
                return [];
            }

        }


        /**
         * @name updateConsentStatus
         * @desc Updates the consent status for the study corresponding to the given consent form Id.
         * @param {int} questionnaireId The ID of the consent form (questionnaire Id in QuestionnaireDB).
         * @param {string} status The consent status submitted, either "opalConsented" or "declined".
         * @return {promise} 
         */
        function updateConsentStatus(questionnaireId, status) {
            var q = $q.defer();

            let params = {
                questionnaire_id: questionnaireId,
                status: status
            }

            RequestToServer.sendRequestWithResponse('StudyUpdateStatus', params)
                .then(function (response) {
                    q.resolve({ Success: true, Location: 'Server' });
                })
                .catch(function (err) {
                    q.reject({ Success: false, Location: '', Error: err });
                });

            return q.promise;
        }

        /**
        * @name getStudiesList
        * @desc Returns the current list of studies.
        * @return {Array} Array of studies.
        */
        function getStudiesList() {
            return studies;
        }

        /**
         *@name readStudy
         *@desc Updates the ReadStatus of a study in studies array and sends request to backend
         *@param {int} patientStudyId ID of the study in the patientStudy table to be read
         **/
        function readStudy(patientStudyId) {
            for (var i = 0; i < studies.length; i++) {
                if (studies[i].patientStudyId == patientStudyId) {
                    studies[i].ReadStatus = '1';
                    RequestToServer.sendRequest('Read', { 'Id': patientStudyId, 'Field': 'patientStudy' });
                }
            }
        }

        /**
         * @name getNumberUnreadStudies
         * @description Iterates through the studies array and returns the number of unread studies.
         * @returns {Number} Returns number of unread studies
         **/
        function getNumberUnreadStudies() {
            let number = 0;
            for (let i = 0; i < studies.length; i++) {
                if (studies[i].ReadStatus === '0') number++;
            }

            return number;
        }
    }
})();
