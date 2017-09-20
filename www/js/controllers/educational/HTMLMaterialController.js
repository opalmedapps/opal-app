/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-14
 * Time: 2:09 PM
 */


/**
 * @name HTMLMaterialController
 * @description Once the material has gone through the first show page, this controller is in charge of opening the material that is simple a individual html page, such as the charter and such and its not a table of
 * contents. Or in backend language is a parent element without a table of contents and simple material content.
 *
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('HTMLMaterialController', HTMLMaterialController);

    HTMLMaterialController.$inject = ['NavigatorParameters', 'EducationalMaterial'];

    /* @ngInject */
    function HTMLMaterialController(NavigatorParameters, EducationalMaterial) {
        var vm = this;

        var parameters;
        var material;
        var navigatorName;

        activate();
        ///////////////////////////

        function activate() {
            parameters = NavigatorParameters.getParameters();
            material = parameters.Booklet;
            navigatorName = parameters.Navigator;

            vm.edumaterial = material;

           EducationalMaterial.getContent()
               .then(function(response){
                   vm.edumaterial.Content = response;
               })
               .catch(function(error){
                   console.log(error);
                   // TODO: HANDLE THIS ERROR BETTER!!!
               })
        }
    }
})();