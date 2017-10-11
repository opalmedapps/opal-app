/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-19
 * Time: 10:06 AM
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualParkingController', IndividualParkingController);

    IndividualParkingController.$inject = ['NavigatorParameters', 'UserPreferences', '$scope'];

    /* @ngInject */
    function IndividualParkingController(NavigatorParameters, UserPreferences, $scope) {

        var vm = this;

        activate();

        //////////////////////////

        function activate(){

            vm.loading = true;
            var language = UserPreferences.getLanguage().toUpperCase();
            var parkingInformation = {
                'EN':{
                    'general':{
                        title:"Parking",
                        link:"https://www.depdocs.com/opal/parking/parking.php"
                    },
                    'oncology':{
                        title:"Oncology Parking",
                        link:"https://www.depdocs.com/opal/parking/oncology_parking.php"
                    }
                },
                'FR':{
                    'general':{
                        title:"Stationnement",
                        link:"https://www.depdocs.com/opal/parking/stationnement.php"
                    },
                    'oncology':{
                        title:"Stationnement Radiothérapie",
                        link:"https://www.depdocs.com/opal/parking/radiotherapie_stationnement.php"
                    }
                }
            };

            var parameters = NavigatorParameters.getParameters();
            vm.title = parkingInformation[language][parameters.type].title;
            var link = parkingInformation[language][parameters.type].link;
            $.get(link)
                .then(function(res){
                    console.log(link);
                    res.replace(/(\r\n|\n|\r)/gm, " ");
                    vm.loading=false;
                    vm.htmlBind=res;
                    $scope.$apply();
                });
        }
    }
})();
