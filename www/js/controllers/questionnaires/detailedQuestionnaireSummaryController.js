// entitySummaryController

var app = angular.module('MUHCApp');
app.controller('detailedQuestionnaireSummaryController', [
    '$scope',
    '$rootScope',
    'Questionnaires',
    'UserPreferences',
    '$location',
    'NavigatorParameters',
    '$filter',
    '$timeout',
    function ($scope, $rootScope, Questionnaires, UserPreferences, $location, NavigatorParameters, $filter, $timeout) {
        $scope.loading = true;

        var vm = this;
        // vm.entity.sections.question
        // vm.goToGlobalScoreHistory()
        // vm.goToSectionScoreHistory(section)
        // vm.goToQuestionScoreHistory(question)
        vm.expandTotalScore = false;
        vm.expandSectionScore = false;
        vm.expandSectionScores = [];
        vm.expandQuestionScore = false;
        vm.historicalQuestionnaires = [];
        vm.questionnaireScores = [];
        vm.importantInfo = [];
        vm.algorithms = []; // {ser_num, nickname, version}
        vm.chart = {};

        activate();

        function activate() {
            $scope.line = false;
            $scope.histogram = false;
            var default_alg = {ser_num: "default", title: $filter('translate')("Default"), nickname: $filter('translate')("Default")};
            $scope.algo = "default";
            var params = NavigatorParameters.getParameters();
            vm.questionnaire = params.questionnaire;
            Questionnaires.requestHistoricalQuestionnaires(vm.questionnaire.title)
                .then(function () {
                    vm.historicalQuestionnaires = Questionnaires.getHistoricalQuestionnaires();
                    // for (section in vm.historicalQuestionnaires.sections) {
                    //     vm.historicalQuestionnaires.sections[section].isExpanded  = false;
                    //     for (question in vm.historicalQuestionnaires.sections[section].questions) {
                    //         vm.historicalQuestionnaires.sections[section].questions[question].isExpanded  = false;
                    //     }
                    // }

                    for (section in vm.historicalQuestionnaires.sections) {
                        vm.expandSectionScores.push(false);
                    }

                    vm.questionnaireScores = vm.historicalQuestionnaires.scoresForQuestionnaire;
                    vm.algorithms = [default_alg].concat(params.algorithms);
                    importantInfo();
                    configureCharts();
                    vm.expandTotalScore = true;
                    $scope.loading = false;
                    // Questionnaires.requestAlgorithms(vm.entity.ser_num)
                    //     .then(function () {
                    //             vm.algorithms = Questionnaires.getAlgorithms();
                    //             $scope.loading = false;
                    //         }
                    //     );
                });
        }

        vm.setLine = function(scores, title, id) {
            drawLineChart(scores, title, id);
        };


        vm.exportChart = function() {
            var d = new Date();
            var timestr = d.getFullYear()+"_"+d.getMonth()+"_"+d.getDate()+"_"+d.getHours()+"_"+d.getMinutes()+"_"+d.getSeconds();
            var algstr = $("select option:selected").text();
            var nicknamestr = (vm.entity.nickname+"_"+algstr).replace(new RegExp(' ',"g"), '_');
            // PROBLEM: it goes through external server, offline export does not work here. Maybe try a local exporting server.

            vm.chart.exportChart({
                type: 'application/pdf',
                filename: nicknamestr+"_"+timestr,
                sourceHeight: 500,
                sourceWidth:750
            },{
                xAxis: {
                    labels: {
                        fontSize: '30px'
                    }
                },
                yAxis: {
                    labels: {
                        fontSize: '30px'
                    }
                }
            });
        };

        function importantInfo () {
            //Same for either questionnaire section because it's out of 100!
            //flag results that are 70% or higher
            // Flag results whose values have changed by 50% or 75%
            var i = vm.questionnaireScores.length-1;
            if (vm.questionnaireScores[i] >= 70) {
                note = "Current section score is " + vm.questionnaireScores[i] + "." ;
                vm.importantInfo.push(note);
            }
            if(vm.questionnaireScores[i] - vm.questionnaireScores[i-1] >= 50){
                note = "Section score increased by 50% since last timepoint.";
                vm.importantInfo.push(note);
            }
            else if(vm.questionnaireScores[i] - vm.questionnaireScores[i-1] <= -50) {
                note = "Section score improved by 50% since last timepoint.";
                vm.importantInfo.push(note);
            }
            if(vm.questionnaireScores[i] - vm.questionnaireScores[i-1] >= 75) {
                note = "Section score increased by 75% within two timepoints.";
                vm.importantInfo.push(note);
            }
            else if(vm.questionnaireScores[i] - vm.questionnaireScores[i-1] <= -75) {
                note = "Section score improved by 75% within two timepoints.";
                vm.importantInfo.push(note);
            }
            if(vm.questionnaireScores[i] - vm.questionnaireScores[0] >= 50) {
                note = "Section score increased by 50% since initial assessment.";
                vm.importantInfo.push(note);
            }
            else if(vm.questionnaireScores[i] - vm.questionnaireScores[0] <= -50) {
                note = "Section score increased by 50% since initial assessment.";
                vm.importantInfo.push(note);
            }

            if (importantInfo.length == 0) {
                vm.importantInfo = [];
                note = "There are no significant score changes to report.";
                vm.importantInfo.push(note);
            }
        }

        function configureCharts() {

            if (UserPreferences.getLanguage().toUpperCase() === 'FR')
            {
                Highcharts.setOptions({
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
                });
                Highcharts.dateFormat('%e%a');
            }

            Highcharts.setOptions({
                lang: {
                    //Zoom replaced with Date Range
                    rangeSelectorZoom:''
                }
            });
        }

        function drawLineChart(scores, title, id) {
            var reformedData = [];
            for(var i = 0; i < scores.length; i++)
            {
                var dv = [];  //array to store pairs of [date, testResult]
                dv[0] = Date.parse(scores[i].last_updated);  //dateArray[0] = most recent date
                dv[1] = parseFloat(scores[i].score);
                reformedData.push(dv);
            }

            /*********************************************
             * FINDING THE MAX AND MIN VALUES FOR CHARTING
             *********************************************/
            var maxChart = 100;
            var minChart = 0;

            windowWidth = $(window).width();

            vm.chart = new Highcharts.stockChart({
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
                    renderTo: id,
                    // Explicitly tell the width and height of a chart
                    width: windowWidth,
                    height: null,
                    zoomType: 'xy'
                },
                exporting: {
                    enabled: true,
                    buttons: {
                        contextButton: {
                            enabled: false,
                            // menuItems: ['downloadJPEG','downloadPDF','downloadPNG','downloadSVG','separator','printChart']
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
                    max: maxChart,
                    min: minChart,
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
                    align: 'center',
                },
                plotOptions: {
                    series: {
                        fillOpacity: 0.1
                    }
                },
                series: [{
                    name: 'Score',
                    data: reformedData,
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
            });

        }





        vm.toggleExpandTotalScore = function(){
            vm.expandTotalScore = !vm.expandTotalScore; //toggle between true and false
        };

        vm.toggleExpandSectionScore = function(id){
            console.log(id);
            console.log(vm.expandSectionScores[id]);
            vm.expandSectionScores[id] = !vm.expandSectionScores[id];
            // vm.expandSectionScore = !vm.expandSectionScore; //toggle between true and false
        };

        vm.toggleExpandQuestionScore = function(question){
            vm.expandQuestionScore = !vm.expandQuestionScore; //toggle between true and false
        };


        // vm.goToGlobalScoreHistory = function () {
        //     NavigatorParameters.setParameters({
        //         Navigator: 'personalNavigator',
        //         questionnaireScores: vm.historicalQuestionnaires.scoresForQuestionnaire,
        //         questionnaireNickname: vm.questionnaire.nickname
        //         // algorithms: vm.algorithms
        //     });
        //     personalNavigator.pushPage('views/personal/questionnaires/globalScoreHistory.html', {animation: 'slide'});
        // };
        //
        // vm.goToSectionScoreHistory = function (selectedSection) {
        //     NavigatorParameters.setParameters({
        //         Navigator: 'personalNavigator',
        //         scoresForSection: selectedSection.scoresForSection,
        //         sectionTitle: selectedSection.title
        //         // entity: vm.entity,
        //         // section: selectedSection,
        //         // algorithms: vm.algorithms
        //     });
        //     personalNavigator.pushPage('views/personal/questionnaires/sectionScoreHistory.html', {animation: 'slide'});
        // };
        //
        // vm.goToQuestionScoreHistory = function (selectedSection, selectedQuestion) {
        //     NavigatorParameters.setParameters({
        //         Navigator: 'personalNavigator',
        //         scoresForQuestion: selectedQuestion.scoresForQuestion,
        //         questionLabel: selectedQuestion.text,
        //         question: selectedQuestion
        //         // entity: vm.entity,
        //         // section: selectedSection,
        //         // algorithms: vm.algorithms
        //     });
        //     personalNavigator.pushPage('views/personal/questionnaires/questionScoreHistory.html', {animation: 'slide'});
        // };
    }]);