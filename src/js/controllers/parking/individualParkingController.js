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

    IndividualParkingController.$inject = ['NavigatorParameters', 'UserPreferences', '$scope', 'Params'];

    /* @ngInject */
    function IndividualParkingController(NavigatorParameters, UserPreferences, $scope, Params) {

        var vm = this;

        activate();

        //////////////////////////

        function activate(){

            vm.loading = true;
            var language = UserPreferences.getLanguage().toUpperCase();
            var parkingInformation = {
                'EN':{
                    'general':{
                        title: Params.general.generalParkingTitleEn,
                        link: Params.general.generalParkingUrl
                    },
                    'oncology':{
                        title: Params.oncology.oncologyParkingTitleEn,
                        link: Params.oncology.oncologyParkingUrlEn
                    }
                },
                'FR':{
                    'general':{
                        title: Params.general.generalParkingTitleFr,
                        link: Params.general.generalParkingUrl
                    },
                    'oncology':{
                        title: Params.oncology.oncologyParkingTitleFr,
                        link: Params.oncology.oncologyParkingUrlFr
                    }
                }
            };

            var parameters = NavigatorParameters.getParameters();
            vm.title = parkingInformation[language][parameters.type].title;
            var link = parkingInformation[language][parameters.type].link;
            $.get(link)
                .then(function(res){
                    res.replace(/(\r\n|\n|\r)/gm, " ");
                    vm.loading=false;
                    vm.htmlBind=res;
                    $scope.$apply();
                });
        }
    }
})();
