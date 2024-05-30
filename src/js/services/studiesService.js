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

    StudiesService.$inject = ['RequestToServer', '$filter', '$q', 'Params'];

    function StudiesService(RequestToServer, $filter, $q, Params) {

        var studies = [];

        return {
            getStudies: getStudies,
            getStudiesList: getStudiesList,
            readStudy: readStudy,
            updateConsentStatus: updateConsentStatus,
            createDatabankConsent: createDatabankConsent
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
                if (!response?.Data?.studies) return [];

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

                return studies;
            } catch (error) {
                console.error('Error in getStudies: ', error);
                return [];
            }

        }

        /**
         * @name createDatabankConsent
         * @desc Trigger creation of a new databank consent in Django.
         *       Default for all modules is true during databank phase 1.
         * @param {string} patientUUID The Django uuid of the currently selected patient
         * @param {JSON} consent_questionnaire_response Patient completed response to the consent form
         */
        async function createDatabankConsent(patient_uuid, consent_questionnaire_response) {
            let data = {
                "has_appointments": true,
                "has_questionnaires": true,
                "has_labs": true,
                "has_diagnoses": true,
                "has_demographics": true,
                "middle_name": "",
                "city_of_birth": "",
                "health_data_authorization": "",
                "contact_authorization": ""
            };
            // Extract the responses for the consent validation and GUID generation in Django
            consent_questionnaire_response.sections.forEach(section => {
                section.questions.forEach(question => {
                    if (/middle\s*name/i.test(question.question_display)) {
                        data.middle_name = question.patient_answer.answer[0].answer_value;
                    } else if (/city\s*of\s*birth/i.test(question.question_display)) {
                        data.city_of_birth = question.patient_answer.answer[0].answer_value;
                    } else if (/authorization\s*for\s*health\s*information/i.test(question.question_display)) {
                        data.health_data_authorization = question.patient_answer.answer[0].answer_option_text;
                    } else if (/authorization\s*for\s*qscc\s*databank/i.test(question.question_display)) {
                        data.contact_authorization = question.patient_answer.answer[0].answer_option_text;
                    }
                });
            });
            const requestParams = Params.API.ROUTES.DATABANK_CONSENT;
            const formattedParams = {
                ...requestParams,
                url: requestParams.url.replace('<PATIENT_UUID>', patient_uuid),
            };

            try {
                let result = await RequestToServer.apiRequest(formattedParams, JSON.stringify(data));
            } catch (error) {
                console.error('Error creating databank consent', error);
            }
        }

        /**
         * @name updateConsentStatus
         * @desc Updates the consent status for the study corresponding to the given consent form Id.
         * @param {int} questionnaireId The ID of the consent form (questionnaire Id in QuestionnaireDB).
         * @param {string} status The consent status submitted, either "opalConsented" or "declined".
         * @return {promise} 
         */
        async function updateConsentStatus(questionnaireId, status) {
            let params = {
                questionnaire_id: questionnaireId,
                status: status
            };

            try {
                let response = await RequestToServer.sendRequestWithResponse('StudyUpdateStatus', params);
                return { Success: true, Location: 'Server' };
            } catch (error) {
                throw { Success: false, Location: '', Error: error };
            }
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
    }
})();
