/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-14
 * Time: 2:09 PM
 */


/**
 * @name EducationalMaterialSinglePageController
 * @description Once the material has gone through the first show page, this controller is in charge of opening the material that is simple a individual html page, such as the charter and such and its not a table of
 * contents. Or in backend language is a parent element without a table of contents and simple material content.
 *
 */
myApp.controller('EducationalMaterialSinglePageController', ['$scope', '$timeout', 'NavigatorParameters', 'EducationalMaterial', function ($scope, $timeout, NavigatorParameters, EducationalMaterial) {
    //Obtaining educational material and other parameters such as the navigatorName
    var parameters = NavigatorParameters.getParameters();
    var material = parameters.Booklet;
    var navigatorName = parameters.Navigator;

    //Setting the educational material
    $scope.edumaterial = material;

    //Ajax call to obtain material
    $.get(material.Url, function (res) {

        $timeout(function () {
            //Sets content variable for material and hides loading
            $scope.edumaterial.Content = res;
        });

    });
}]);