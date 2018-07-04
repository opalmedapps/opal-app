var app1 = angular.module('MUHCApp');
app1.controller('questionnairesListController', ['$scope', '$rootScope', 'Questionnaires', '$location', 'NavigatorParameters', '$timeout', function($scope, $rootScope, Questionnaires, $location, NavigatorParameters, $timeout) {

    $scope.loading = true;

    activate();

    function activate() {
        NavigatorParameters.setParameters({'Navigator':'personalNavigator'});
        NavigatorParameters.setNavigator(personalNavigator);

        Questionnaires.requestQuestionnaires()
            .then(function() {
                $scope.newQuestionnaireList = Questionnaires.getQuestionnaires('New');
                $scope.inProgressQuestionnaireList = Questionnaires.getQuestionnaires('In progress');
                console.log($scope.inProgressQuestionnaireList);
                $scope.completedQuestionnaireList = Questionnaires.getQuestionnaires('Completed');
                $scope.loading = false;
            });
    }

    $scope.goToQuestionnaire = function(selectedQuestionnaire) {
        var questionnaireToReturn = {};
        console.log("selectedQuestionnaire: ");
        console.log(selectedQuestionnaire);
        Questionnaires.requestQuestionnaire(selectedQuestionnaire.qp_ser_num)
            .then(function() {
                questionnaireToReturn = Questionnaires.getQuestionnaire();
                console.log("questionnaireToReturn: ");
                console.log(questionnaireToReturn);
                NavigatorParameters.setParameters({Navigator:'personalNavigator', questionnaire: questionnaireToReturn});
                personalNavigator.pushPage('views/personal/questionnaires/questionnaires.html',{ animation : 'slide' });
            });
    };

    $scope.goToQuestionnaireSummary = function(selectedQuestionnaire) {
        NavigatorParameters.setParameters({Navigator:'personalNavigator', questionnaire: selectedQuestionnaire});
        personalNavigator.pushPage('views/personal/questionnaires/answeredQuestionnaire.html',{ animation : 'slide' });
    };

    $scope.setNew = function() {
        $scope.new       = true;
        $scope.progress  = false;
        $scope.completed = false;
    }

    $scope.setProgress = function() {
        $scope.new       = false;
        $scope.progress  = true;
        $scope.completed = false;
    }

    $scope.setCompleted = function() {
        $scope.new       = false;
        $scope.progress  = false;
        $scope.completed = true;
    }


    $scope.getQuestionnaireCount = function(type){
        return Questionnaires.getQuestionnaireCount(type);
    };

}]);