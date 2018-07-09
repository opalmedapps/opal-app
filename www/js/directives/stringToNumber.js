angular.module('MUHCApp', [])

    .run(function($rootScope) {
        $rootScope.typeOf = function(value) {
            return typeof value;
        };
    })

    .directive('stringToNumber', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function(value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function(value) {
                    return parseFloat(value);
                });
            }
        };
    });