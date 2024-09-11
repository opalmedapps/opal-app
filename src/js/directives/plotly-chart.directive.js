import Plotly from 'plotly.js-dist';

angular.module('MUHCApp')
  .directive('plotlyChart', ['$window', function($window) {
    return {
      restrict: 'E',
      template: '<div></div>',
      scope: {
        options: '='
      },
      link: function (scope, element) {
        var data = [{
          x: ['2013-10-04 22:23:00', '2013-11-04 22:23:00', '2013-12-04 22:23:00', '2014-01-04 10:23:00'],
          y: [10, 15, 13, 17],
          type: 'scatter'
        }];

        var selectorOptions = {
            buttons: [{
                step: 'month',
                stepmode: 'backward',
                count: 1,
                label: '1m'
            }, {
                step: 'month',
                stepmode: 'backward',
                count: 6,
                label: '6m'
            }, {
                step: 'year',
                stepmode: 'todate',
                count: 1,
                label: 'YTD'
            }, {
                step: 'year',
                stepmode: 'backward',
                count: 1,
                label: '1y'
            }, {
                step: 'all',
            }]
        };        

        var layout = {
            showlegend: false,
            autosize: true,
            xaxis: {
              showgrid: false,
              zeroline: false,
              fixedrange: true,
              rangeselector: selectorOptions,
              rangeslider: {}
            },
            yaxis: {
              showline: false,
              fixedrange: true
            },
            margin: {
              b: 30,
              l: 30,
              r: 30,
              t: 30
            },
            width: $(window).innerWidth()
          };

        var config = {
          displayModeBar: false,
          responsive: false,
          displaylogo: false,
          responsive: true
        };

        Plotly.newPlot(element[0], data, layout, config);

        // Add a listener to resize the chart when the screen is rotated
        // NOTE: orientationchange event is deprecated, however it might be still used by browsers with older versions.
        // Browsers with newer versions provide 'change' event of the ScreenOrientation interface.
        // See: https://developer.mozilla.org/en-US/docs/Web/API/Window/orientationchange_event
        $window.addEventListener("orientationchange", resizeChart);
        $window.addEventListener("change", resizeChart);
        $window.addEventListener("resize", resizeChart);

        // Remove listeners on destroy
        scope.$on('$destroy', function() {
            $window.removeEventListener("orientationchange", resizeChart);
            $window.removeEventListener("change", resizeChart);
            $window.removeEventListener("resize", resizeChart);
        });

        /**
         * @description Resizes the chart based on the screen size.
         */
        function resizeChart() {
          // Update the chart with its new size
          Plotly.relayout(element[0], {width: $window.innerWidth});
        }
      }
    }
  }
]);
