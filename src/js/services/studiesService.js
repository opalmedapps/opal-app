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


        return {

        getStudies:function(){
            var q = $q.defer();
                RequestToServer.sendRequestWithResponse('Studies')
                    .then(function (response) {
                        studies = response.Data;
                        q.resolve(studies);
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
    
                return q.promise
        }
    }}
})();

