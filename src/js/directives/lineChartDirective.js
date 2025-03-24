import Highcharts from 'highcharts/highstock';
import addMore from "highcharts/highcharts-more";
import addDrilldown from "highcharts/modules/drilldown";
import addNoData from "highcharts/modules/no-data-to-display";
import addExporting from "highcharts/modules/exporting";
addMore(Highcharts);
addDrilldown(Highcharts);
addNoData(Highcharts);
addExporting(Highcharts);

angular.module('MUHCApp')
  .directive('hcChart', ['$window', '$timeout', function($window, $timeout) {
    return {
      restrict: 'E',
      template: '<div></div>',
      scope: {
        options: '='
      },
      link: function (scope, element) {
          var chart = new Highcharts.stockChart(element[0], scope.options);

          // Add a listener to resize the chart when the screen is rotated
          $window.addEventListener("orientationchange", resizeChart);
          $window.addEventListener("resize", resizeChart);

          // Remove listeners on destroy
          scope.$on('$destroy', function() {
              $window.removeEventListener("orientationchange", resizeChart);
              $window.removeEventListener("resize", resizeChart);
          });

          /**
           * resizeChart
           * @author Stacey Beard
           * @date 2019-01-15
           * @desc Resizes the chart based on the screen size.
           */
          function resizeChart() {
              // A timeout is needed to give time for $window.innerWidth to be set.
              $timeout(function(){
                  // Portrait or landscape is saved in screen.orientation.type
                  // Update the chart with its new size (by default, the chart is redrawn with an animation)
                  chart.update({
                      chart: {
                          width: $window.innerWidth,
                      },
                  });
              }, 500);
          }
      }
    }
  }
]);
