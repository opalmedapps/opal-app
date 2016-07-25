var app1 = angular.module('MUHCApp');
app1.controller('answeredQuestionnaireController', function($scope, Questionnaires, NavigatorParameters, Questionnaires, $filter) {
  var params = NavigatorParameters.getParameters();
  $scope.questionnaireSerNum = params.SerNum;
  $scope.questionnaireDBSerNum = params.DBSerNum;
  console.log($scope.questionnaireSerNum);
  console.log($scope.questionnaireDBSerNum);
  $scope.answers = [];
  var answersObject;
  $scope.questionnaire = Questionnaires.getPatientQuestionnaires().Questionnaires[$scope.questionnaireDBSerNum];
  $scope.patientQuestionnaire = Questionnaires.getPatientQuestionnaires().PatientQuestionnaires[$scope.questionnaireSerNum];
  $scope.questionsObject = $scope.questionnaire.Questions;
  $scope.questionsObject = $filter('orderBy')($scope.questionsObject, 'OrderNum', false);
  $scope.questions = [];

  for (key in $scope.questionsObject) {
    $scope.questions.push($scope.questionsObject[key]);
  }

  if(typeof($scope.patientQuestionnaire.Answers) == 'undefined') {
    answersObject = Questionnaires.getQuestionnaireAnswers($scope.questionnaireSerNum).Answers;
    console.log(answersObject);
  } else {
    answersObject = $scope.patientQuestionnaire.Answers;
  }

  for (key in answersObject) {
    $scope.answers.push(answersObject[key].Answer);
  }

  console.log($scope.answers);

  if($scope.hasOwnProperty('questions')) $scope.answerToShow = new Array($scope.questions.length);
  $scope.answerShown = [];
  for ($i = 0; $i < $scope.questions.length; $i++) {
    $scope.answerShown[$i] = false;
  }

  $scope.chooseAction = function(index, oneQuestion) {
    if ($scope.answers[index] != undefined) {
      if ((oneQuestion.QuestionType == 'SA') || (oneQuestion.QuestionType == 'Checkbox') || (oneQuestion.QuestionType == 'image')) {
        $scope.showAnswer(index);
      } else {
        return;
      }
    } else {
      return;
    }
  };

  // Decides what answer to show. This is purely only for the 'eye' icon where the answer can be previewed.
  $scope.showAnswer = function (index) {
    $scope.answerShown[index] = !$scope.answerShown[index];
    $scope.animateShowAnswer = ($scope.answerShown[index])?'animated fadeInDown':'animated fadeOutUp';
    if($scope.questions[index].QuestionType == 'Checkbox') {
      if (typeof($scope.patientQuestionnaire.Answers) == 'undefined') {
        console.log($scope.answers[index]);
        console.log(Object.keys($scope.answers[index]).length);
        $scope.checkboxString = '';
        for (val in $scope.answers[index]) {
          if ($scope.answers[index][val] != undefined) {
            if ($scope.checkboxString == '') {
              $scope.checkboxString = $scope.checkboxString + $scope.answers[index][val];
            } else {
              $scope.checkboxString = $scope.checkboxString + ', ' + $scope.answers[index][val];
            }
          }
        }
        $scope.answerToShow[index] = $scope.checkboxString;
      } else {
        $scope.answerToShow[index] = $scope.answers[index];
      }
    } else if (($scope.questions[index].QuestionType == 'image') && ($scope.answers[index] != undefined)) {
      $scope.checkboxString = '';
      for (x in $scope.answers[index]) {
        if ( $scope.checkboxString == '') {
          $scope.checkboxString = $scope.checkboxString + x + ': ' + $scope.answers[index][x] + '/10';
        } else {
          $scope.checkboxString = $scope.checkboxString + ', ' + x + ': ' + $scope.answers[index][x] + '/10';
        }
      }
      $scope.answerToShow[index] = $scope.checkboxString;
    } else {
      $scope.answerToShow[index] = $scope.answers[index];
    }
  }

  $scope.showAnswerReview = function(index) {
    $scope.showAnswer(index);
    return $scope.answerToShow[index];
  }
});