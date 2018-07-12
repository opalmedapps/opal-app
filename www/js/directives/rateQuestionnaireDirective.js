/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/
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
                    }
                    RequestToServer.sendRequest('QuestionnaireStarRating', params);
                    scope.submitted = true;
                    var personalNavigator=NavigatorParameters.getNavigator();
                    NavigatorParameters.setParameters({Navigator:'personalNavigator'});
                    personalNavigator.replacePage('views/personal/questionnaires/questionnairesList.html',{ animation : 'slide' });
                }
            }
        };
    });