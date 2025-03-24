import "../../css/directives/top-page-banner.directive.css";
(function () {
    'use strict';

    /**
     * This directive is used for Transition All in One and All in One (i.e. multi-institutional expansion of Opal)
     * It is used in
     *      www/views/settings/settings.html
     *      www/views/home/home.html
     *      www/views/personal/education/education.html
     *      www/views/personal/personal.html
     *      www/views/general/general.html
     */
    angular
        .module('OpalApp')
        .directive('topPageBanner', topPageBanner);

    topPageBanner.$inject = [];

    /* @ngInject */
    function topPageBanner() {
        var directive = {
            restrict: 'E',
            scope: {
                barTitle: '=title'
            },
            template: "<div class='top-bar'>{{barTitle|translate}}</div>"
        };
        return directive;
    }
})();

