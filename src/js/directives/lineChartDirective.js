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

          // Remove listeners on destroy
          scope.$on('$destroy', function() {
              $window.removeEventListener("orientationchange", resizeChart);
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
                  // console.log(screen.orientation.type); // Portrait or landscape

                  /* Update the chart with its new size (more Highcharts options can be passed in the same
                   * function call if needed).
                   * By default, the chart is redrawn with an animation.
                   */
                  chart.update({
                      chart: {
                          width: $window.innerWidth,
                          height: null,
                      },
                  });

                  // This is an alternate method that can be used instead to resize the chart:
                  // chart.setSize($window.innerWidth, null, true);
              }, 500);
          }
      }

    }
  }
]);
