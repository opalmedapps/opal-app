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
        vm.isResume = true;
        vm.isQuestion = false;
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
        vm.tempAns;
        vm.fixSlider = fixSlider;
        vm.bindScaleParameters = bindScaleParameters;
        vm.removeSpanChild = removeSpanChild;
        //vm.average = average;
        vm.choosenReaction = [{}];
        vm.skipQuestion = { 'reason': '', 'askSimilar': ''};
        vm.currentQuestion = {};
        vm.scaleQuestions = [];


        vm.ischeckedTest=true;
        vm.isDisabled = isDisabled;
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
        vm.updateCurrentQuestion = function(item) {
            vm.currentQuestion = item.data;
        };
        vm.isCheckedFcn = isCheckedFcn;

        vm.exists = function(item) {
            return vm.selected.indexOf(item)>-1;
        }
        vm.tmpAnswer = [];

        $scope.slider = {
            value: 6,
            options: {
                showSelectionBar: true,
                getPointerColor: function(value) {
                    if (value <= 3)
                        return 'red';
                    if (value <= 6)
                        return 'orange';
                    if (value <= 9)
                        return 'yellow';
                    return '#2AE02A';
                }
            }
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
            console.log("IN ACTIVATE() IN QUESTIONAIREMAINCONTROLLER: " + Object(params));
            console.log(vm.questionnaire);
            vm.carouselItems = flattenQuestionnaire(); // questions + section headers
            vm.questionnaireStart = true;
            vm.sectionIndex = 0;
            vm.questionIndex = 0; // index within the section
            vm.editQuestion = false;
            // if (params.sectionIndex != null && params.questionIndex != null) {
            //     vm.editQuestion = true;
            //     vm.sectionIndex = params.sectionIndex;
            //     console.log("AAAAAAAAAAAAAAAAAAAAAAA params.questionIndex is: " + params.questionIndex);
            //     vm.questionIndex = params.questionIndex;
            // }
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
                    vm.maxQuestionIndex = vm.questionnaire.sections[vm.sectionIndex].questions.length-1;
                    console.log('HERE7 ' + vm.sectionIndex);
                    for (var j = 0; j<vm.questionnaire.sections[i].questions.length; j++) {
                        // as soon as find a question with no answer
                        console.log("BEFORE IF IN ACTIVATE");
                        if ((vm.questionnaire.sections[i].questions[j].patient_answer.length === 0) || (vm.questionnaire.sections[i].questions[j].patient_answer[0]==-1)) {
                            console.log("no answer to question: " + (j+1));
                            // console.log("sectionIndex is: " + vm.sectionIndex);
                            // console.log("questionIndex is: " + vm.questionIndex);
                            vm.maxQuestionIndex = vm.questionnaire.sections[vm.sectionIndex].questions.length-1;
                            i = vm.questionnaire.sections.length;
                            break;
                        }
                        if(vm.questionIndex<vm.maxQuestionIndex){
                            vm.questionIndex++;
                            vm.questionTotalIndex++;
                        }
                        vm.startIndex++;
                        console.log('HERE6 ' + vm.questionTotalIndex + " and questionIndex = " + vm.questionIndex);
                    }
                    // if all questions have been answered
                    if (i == vm.questionnaire.sections.length-1) {
                        vm.startIndex = -1;
                    }
                    console.log("sectionIndex is: " + vm.sectionIndex);
                    console.log("questionIndex is: " + vm.questionIndex);
                }
                console.log("AFTER THE FOR LOOP FOR SECTIONS, vm.questionIndex = " + vm.questionIndex);
            }
            // if in progress and came from summary page to edit question
            else if (vm.questionnaire.status == 'In progress' && vm.editQuestion) {
                vm.questionTotalIndex=0;
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

            // Listen to orientation changes
            //window.addEventListener("orientationchange", setLayoutByOrientation);

            vm.portraitOrientationCheck = window.matchMedia("(orientation: portrait)");
            vm.portraitOrientationCheck.addListener(setLayoutByOrientation);
        }

        function fixSlider(question){
            console.log("in fixSlider sliderAns=" + question.patient_answer[0].sliderAns + " and tempAns" + vm.tempAns);
            console.log("in fixSlider");
            question.patient_answer[0].sliderAns = vm.tempAns;
        }

        // reset all the scale styles once screen is rotated
        function setLayoutByOrientation() {
            console.log("width : " + vm.width);
            console.log("height : " + vm.height);
            setTimeout(function() {
                var tabbars = $(".tab-bar");
                var bottomtabbar = tabbars[tabbars.length-1];
                if (!vm.portraitOrientationCheck.matches) {
                    // landscape
                    $(".tab-bar__content").css("height","100%");
                    bottomtabbar.style.visibility = "hidden";
                    document.getElementById("myRange").style.transform = 'rotate(0deg)';
                    document.getElementById("myRange").style.marginTop = '-4vw';
                    document.getElementById("myRange").style.marginLeft = '10vw';
                    document.getElementById("maximumText").style.left = '92%';
                    document.getElementById("minimumText").style.top = '0vw';
                    document.getElementById("minimumText").style.left = '7%';
                    document.getElementById("valueSelected").style.top = '30%';
                    document.getElementById("valueSelected").style.right = '44%';
                }
                else {
                    // portrait
                    $(".tab-bar__content").css("height","auto");
                    bottomtabbar.style.visibility = "visible";
                }
            },500);
        }


        function carouselPostChange(event) {
            //console.log($scope.carousel.getActiveCarouselItemIndex());
            // going from questionnaire header page to first section
            if (event.lastActiveIndex == 0) {
                if(vm.questionnaire.status == 'In progress' && vm.isResume){
                    vm.sectionIndex = 0;
                    vm.questionIndex = 0;
                    vm.questionTotalIndex = 0;
                }
                vm.questionnaireStart = false;
                vm.isQuestion = false;
            }
            // going to questionnaire header page
            else if (event.activeIndex == 0) {
                vm.questionnaireStart = true;
                vm.isQuestion = false;
            }
            //vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex].answerChangedFlag = true;
            // if right swipe
            if (event.activeIndex - event.lastActiveIndex > 0) {
                // coming from question, going to question
                if (event.lastActiveIndex > 0 && vm.carouselItems[event.lastActiveIndex-1].type == 'question' && vm.carouselItems[event.activeIndex-1].type == 'question') {
                    vm.questionTotalIndex++;
                    saveAnswer(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                    vm.questionIndex++;
                    console.log('HERE1 ' + vm.questionTotalIndex + "and questionIndex = " + vm.questionIndex);
                    vm.isQuestion = true;
                    console.log('Merge question is: ' + Object(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]));
                }
                // coming from question, going to section header
                else if (event.lastActiveIndex > 0 && vm.carouselItems[event.lastActiveIndex-1].type == 'question' && vm.carouselItems[event.activeIndex-1].type == 'header') {
                    vm.isQuestion = false;
                    vm.questionTotalIndex++;
                    saveAnswer(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                    console.log("vm.sectionIndex="+vm.sectionIndex+ " and vm.questionIndex=" + vm.questionIndex);
                    if(vm.sectionIndex < vm.questionnaire.sections.length-1){
                        vm.sectionIndex++;
                        console.log('HERE1 ' + vm.sectionIndex);
                    } else {
                        console.log("BUG BUG BUG: sectionIndex becomes too large!");
                    }
                    vm.questionIndex = 0;
                    vm.maxQuestionIndex = vm.questionnaire.sections[vm.sectionIndex].questions.length-1;
                    console.log('HERE2 ' + vm.questionTotalIndex + " and questionIndex = " + vm.questionIndex);
                    // coming from section header, going to question
                } else if (event.lastActiveIndex > 0 && vm.carouselItems[event.lastActiveIndex-1].type == 'header' && vm.carouselItems[event.activeIndex-1].type == 'question') {
                    vm.isQuestion = true;
                }

            }
            // if left swipe
            else if (event.activeIndex - event.lastActiveIndex < 0) {
                // coming from question, going to question
                if (event.lastActiveIndex > 0 && vm.carouselItems[event.lastActiveIndex-1].type == 'question' && vm.carouselItems[event.activeIndex-1].type == 'question') {
                    console.log("BEFORE BUG: sectionIndex=" + vm.sectionIndex + " and questionIndex=" + vm.questionIndex);
                    vm.questionTotalIndex--;
                    saveAnswer(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                    vm.questionIndex--;
                    vm.isQuestion = true;
                    console.log('HERE3 ' + vm.questionTotalIndex + " and questionIndex = " + vm.questionIndex);
                }
                // coming from section header, going to question
                else if (event.lastActiveIndex > 0 && vm.carouselItems[event.lastActiveIndex-1].type == 'header' && vm.carouselItems[event.activeIndex-1].type == 'question') {
                    vm.isQuestion = true;
                    if(vm.sectionIndex>0) {
                        vm.sectionIndex--;
                        console.log('HERE4 ' + vm.questionTotalIndex + " and questionIndex = " + vm.questionIndex);
                    } else {
                        console.log("BUG BUG BUG: sectionIndex becomes negative!");
                    }
                    vm.maxQuestionIndex = vm.questionnaire.sections[vm.sectionIndex].questions.length-1;
                    vm.questionIndex = vm.maxQuestionIndex;
                    vm.questionTotalIndex--;
                    console.log('HERE5 ' + vm.questionTotalIndex + " and questionIndex = " + vm.questionIndex);
                }
                // coming from question to section header
                else if (event.lastActiveIndex > 0 && vm.carouselItems[event.lastActiveIndex-1].type == 'question' && vm.carouselItems[event.activeIndex-1].type == 'header') {
                    vm.isQuestion = false;
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
            console.log("1-------------- sliderAns = " + question.patient_answer[0].sliderAns);
            var keys = Object.keys(question.options);
            console.log(question.options[0].min_value);
            console.log(question.options[0].max_value);
            // if (keys.length != 2) {
            //     console.log("Option size should be 2, is " + keys.length);
            // }
            // else {
                $scope.minText = question.options[0].min_value;
                $scope.minCaption = question.options[0].min_caption;
                $scope.maxText = question.options[0].max_value;
                $scope.maxCaption = question.options[0].max_caption;

                // set the style of the options
                var min = parseInt($scope.minText);
                var max = parseInt($scope.maxText);
                console.log(min+" "+max);
                $scope.options = [];
                var options = $scope.options;
                for (var i = min; i <= max; i++) {
                    options.push({text: i+"", value:i});
                }
                console.log($scope.options);
                var scalewidth = $(".scale").width();
                $scope.scalebtn = {
                    "height": "auto",
                    "float": "left",
                    "text-align": "center",
                    "width": Math.floor(100/options.length) + "\%"
                };
                console.log($scope.scalebtn);
                console.log("2-------------- sliderAns = " + question.patient_answer[0].sliderAns);
                vm.tempAns=question.patient_answer[0].sliderAns
            // }

        }

        function removeSpanChild() {
            // angular automatically creates an annoying span element with the current value
            // this removes it
            var parentElement = document.getElementsByClassName("thumb active");
            for(var i=0; i<parentElement.length;i++) {
                var span = parentElement[i];
                span.remove();
            }
        }

        // function average(low, high) {
        //     low = parseInt(low);
        //     high = parseInt(high);
        //     return parseInt((low+high)/2);
        // }

        function beginQuestionnaire() {
            vm.questionnaireStart = false;
            console.log("questionnaire structure: ");
            console.log(vm.questionnaire);
            $scope.carousel.next();
        }

        function checkIfResumeNeeded() {
            if (vm.editQuestion) {
                resumeQuestionnaire();
            }
        }

        function resumeQuestionnaire() {
            vm.isResume = false;
            vm.questionTotalIndex++;
            vm.questionnaireStart = false;
            if (vm.startIndex > -1) {
                console.log($scope.carousel);
                console.log("startIndex = " + vm.startIndex);
                console.log($scope.carousel.getActiveCarouselItemIndex());
                $scope.carousel.setActiveCarouselItemIndex(vm.startIndex);
            }
            else {
                summaryPage();
            }
        }

        // save answer to a question whenever user swipes away from question and answer has changed
        function saveAnswer(question) {
            console.log("sectionIndex= " + vm.sectionIndex + " and questitonIndex= " + vm.questionIndex);
            console.log("typeoftypeoftypeoftypeoftypeoftypeof" + typeof question.patient_answer[0] + "and value is: " + question.patient_answer[0]);
            // check that answer has changed or that questiontype is scale
            // all scales should be saved everytime since scale begins in middle
            // and user may want that answer (which wouldn't trigger the flag)
            if (typeof question.answerChangedFlag == 'undefined') {
                question.answerChangedFlag = false;
            }
            if (question.answerChangedFlag || question.question_type_category_key == 'slider') {
                console.log("saveanswer()");
                console.log("patient answer is: " + Object(question.patient_answer));
                if(question.question_type_category_key == 'slider'){
                    Questionnaires.saveQuestionnaireAnswer(vm.questionnaire.qp_ser_num, question.ser_num, question.patient_answer[0].sliderAns, question.options[0].answer_option_ser_num, question.question_type_category_key, vm.questionnaire.sections[vm.sectionIndex].section_ser_num);
                } else {
                    for (var i = 0; i < question.patient_answer.length; i++) {
                        // TODO: add question.type; for slider answeroptionsernum;
                        Questionnaires.saveQuestionnaireAnswer(vm.questionnaire.qp_ser_num, question.ser_num, -1, question.options[question.patient_answer[i]].answer_option_ser_num, question.question_type_category_key, vm.questionnaire.sections[vm.sectionIndex].section_ser_num);
                    }
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
            console.log("Sectionindex is : " + vm.sectionIndex + " and question index is " + vm.questionIndex);
            var question = vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex];

            console.log("Question is "+Object(question));
            console.log("Question.patient_answer is "+Object(question.patient_answer));

            // if previous choice was to skip question, toggle skip boolean
            if (question.patient_answer.indexOf('SKIPPED') > -1) {
                toggleCheckboxSkip(false, question);
            }

            console.log("Object is "+Object(question.patient_answer));

            var answerIndex = question.patient_answer.indexOf(optionKey);

            // is currently selected, remove it
            if (answerIndex > -1) {
                question.answerChangedFlag = true;
                question.patient_answer.splice(answerIndex, 1);
                vm.tmpAnswer = question.patient_answer;
                vm.checkedNumber--;
                console.log("In if, checkedNumber = "+vm.checkedNumber);
                console.log("Object after splice in if is "+Object(question.patient_answer));
                console.log("tmpAnswer = " + Object(vm.tmpAnswer));
            } else { // is newly selected
                question.answerChangedFlag = true;
                question.patient_answer.push(optionKey);
                vm.checkedNumber++;
                console.log("In else, checkedNumber = "+vm.checkedNumber);
                console.log("Object after push in if else else is "+Object(question.patient_answer));
                vm.tmpAnswer = question.patient_answer;
                console.log("tmpAnswer = " + Object(vm.tmpAnswer));
            }
            console.log("Object at the end is "+Object(question.patient_answer));
        }

        function isCheckedFcn(optionKey) {
            var question = vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex];
            var answerIndex = question.patient_answer.indexOf(optionKey);
            return (answerIndex > -1);
        }
        //TODO: define checkedNumber and limitNumber dynamically for each question instead of hardcoding
        vm.checkedNumber = 0;
        vm.limitNumber = 2;
        vm.check = function(item) {
            if (item.checked) {
                vm.checkedNumber++;
            } else {
                vm.checkedNumber--;
            }
        }

        function toggleScaleSkip(skip, question) {
            console.log("CHECK answerChangedFlag= " + question.answerChangedFlag + " and skip=" + skip);
            question.answerChangedFlag = true;
            if (skip) {
                question.patient_answer = [-9];
                if (!$scope.$$phase) {
                    $scope.$digest();
                }
            }
            else {
                //question.patient_answer[0].sliderAns = average($scope.minText, $scope.maxText);
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
                //question.patient_answer = [];
                vm.checkedNumber=vm.tmpAnswer.length;
                question.patient_answer = vm.tmpAnswer;
                console.log("UNCHECKING SKIP: " + Object(question.patient_answer));

                //question.patient_answer = [];
            }
            question.skip = !skip;
        }

        function skipQuestion(question) {
            question.patient_answer = ['SKIPPED'];
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        }

        function isDisabled(key) {
            var question = vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex];
            var answerIndex = question.patient_answer.indexOf(key);
            return !(answerIndex>-1) && (vm.checkedNumber >= vm.limitNumber);
        }

        function removeListener() {
            document.removeEventListener('ons-carousel:postchange', carouselPostChange);
        }
    }
}) ();