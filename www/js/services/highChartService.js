//
// Author Anton Gladyr on Summer 2018, Email: anton.gladyr@gmail.com
//

/**
 *@ngdoc service
 *@name MUHCApp.service:HighChartService
 *@requires MUHCApp.service:UserPreferences
 *@description Factory service is used to return JSONs with different types of a chart for HighCharts library
 **/

(function() {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('HighChartService', HighChartService);

    HighChartService.$inject = ['UserPreferences'];

    /* @ngInject */
    function HighChartService(UserPreferences) {

        var service = {
            getJSONForLineChart: getJSONForLineChart,
            configureFrenchCharts: configureFrenchCharts
        };
        return service;

        /**
         *ngdoc method
         *@name getJSONForLineChart
         *@methodOf MUHCApp.service:HighChartService
         *@param {String} title which displays in chart
         *@param {Array} scores for displaying a graph
         *@description Returns JSON for line chart
         */
        function getJSONForLineChart(title, scores) {
            var windowWidth = $(window).width();
            // Reformat scores for highcharts library
            var questionnaireScores = [];
            for (var item in scores) {
                var dateScore = [];  //array to store pairs of [date, score]
                dateScore[0] = Date.parse(scores[item].last_updated);
                dateScore[1] = parseFloat(scores[item].score);
                questionnaireScores.push(dateScore);
            }
            if (title.length > 75) {
                title = title.substring(0, 75) + '...';
            }
            return {
                rangeSelector: {
                    enabled: true,
                    //select all as default button
                    selected: 4,
                    buttonSpacing: 14,
                    buttons: [{
                        type: 'month',
                        count: 1,
                        text: '1month'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3month'
                    }, {
                        type: 'month',
                        count: 6,
                        text: '6month'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1year'
                    }, {
                        type: 'all',
                        text: 'All'
                    }],
                    buttonTheme: {
                        width: null
                    }
                },
                chart: {
                    width: windowWidth,
                    height: null,
                    zoomType: 'xy'
                },
                exporting: {
                    enabled: true,
                    buttons: {
                        contextButton: {
                            fallbackToExportServer: false,
                            enabled: true,
                            menuItems: ['printChart', 'separator', 'downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG']
                        }
                    }
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: { // don't display the dummy year
                        month: '%e. %b',
                        year: '%b'
                    },
                    title: {
                        text: 'Date'
                    },
                    labels: {
                        style: {
                            fontSize: '15px'
                        }
                    }
                },
                yAxis: {
                    max: 100,
                    min: 0,
                    title: {
                        text: '\%'
                    },
                    opposite: false,
                    tickInterval: 10,
                    labels: {
                        style: {
                            fontSize: '15px'
                        }
                    }
                },
                title: {
                    text: title,
                    align: 'center'
                },
                plotOptions: {
                    series: {
                        fillOpacity: 0.1
                    }
                },
                series: [{
                    showInNavigator: true,
                    name: 'Score',
                    data: questionnaireScores,
                    marker: {
                        enabled: true,
                        radius: 3
                    },
                    type: 'area',
                    color: 'rgba(21, 148, 187, 0.65)',
                    pointWidth: 100,
                    tooltip: {
                        valueDecimals: 0
                    }
                }]
            };
        }


        /**
         *@ngdoc method
         *@name configureFrenchCharts
         *@methodOf MUHCApp.service:HighChartService
         *@description Configures charts for French language
         */
        function configureFrenchCharts() {
            return {
                lang: {
                    months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
                    weekdays: ['dimanche', 'lundi', 'lardi', 'mercredi',
                        'jeudi', 'vendredi', 'samedi'],
                    shortMonths: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.',
                        'août', 'sept.', 'oct.', 'nov.', 'déc'],
                    decimalPoint: ',',
                    downloadPNG: 'Télécharger en image PNG',
                    downloadJPEG: 'Télécharger en image JPEG',
                    downloadPDF: 'Télécharger en document PDF',
                    downloadSVG: 'Télécharger en document Vectoriel',
                    exportButtonTitle: 'Export du graphique',
                    loading: 'Chargement en cours...',
                    printChart: 'Imprimer le graphique',
                    resetZoom: 'Réinitialiser le zoom',
                    resetZoomTitle: 'Réinitialiser le zoom au niveau 1:1',
                    thousandsSep: ' '
                }
            };
        }
    }
})();