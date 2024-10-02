import Plotly from 'plotly.js-basic-dist-min';
import frLocale from 'plotly.js-locales/fr';

const fontSizesMap = {
    medium: 12,
    large: 14,
    xlarge: 18
};

// Register the locales
Plotly.register([frLocale]);

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .directive('plotlyChart', plotlyChart);

    plotlyChart.$inject = ['$window', '$filter', 'UserPreferences'];

    function plotlyChart($window, $filter, UserPreferences) {
        return {
            restrict: 'E',
            template: `
                <div>
                    <div class="chart"></div>
                    <div ng-if="isChartEmpty">
                        <center style="margin: 100px 5px">{{noChartMessage}}</center>
                    </div>
                </div>
            `,
            scope: {
                data: '=',
                yAxisLabel: '=',
                hasNonNumericValues: '=',
                normalRangeMin: '=?',
                normalRangeMax: '=?'
            },
            link: function (scope, element) {
                scope.isChartEmpty = false;

                // Check if data has non numeric values
                if (scope.hasNonNumericValues) {
                    scope.isChartEmpty = true;
                    scope.noChartMessage = $filter('translate')('CHART_NON_NUMERIC_VALUES');
                    return;
                }

                // Check if data is empty
                if (
                    !scope.data ||
                    !scope.data.x ||
                    scope.data.x.length === 0 ||
                    !scope.data.y ||
                    scope.data.y.length === 0
                ) {
                    scope.isChartEmpty = true;
                    scope.noChartMessage = $filter('translate')('CHART_NO_PLOT_AVAILABLE');
                    return;
                }

                // Compute min and max values
                const yValues = scope.data.y;
                const minValue = Math.min(...yValues);
                const maxValue = Math.max(...yValues);

                // Compute y-axis bounds
                const normalRangeMin = scope.normalRangeMin !== undefined ? scope.normalRangeMin : minValue;
                const normalRangeMax = scope.normalRangeMax !== undefined ? scope.normalRangeMax : maxValue;

                const minChart = Math.min(minValue, normalRangeMin) * 0.95;
                const maxChart = Math.max(maxValue, normalRangeMax) * 1.05;

                const data = [{
                    ...scope.data,
                    mode: 'scatter',
                    fill: 'tonexty',
                    line: {
                        color: '#67B9D3'
                    },
                    fillcolor: '#67B9D333',
                    hovertemplate: $filter('translate')('RESULT') + ': <b>%{y:.2f}</b><br>' +
                        '<extra></extra>',
                    cliponaxis: false  // Prevent markers from being clipped
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
                    x: 1.05,  // Position horizontally
                    xanchor: 'right'  // Align the buttons to the right side
                };

                const layout = {
                    title: {
                        text: scope.yAxisLabel,
                        x: 0,     // x position with respect to `xref` in normalized coordinates from "0" (left) to "1" (right).
                        y: 0.96,  // y position with respect to `yref` in normalized coordinates from "0" (bottom) to "1" (top).
                        xanchor: 'left',
                        yanchor: 'top'
                    },
                    font: {
                        size: fontSizesMap[UserPreferences.getFontSize()],
                        color: '#000000', // High-contrast text color
                    },
                    dragmode: false,
                    showlegend: false,
                    autosize: true,
                    xaxis: {
                        autorange: true,
                        tickangle: -45,
                        fixedrange: true,
                        rangeselector: selectorOptions,
                        rangeslider: {},
                        type: 'date',
                        mirror: 'ticks',
                        gridcolor: '#eeeeee',
                        tickformat: '%e %b %y',  // date format
                        hoverformat: "%A, %b %d, %Y",
                        showspikes: true,
                        spikemode: 'across',
                        spikedash: 'dot',
                        spikethickness: 2,
                        spikecolor: 'grey'
                    },
                    yaxis: {
                        fixedrange: true,
                        zerolinecolor: '#eeeeee',
                        range: [minChart, maxChart],
                        mirror: 'ticks'
                    },
                    margin: {
                        b: 10,
                        l: 45,
                        r: 10,
                        t: 30
                    },
                    hoverlabel: {
                        font: {
                            size: fontSizesMap[UserPreferences.getFontSize()]
                        }
                    },
                    hovermode: "x"
                };

                const userLanguage = UserPreferences.getLanguage().toLowerCase();
                const supportedLocales = ['en', 'fr'];
                const locale = supportedLocales.includes(userLanguage) ? userLanguage : 'en';

                const config = {
                    displayModeBar: false,
                    responsive: true,
                    scrollZoom: true,
                    locale: locale
                };

                const chartElement = element[0].querySelector('.chart');
                Plotly.newPlot(chartElement, data, layout, config);

                // Clean up on destroy
                scope.$on('$destroy', function () {
                    Plotly.purge(chartElement);
                });
            }
        }
    }
})();
