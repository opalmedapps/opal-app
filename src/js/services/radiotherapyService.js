/*
 * Filename     :   radiotherapyService.js
 * Description  :   Service that store and manages the radiotherapy information.
 * Created by   :   Kayla O'Sullivan-Steben
 * Date         :   March 2021
 */
(function()
{
    angular
    .module('MUHCApp')
    .service('Radiotherapy', RadiotherapyService);

    RadiotherapyService.$inject = ['RequestToServer','$filter','$q'];

    function RadiotherapyService(RequestToServer, $filter, $q) {
              
        var dicomList = [];
        var dicomContent = [];

        let service = {
            getDicomContent: getDicomContent,
            requestRTDicoms: requestRTDicoms,
            requestRTDicomContent: requestRTDicomContent
        };
        return service;


        function requestRTDicoms(){
            var q = $q.defer();
            RequestToServer.sendRequestWithResponse('Dicom')
                .then(function (response) {
                    console.log(response)
                    dicomList = response.Data;
                    q.resolve(dicomList);             
                    
                    if(typeof dicomList =='undefined') return ;

                    dicomList.forEach(function(dicom){
                        dicom.DateAdded = $filter('formatDate')(dicom.DateAdded)
                    })
                }).catch(function (error){
                    console.log('Error in getRTDicoms: ', error);
                    q.resolve([]);
                });

            return q.promise

        }

        function requestRTDicomContent(DicomSerNum){
            var q = $q.defer();
            RequestToServer.sendRequestWithResponse('DicomContent', [DicomSerNum])
            .then(function(response){
                dicomContent = response.Data
                q.resolve(dicomContent)
            })
            console.log("HI")
            return q.promise
        }

        function getDicomContent(){
            return dicomContent;
        }

    }
})();

