import Plotly from 'plotly.js-dist';
import locale from 'plotly.js-locales/fr'

const fontSizesMap = {
  medium: 12,
  large: 14,
  xlarge: 18
}

angular.module('MUHCApp')
  .directive('plotlyChart', ['$window', '$filter', 'UserPreferences', function($window, $filter, UserPreferences) {
    return {
      restrict: 'E',
      template: '<div></div>',
      scope: {
        data: '=',
        yAxisLabel: '='
      },
      link: function (scope, element) {
        const data = [{
          ...scope.data,
          mode: 'scatter'
        }];

        const selectorOptions = {
            buttons: [{
                step: 'month',
                stepmode: 'backward',
                count: 1,
                label: $filter('translate')('CHART_ONE_MONTH_SELECTOR')
            }, {
                step: 'month',
                stepmode: 'backward',
                count: 3,
                label: $filter('translate')('CHART_THREE_MONTHS_SELECTOR')
            }, {
                step: 'month',
                stepmode: 'backward',
                count: 6,
                label: $filter('translate')('CHART_SIX_MONTHS_SELECTOR')
            }, {
                step: 'year',
                stepmode: 'backward',
                count: 1,
                label: $filter('translate')('CHART_YEAR_SELECTOR')
            }, {
                step: 'all',
                label: $filter('translate')('CHART_ALL_RANGE_SELECTOR')
            }],
            x: 1,  // Position horizontally
            xanchor: 'right'  // Align the buttons to the right side
        };        

        const layout = {
            title: {
              text: scope.yAxisLabel,
              x: 0,     // x position with respect to `xref` in normalized coordinates from "0" (left) to "1" (right).
              y: 0.96,  // y position with respect to `yref` in normalized coordinates from "0" (bottom) to "1" (top).
              xanchor: 'left',
              yanchor: 'top',
            },
            font: {
              size: fontSizesMap[UserPreferences.getFontSize()]
            },
            dragmode: false,
            showlegend: false,
            autosize: true,
            xaxis: {
              autorange: true,
              showgrid: false,
              zeroline: true,
              fixedrange: true,
              rangeselector: selectorOptions,
              rangeslider: {},
              type: 'date',
              tickformat: '%e %b %y'  // date format
            },
            yaxis: {
              showline: false,
              fixedrange: true
            },
            margin: {
              b: 10,
              l: 30,
              r: 10,
              t: 30,
            },
            width: $(window).innerWidth()
          };

        const config = {
          displayModeBar: false,
          responsive: true,
          scrollZoom: true,
          locale: UserPreferences.getLanguage().toLowerCase()
        };

        Plotly.register(locale);
        Plotly.newPlot(element[0].firstChild, data, layout, config);

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
          Plotly.relayout(element[0].firstChild, {width: $window.innerWidth});
        }
      }
    }
  }
]);
