(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('QuestionnaireMainController', QuestionnaireMainController);

    QuestionnaireMainController.$inject = [
        '$scope', '$rootScope', 'Questionnaires', '$location', 'NavigatorParameters', '$q', '$anchorScroll', '$sce', '$http', '$window', '$filter'
    ];

    /* @ngInject */
    function QuestionnaireMainController($scope, $rootScope, Questionnaires, $location, NavigatorParameters, $q, $anchorScroll, $sce, $http, $window, $filter) {
        var vm = this;
        vm.beginQuestionnaire = beginQuestionnaire;
        vm.resumeQuestionnaire = resumeQuestionnaire;
        vm.currentColorGradient = [];
        vm.currentPolarity = "lowGood";
        vm.optionBackgroundColor = "#f3f3f3";
        vm.updateOptionBackgroundColor = updateOptionBackgroundColor;
        vm.toggleCheckboxSelection = toggleCheckboxSelection;
        vm.toggleScaleSkip = toggleScaleSkip;
        vm.toggleCheckboxSkip = toggleCheckboxSkip;
        vm.skipQuestion = skipQuestion;
        vm.removeListener = removeListener;
        vm.numQuestions = 0;
        vm.summaryPage = summaryPage;
        vm.sectionEnds = [];
        vm.bindScaleParameters = bindScaleParameters;
        vm.removeSpanChild = removeSpanChild;
        vm.average = average;
        vm.choosenReaction = [{}];
        vm.skipQuestion = { 'reason': '', 'askSimilar': ''};


        vm.availableReactions = [
            {'type': 'emotion-good', 'reaction': 'reaction-happy', 'text': 'Happy'},
            {'type': 'emotion-good', 'reaction': 'reaction-hopeful', 'text': 'Hopeful'},
            {'type': 'emotion-good', 'reaction': 'reaction-interested', 'text': 'Interested'},
            {'type': 'emotion-bad', 'reaction': 'reaction-angry', 'text': 'Angry'},
            {'type': 'emotion-bad', 'reaction': 'reaction-sad', 'text': 'Sad'},
            {'type': 'emotion-bad', 'reaction': 'reaction-confused', 'text': 'Confused'},
            {'type': 'emotion-bad', 'reaction': 'reaction-anxious', 'text': 'Anxious'}
        ];
        vm.displayReactions = [];
        vm.showReactions = function(filter) {
            vm.displayReactions = $filter('filter')(vm.availableReactions, function(x) { return x.type == filter; });
            console.log(vm.displayReactions);
            vm.beforeChoosenReaction = vm.choosenReaction[vm.questionIndex];
            reactions_modal.show();
        };
        vm.closeReactions = function() {
            reactions_modal.hide();
        };
        vm.chooseReaction = function(reaction) {
            vm.choosenReaction[vm.questionIndex] = reaction;
        };
        vm.submitReaction = function() {
            reactions_modal.hide();
        };
        vm.skipQuestion = function() {
            skip_question.show();
        };
        vm.skipQuestionSubmit = function() {

            vm.skipQuestionClose();
        };
        vm.skipQuestionClose = function() {
            carousel.next()
            skip_question.hide();
        };


        activate();

        $scope.$on("$destroy", function() {
            console.log("Controller destroyed");
            removeListener();
        });
        ///////////////////

        function activate() {
            var params = NavigatorParameters.getParameters();
            vm.questionnaire = params.questionnaire;
            vm.carouselItems = flattenQuestionnaire(); // questions + section headers
            vm.questionnaireStart = true;
            vm.sectionIndex = 0;
            vm.questionIndex = 0; //  index within the section
            vm.editQuestion = false;
            if (params.sectionIndex != null && params.questionIndex != null) {
                vm.editQuestion = true;
                vm.sectionIndex = params.sectionIndex;
                vm.questionIndex = params.questionIndex;
            }
            vm.questionTotalIndex = 0; // index within array of all (and only) questions of questionnaire
            vm.maxQuestionIndex = vm.questionnaire.sections[vm.sectionIndex].questions.length-1; // maximum questionIndex for current section

            // if in progress, find spot patient left off at
            vm.startIndex = 0;
            if (vm.questionnaire.status == 'In progress' && !vm.editQuestion) {
                vm.sectionIndex = -1;
                vm.startIndex++;
                for (var i = 0; i<vm.questionnaire.sections.length; i++) {
                    vm.questionIndex = 0;
                    vm.startIndex++;
                    vm.sectionIndex++;
                    for (var j = 0; j<vm.questionnaire.sections[i].questions.length; j++) {
                        // as soon as find a question with no answer
                        if (vm.questionnaire.sections[i].questions[j].patient_answer.length == 0) {
                            vm.maxQuestionIndex = vm.questionnaire.sections[vm.sectionIndex].questions.length-1;
                            i = vm.questionnaire.sections.length;
                            break;
                        }
                        vm.startIndex++;
                        vm.questionIndex++;
                        vm.questionTotalIndex++;
                    }
                    // if all questions have been answered
                    if (i == vm.questionnaire.sections.length-1) {
                        vm.startIndex = -1;
                    }
                }
            }
            // if in progress and came from summary page to edit question
            else if (vm.questionnaire.status == 'In progress' && vm.editQuestion) {
                vm.startIndex++;
                for (var i = 0; i<vm.questionnaire.sections.length; i++) {
                    vm.startIndex++;
                    for (var j = 0; j<vm.questionnaire.sections[i].questions.length; j++) {
                        // as soon as find a question with no answer
                        if (j == vm.questionIndex) {
                            vm.maxQuestionIndex = vm.questionnaire.sections[vm.sectionIndex].questions.length-1;
                            i = vm.questionnaire.sections.length;
                            break;
                        }
                        vm.startIndex++;
                        vm.questionTotalIndex++;
                    }
                }
                resumeQuestionnaire();
            }
            vm.progressBarPercent = (1/vm.numQuestions)*100;

            document.addEventListener('ons-carousel:postchange', carouselPostChange);
            updateColorGradient(Object.keys(vm.questionnaire.sections[0].questions[0].options).length, vm.questionnaire.sections[0].questions[0].polarity);
            vm.currentPolarity = vm.questionnaire.sections[0].questions[0].polarity;
        }

        function carouselPostChange(event) {
            //console.log($scope.carousel.getActiveCarouselItemIndex());
            // going from questionnaire header page to first section
            if (event.lastActiveIndex == 0) {
                vm.questionnaireStart = false;
            }
            // going to questionnaire header page
            else if (event.activeIndex == 0) {
                vm.questionnaireStart = true;
            }
            // if right swipe
            else if (event.activeIndex - event.lastActiveIndex > 0) {
                // coming from question, going to question
                if (event.lastActiveIndex > 0 && vm.carouselItems[event.lastActiveIndex-1].type == 'question' && vm.carouselItems[event.activeIndex-1].type == 'question') {
                    saveAnswer(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                    vm.questionIndex++;
                    vm.questionTotalIndex++;
                }
                // coming from question, going to section header
                else if (event.lastActiveIndex > 0 && vm.carouselItems[event.lastActiveIndex-1].type == 'question' && vm.carouselItems[event.activeIndex-1].type == 'header') {
                    saveAnswer(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                    vm.sectionIndex++;
                    vm.questionIndex = 0;
                    vm.maxQuestionIndex = vm.questionnaire.sections[vm.sectionIndex].questions.length-1;
                    vm.questionTotalIndex++;
                }
            }
            // if left swipe
            else if (event.activeIndex - event.lastActiveIndex < 0) {
                // coming from question, going to question
                if (event.lastActiveIndex > 0 && vm.carouselItems[event.lastActiveIndex-1].type == 'question' && vm.carouselItems[event.activeIndex-1].type == 'question') {
                    saveAnswer(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                    vm.questionIndex--;
                    vm.questionTotalIndex--;
                }
                // coming from section header, going to question
                else if (event.lastActiveIndex > 0 && vm.carouselItems[event.lastActiveIndex-1].type == 'header' && vm.carouselItems[event.activeIndex-1].type == 'question') {
                    vm.sectionIndex--;
                    vm.maxQuestionIndex = vm.questionnaire.sections[vm.sectionIndex].questions.length-1;
                    vm.questionIndex = vm.maxQuestionIndex;
                    vm.questionTotalIndex--;
                }
            }
            var question = vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex];
            // update color gradient
            updateColorGradient(Object.keys(question.options).length, question.polarity);
            vm.currentPolarity = question.polarity;
            // if answer was given in previous session, fill color in correctly
            if ((question.questiontype == 'Multiple Choice') && (typeof question.answerColor == 'undefined') && question.patient_answer.length > 0 && question.patient_answer[0] != -1) {
                var keys = Object.keys(question.options);
                var answerIndex = keys.indexOf("" + question.patient_answer[0]);
                updateOptionBackgroundColor(question, answerIndex)
            }
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        }

        function summaryPage() {
            console.log(vm.startIndex);
            if (vm.startIndex > -1) {
                saveAnswer(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
            }
            removeListener();
            // go to summary page
            NavigatorParameters.setParameters({Navigator:'personalNavigator', questionnaire: vm.questionnaire});
            personalNavigator.replacePage('views/personal/questionnaires/answeredQuestionnaire.html',{ animation : 'slide' });
            // $scope.$destroy();
        }

        function flattenQuestionnaire() {
            var carouselItems = [];
            for(var i=0; i<vm.questionnaire.sections.length; i++) {
                carouselItems.push(
                    {
                        type: "header",
                        instructions: vm.questionnaire.sections[i].instructions
                    }
                );
                for(var j=0; j<vm.questionnaire.sections[i].questions.length; j++) {
                    carouselItems.push(
                        {
                            type: "question",
                            data: vm.questionnaire.sections[i].questions[j]
                        }
                    );
                    if (i < vm.questionnaire.sections.length-1 && j == vm.questionnaire.sections[i].questions.length-1) {
                        vm.sectionEnds.push(vm.numQuestions);
                    }
                    vm.numQuestions++;
                }
            }
            return carouselItems;
        }

        function bindScaleParameters(question) {
            var keys = Object.keys(question.options);
            if (keys.length != 2) {
                console.log("Option size should be 2, is " + keys.length);
            }
            else {
                $scope.minText = question.options[keys[0]].text;
                $scope.minCaption = question.options[keys[0]].caption;
                $scope.maxText = question.options[keys[1]].text;
                $scope.maxCaption = question.options[keys[1]].caption;
            }
        }

        function removeSpanChild(parent) {
            // angular automatically creates an annoying span element with the current value
            // this removes it
            var parentElement = document.getElementsByClassName("thumb active");
            if (parentElement.length > 0) {
                var span = parentElement[0];
                span.remove();
            }
        }

        function average(low, high) {
            low = parseInt(low);
            high = parseInt(high);
            return parseInt((low+high)/2);
        }

        function beginQuestionnaire() {
            vm.questionnaireStart = false;
            $scope.carousel.next();
        }

        function checkIfResumeNeeded() {
            if (vm.editQuestion) {
                resumeQuestionnaire();
            }
        }

        function resumeQuestionnaire() {
            vm.questionnaireStart = false;
            if (vm.startIndex > -1) {
                console.log($scope.carousel);
                console.log(vm.startIndex);
                console.log($scope.carousel.getActiveCarouselItemIndex());
                $scope.carousel.setActiveCarouselItemIndex(vm.startIndex);
            }
            else {
                summaryPage();
            }
        }

        // save answer to a question whenever user swipes away from question and answer has changed
        function saveAnswer(question) {
            // check that answer has changed or that questiontype is scale
            // all scales should be saved everytime since scale begins in middle
            // and user may want that answer (which wouldn't trigger the flag)
            if (typeof question.answerChangedFlag == 'undefined') {
                question.answerChangedFlag = false;
            }
            if (question.answerChangedFlag || question.questiontype == 'Scale') {
                console.log("saveanswer()");
                for (var i=0; i<question.patient_answer.length; i++) {
                    Questionnaires.saveQuestionnaireAnswer(vm.questionnaire.qp_ser_num, question.ser_num, question.patient_answer[i]);
                }
                if (vm.questionnaire.status == 'New') {
                    Questionnaires.updateQuestionnaireStatus(vm.questionnaire.qp_ser_num, 'In progress');
                    vm.questionnaire.status = "In progress";
                }
            }
        }

        // create/update green to yellow to red gradient based on number of options
        function updateColorGradient(numColors, polarity) {
            if (numColors < 2 || (vm.currentPolarity == polarity && numColors == vm.currentColorGradient.length)) {
                return;
            }
            vm.currentColorGradient = [];
            var stepSize = Math.floor(256/(numColors/2));
            var green = 255;
            var red = 0;
            while (red < 255) {
                if (red + stepSize > 255) {
                    red = 255;
                }
                else {
                    red += stepSize;
                }
                if (polarity == "lowGood") {
                    vm.currentColorGradient.push("rgba("+red+","+green+",0,0.2)");
                }
                else {
                    vm.currentColorGradient.push("rgba("+green+","+red+",0,0.2)");
                }
            }
            while (green > 0) {
                if (green - stepSize < 0) {
                    green = 0;
                }
                else {
                    green -= stepSize;
                }
                // for odd numColors
                if (polarity == "lowGood") {
                    vm.currentColorGradient.push("rgba("+red+","+green+",0,0.2)");
                }
                else {
                    vm.currentColorGradient.push("rgba("+green+","+red+",0,0.2)");
                }
                if (vm.currentColorGradient.length == numColors) {
                    return;
                }
            }
        }

        function updateOptionBackgroundColor(question, index) {
            question.answerColor = vm.currentColorGradient[index];
        }

        function toggleCheckboxSelection(optionKey) {
            var question = vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex];

            // if previous choice was to skip question, toggle skip boolean
            if (question.patient_answer.indexOf('SKIPPED') > -1) {
                toggleCheckboxSkip(false, question);
            }

            var answerIndex = question.patient_answer.indexOf(optionKey);
            // is currently selected, remove it
            if (answerIndex > -1) {
                question.answerChangedFlag = true;
                question.patient_answer.splice(answerIndex, 1);
            }
            // is newly selected, add it
            else {
                question.answerChangedFlag = true;
                question.patient_answer.push(optionKey);
            }
        }

        function toggleScaleSkip(skip, question) {
            question.answerChangedFlag = true;
            if (skip) {
                question.patient_answer = [-9];
                if (!$scope.$$phase) {
                    $scope.$digest();
                }
            }
            else {
                question.patient_answer[0] = average($scope.minText, $scope.maxText);
            }
            question.skip = !skip;
            console.log(question.patient_answer);
        }

        function toggleCheckboxSkip(skip, question) {
            question.answerChangedFlag = true;
            if (skip) {
                skipQuestion(question);
            }
            else {
                question.patient_answer = [];
            }
            question.skip = !skip;
        }

        function skipQuestion(question) {
            question.patient_answer = ['SKIPPED'];
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        }

        function removeListener() {
            document.removeEventListener('ons-carousel:postchange', carouselPostChange);
        }
    }
}) ();