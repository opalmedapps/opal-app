/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
var app1 = angular.module('MUHCApp');
app1.controller('questionnairesListController', function($scope, $rootScope, Questionnaires, $location, NavigatorParameters, $timeout) {

    console.log('started controller');
    $scope.loading = true;

    activate();

    function activate(){
        "use strict";

        if(!Questionnaires.isEmpty()){
            $scope.loading = false;
            $scope.questionnaires = Questionnaires.getPatientQuestionnaires().Questionnaires;
            $scope.patientQuestionnaires = Questionnaires.getPatientQuestionnaires().PatientQuestionnaires;
            return;
        }

        Questionnaires.requestQuestionnaires()
            .then(function () {

                $scope.loading = false;
                $scope.questionnaires = Questionnaires.getPatientQuestionnaires().Questionnaires;
                $scope.patientQuestionnaires = Questionnaires.getPatientQuestionnaires().PatientQuestionnaires;
                getBadgeNumbers();
            },
            function(error){
                console.log(JSON.stringify(error));
                $scope.loading = false;
            })
    }

    function getBadgeNumbers () {
        $scope.numQuestionnairesCompleted = undefined;
        $scope.numQuestionnairesNew = undefined;
        $scope.numQuestionnairesInProgress = undefined;
        for (var key in $scope.patientQuestionnaires) {
            questionnaireSerNum = $scope.patientQuestionnaires[key].QuestionnaireSerNum;
            if ((!isQuestionnaireComplete($scope.patientQuestionnaires[key])) && (!Questionnaires.isQuestionnaireInProgress(questionnaireSerNum))) {
                if (typeof($scope.numQuestionnairesNew) == 'undefined') {
                    $scope.numQuestionnairesNew = 1;
                } else {
                    $scope.numQuestionnairesNew = $scope.numQuestionnairesNew + 1;
                }
            }
            if ((!isQuestionnaireComplete($scope.patientQuestionnaires[key])) && (Questionnaires.isQuestionnaireInProgress(questionnaireSerNum))) {
                if (typeof($scope.numQuestionnairesInProgress) == 'undefined') {
                    $scope.numQuestionnairesInProgress = 1;
                } else {
                    $scope.numQuestionnairesInProgress = $scope.numQuestionnairesInProgress + 1;
                }
            }
        }
    }



    $scope.getDesiredQuestionnaires = function(isAnsweredQuestionnaires) {
        $scope.desiredQuestionnaires = [];
        console.log(isAnsweredQuestionnaires);
        if (isAnsweredQuestionnaires == 'completed') {
            for (var key in $scope.patientQuestionnaires) {
                if (isQuestionnaireComplete($scope.patientQuestionnaires[key])) {
                    $scope.desiredQuestionnaires.push($scope.patientQuestionnaires[key]);
                }
            }
            $scope.isAnswered = "Questionnaires Completed";
            $scope.clickedText = "completed";
        } else if (isAnsweredQuestionnaires == 'new') {
            for (var key in $scope.patientQuestionnaires) {
                questionnaireSerNum = $scope.patientQuestionnaires[key].QuestionnaireSerNum;
                if ((!isQuestionnaireComplete($scope.patientQuestionnaires[key])) && (!Questionnaires.isQuestionnaireInProgress(questionnaireSerNum))) {
                    $scope.desiredQuestionnaires.push($scope.patientQuestionnaires[key]);
                }
            }
            $scope.isAnswered = "New Questionnaires";
            $scope.clickedText = 'new';
        } else if (isAnsweredQuestionnaires == 'progress') {
            for (var key in $scope.patientQuestionnaires) {
                questionnaireSerNum = $scope.patientQuestionnaires[key].QuestionnaireSerNum;
                if ((!isQuestionnaireComplete($scope.patientQuestionnaires[key])) && (Questionnaires.isQuestionnaireInProgress(questionnaireSerNum))) {
                    $scope.desiredQuestionnaires.push($scope.patientQuestionnaires[key]);
                }
            }
            $scope.isAnswered = "Questionnaires In Progress";
            $scope.clickedText = 'progress';
        }
        console.log($scope.desiredQuestionnaires);
    }

    function isQuestionnaireComplete (patientQuestionnaire) {
        if (patientQuestionnaire.CompletedFlag == 0) {
            return false;
        } else {
            return true;
        }
    }

    $scope.goToQuestionnaire = function(patientQuestionnaire, questionnaireDBSerNum, questionnaireSerNum) {
        if(!(isQuestionnaireComplete(patientQuestionnaire))) {
            console.log('in questionnaires');
            NavigatorParameters.setParameters({Navigator:'personalNavigator', DBSerNum: questionnaireDBSerNum, SerNum: questionnaireSerNum});
            personalNavigator.pushPage('views/personal/questionnaires/questionnaires.html', {param:questionnaireDBSerNum, QuestionnaireSerNum:questionnaireSerNum},{ animation : 'slide' });
        } else {
            console.log('in answered questionnaires');
            NavigatorParameters.setParameters({Navigator:'personalNavigator', DBSerNum: questionnaireDBSerNum, SerNum: questionnaireSerNum});
            personalNavigator.pushPage('views/personal/questionnaires/answeredQuestionnaire.html', {param:questionnaireDBSerNum, QuestionnaireSerNum:questionnaireSerNum},{ animation : 'slide' });
        }
    }

    $scope.refreshQuestionnairesList = function () {
        console.log($scope.isAnswered);
        if ($scope.isAnswered == undefined) {
            $scope.getDesiredQuestionnaires('new');
        } else {
            $scope.getDesiredQuestionnaires($scope.clickedText);
        }
    }

    function setQuestionnaireAnswersObject(object) {
        console.log(object);
        oneQuestionnaireAnswer = {};
        if (object == undefined) {
            return;
        }
        answers = object.Answers;
        console.log(answers);
        $scope.answers = {};
        for(key in answers) {
            oneQuestionnaireAnswer[key] = answers[key];
        }
        return oneQuestionnaireAnswer;
    }

    $scope.refreshQuestionnairesList();

    function popPost() {
        $timeout(function() {
            $scope.refreshQuestionnairesList();
            getBadgeNumbers();
            console.log('popPost');
            console.log($scope.desiredQuestionnaires);
        });
    }

    $timeout(function() {
        personalNavigator.on('postpop', popPost);
    });


    console.log($location.path());

});