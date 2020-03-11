(function () {
    'use strict';

    /**
     * This directive is used for Transition All in One and All in One (i.e. multi-institutional expansion of Opal)
     * It is used in
     *      www/views/settings/settings.html
     *      www/views/home/home.html
     *      www/views/education/education.html
     *      www/views/personal/personal.html
     *      www/views/general/general.html
     */
    angular
        .module('MUHCApp')
        .directive('hospitalNameBar', hospitalNameBar);

    hospitalNameBar.$inject = ['HospitalModulePermission'];

    /* @ngInject */
    function hospitalNameBar(HospitalModulePermission) {
        var directive = {
            link: link,
            restrict: 'E',
            scope: {},
            template: "<div style='text-align: center; font-weight: 600; line-height: 1; padding: 7px 10px; background-color: #F9F9F9; border-bottom: 1px solid #DDDDDD; font-size: 15px; position: sticky; top: 0; z-index: 100;'>{{hospitalFullName|translate}}</div>"
        };
        return directive;

        function link(scope) {
            scope.hospitalFullName = HospitalModulePermission.getHospitalFullName();
        }
    }
})();

