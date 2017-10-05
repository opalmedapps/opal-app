
angular.module('MUHCApp')
  .factory('highstock', [function() {
    return highstock;
  }])

  .directive('hcChart', ['$window', function($window) {
    return {
      restrict: 'E',
      template: '<div></div>',
      scope: {
        options: '='
      },
      link: function (scope, element) {
        var chart = new Highcharts.stockChart(element[0], scope.options);
      }

    }
  }
]);
