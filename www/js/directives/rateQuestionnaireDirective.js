angular.module('MUHCApp')
    .directive('rateQuestionnaire', function(Patient, RequestToServer,NavigatorParameters) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                qp_ser_num: '=qpSerNum'
            },
            templateUrl: './views/personal/questionnaires/star-rating-template.html',
            link: function (scope, element) {

                initRater();

                function initRater()
                {
                    scope.tempRateSkip = false;
                    scope.rate = [];
                    scope.submitted = false;
                    scope.emptyRating = true;
                    scope.emptyComment = true;
                    for(var i = 0; i < 5;i++)
                    {
                        scope.rate.push({
                            'Icon':'ion-ios-star-outline'
                        });
                    }
                }
                scope.rateQuestionnaire = function(index)
                {
                    scope.emptyRating = false;
                    scope.ratingValue = index+1;
                    for(var i = 0; i < index+1;i++)
                    {
                        scope.rate[i].Icon = 'ion-star';
                    }
                    for(var i = index+1; i < 5;i++)
                    {
                        scope.rate[i].Icon = 'ion-ios-star-outline';
                    }
                    scope.tempRateSkip = false;
                    document.getElementById("mySkipped").checked = false;
                };
                scope.toggleSkip = function(isSkipped) {
                    if(!isSkipped) {
                        scope.tempRateSkip = true;
                        console.log('in toggleSkip1');
                        scope.starComment = '';
                        scope.ratingValue = 0;
                        scope.rateQuestionnaire(-1);
                        scope.emptyRating = true;
                        scope.emptyComment = true;
                        document.getElementById("mySkipped").checked = true;
                    } else {
                        scope.tempRateSkip = false;
                        document.getElementById("mySkipped").checked = false;
                        console.log('in toggleSkip2');
                    }
                };
                scope.submitRating = function(star_comment)
                {
                    if(typeof star_comment == 'undefined'){
                        star_comment = '';
                    }
                    var params = {
                        'qp_ser_num':scope.qp_ser_num,
                        'StarRating':scope.ratingValue,
                        'StarComment':star_comment
                    };
                    if(!scope.tempRateSkip) {
                        RequestToServer.sendRequest('QuestionnaireStarRating', params);
                        scope.submitted = true;
                        var personalNavigator = NavigatorParameters.getNavigator();
                        NavigatorParameters.setParameters({Navigator: 'personalNavigator'});
                        personalNavigator.replacePage('views/personal/questionnaires/questionnairesList.html', {animation: 'slide'});
                    } else {
                        var personalNavigator = NavigatorParameters.getNavigator();
                        NavigatorParameters.setParameters({Navigator: 'personalNavigator'});
                        personalNavigator.replacePage('views/personal/questionnaires/questionnairesList.html', {animation: 'slide'});
                    }
                }
            }
        };
    });