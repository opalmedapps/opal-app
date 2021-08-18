/*
 * Filename     :   studiesService.js
 * Description  :   Service that store and manages the studies information.
 * Created by   :   Kayla O'Sullivan-Steben
 * Date         :   March 2021
 */
(function()
{
    angular
    .module('MUHCApp')
    .service('Studies', StudiesService);

    StudiesService.$inject = ['RequestToServer','$filter','$q'];

    function StudiesService(RequestToServer, $filter, $q) {
              
        var studies = [];


        let service = {
            getStudies:getStudies,
            getStudiesList:getStudiesList,
            readStudy:readStudy,
            updateConsentStatus:updateConsentStatus
        };
        return service;


        /**
         * @name getStudies
         * @desc Requests the list of all studies from the listener and stores it in the studies array.
         * @return {promise} 
         */
        function getStudies(){
            var q = $q.defer();
            RequestToServer.sendRequestWithResponse('Studies')
                .then(function (response) {
                    studies = response.Data;
                    q.resolve(studies);
                    
                    if(typeof studies =='undefined') return ;

                    studies.forEach(function(study){
                        study.creationDate = $filter('formatDate')(study.creationDate)
                        if (study.hasOwnProperty('startDate')){
                            study.startDate = $filter('formatDate')(study.startDate)
                        }
                        if (study.hasOwnProperty('endDate')){
                            study.endDate = $filter('formatDate')(study.endDate)
                        }
                    })
                }).catch(function (error){
                    console.log('Error in getStudies: ', error);
                    q.resolve([]);
                });

            return q.promise;
        }


        /**
         * @name updateConsentStatus
         * @desc Updates the consent status for the study corresponding to the given consent form Id.
         * @param {int} questionnaireId The ID of the consent form (questionnaire Id in QuestionnaireDB).
         * @param {string} status The consent status submitted, either "opalConsented" or "declined".
         * @return {promise} 
         */
        function updateConsentStatus(questionnaireId, status){
            var q = $q.defer();

            let params = {
                questionnaire_id: questionnaireId,
                status: status
            }

            RequestToServer.sendRequestWithResponse('StudyUpdateStatus', params)
                .then(function (response){
                    q.resolve({Success: true, Location: 'Server'});
                })
                .catch(function(err){
                    q.reject({Success: false, Location: '', Error: err});
                });

            return q.promise;
        }

        /**
        * @name getStudiesList
        * @desc Returns the current list of studies.
        * @return {Array} Array of studies.
        */
        function getStudiesList(){
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
                    RequestToServer.sendRequest('Read', {'Id': patientStudyId, 'Field': 'patientStudy'});
                }
            }
        }
    }
})();

