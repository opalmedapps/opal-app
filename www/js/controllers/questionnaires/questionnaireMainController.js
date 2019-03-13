(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('QuestionnaireMainController', QuestionnaireMainController);

    QuestionnaireMainController.$inject = [
        '$scope', '$timeout', '$rootScope', 'Questionnaires', '$location', 'NavigatorParameters', '$q', '$anchorScroll', '$sce', '$http', '$window', '$filter'
    ];

    /* @ngInject */
    function QuestionnaireMainController($scope, $timeout, $rootScope, Questionnaires, $location, NavigatorParameters, $q, $anchorScroll, $sce, $http, $window, $filter) {
        var vm = this;
        vm.beginQuestionnaire = beginQuestionnaire;
        vm.resumeQuestionnaire = resumeQuestionnaire;
        vm.resetCheckednumber = resetCheckednumber;
        vm.isResume = true;
        vm.viewAns='--';
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
        vm.bindScaleParameters = bindScaleParameters;
        vm.removeSpanChild = removeSpanChild;
        //vm.average = average;
        vm.choosenReaction = [{}];
        vm.skipQuestion = { 'reason': '', 'askSimilar': ''};
        vm.currentQuestion = {};
        vm.scaleQuestions = [];
        vm.tempAns= 1;
        vm.toggleViewAns = toggleViewAns;
        vm.totalNumberOfQuestions = 0;
        vm.ischeckedTest=false;
        vm.isCheckboxDisabled = isCheckboxDisabled;
        // vm.isTemp = true;
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
        vm.removeQuestionModal = null;

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

        // vm.swipeRightHandleCheckmark = function(question) {
        //     if(question.options[0].is_exact == '1' && vm.checkedNumber<vm.limitNumber) {
        //         checkmarkModal.show().then(carousel.next());
        //     } else {
        //         carousel.next();
        //     }
        // };

        vm.skipQuestionClose = function() {
            carousel.next();
            skip_question.hide();
        };
        vm.updateCurrentQuestion = function(itemIndex) {
            vm.currentQuestion = vm.carouselItems[itemIndex-1].data;
        };
        vm.isCheckedFcn = isCheckedFcn;

        // vm.fixSliderValue = fixSliderValue();

        vm.exists = function(item) {
            return vm.selected.indexOf(item)>-1;
        };

        vm.initializeSliderAns = initializeSliderAns;

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
            vm.checkboxSavingIndex = 0;
            vm.questionnaire = params.questionnaire;
            console.log("IN ACTIVATE() IN QUESTIONAIREMAINCONTROLLER: " + Object(params));
            console.log(params);
            manageRemovedQuestions();
            vm.carouselItems = flattenQuestionnaire(); // questions + section headers
            vm.tmpAnswer = [];
            for(var i=0;i<vm.questionnaire.sections.length; i++) {
                for(var j=0; j<vm.questionnaire.sections[i].questions.length;j++) {
                    vm.totalNumberOfQuestions++;
                }
            }

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
            if(!vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex].patient_answer.hasOwnProperty('answer')) {
                vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex].patient_answer.answer = [];
            }
            // if in progress, find spot patient left off at
            vm.startIndex = 0;
            if (vm.questionnaire.status == 'In Progress' && !vm.editQuestion) {
                console.log("In if");
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
                        if (vm.questionnaire.sections[i].questions[j].patient_answer.is_defined=='0') {
                            console.log("no answer to question: " + (j+1));
                            // console.log("sectionIndex is: " + vm.sectionIndex);
                            // console.log("questionIndex is: " + vm.questionIndex);
                            vm.maxQuestionIndex = vm.questionnaire.sections[vm.sectionIndex].questions.length-1;
                            i = vm.questionnaire.sections.length;
                            break;
                        } else {
                            if((vm.questionnaire.sections[i].questions[j].question_type_category_key == "slider") && (vm.questionnaire.sections[i].questions[j].visualization_name == 'large range')) {
                                vm.tempAns = vm.questionnaire.sections[i].questions[j].patient_answer.answer[0].sliderAns;
                                console.log("Changing vm.tempAns to " + vm.tempAns);
                                console.log(vm.questionnaire);
                            }
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
            else if (vm.questionnaire.status == 'In Progress' && vm.editQuestion) {
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

            console.log("HELLO CJ");
            console.log(vm);

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

        vm.checkmarkPopup = function(question) {
            vm.limitNumber = parseInt(question.options[0].nb_answer);
            if (question.question_type_category_key == 'checkbox') {
                if (question.options[0].is_exact == '1' && vm.checkedNumber < question.options[0].nb_answer && question.patient_answer.answer[0]!=='SKIPPED') {
                    //pop up saying the answer has not been saved because it is incomplete
                    checkmarkModal.show();
                }
            }
        };

        // vm.nextCarousel = function(question) {
        //     if(question.question_type_category_key == 'checkbox') {
        //         if(question.options[0].is_exact == '1' && vm.checkedNumber<vm.limitNumber) {
        //             //pop up saying the answer has not been saved because it is incomplete
        //             checkmarkModal.show();
        //         } else {
        //             carousel.next();
        //         }
        //     }
        //     else {
        //         carousel.next();
        //     }
        // };

        function toggleViewAns(question) {
            if(vm.tempAns !== 50 && question.patient_answer.answer[0].sliderAns == 50) {
                vm.viewAns = '--';
            } else {
                vm.viewAns = question.patient_answer.answer[0].sliderAns;
            }
        }

        vm.setCheckboxAnswer = function(question) {
            // vm.limitNumber = parseInt(question.options[0].nb_answer);
            // console.log('limitNumber= '+vm.limitNumber);
            if(typeof question.patient_answer.answer == 'undefined') {
                question.patient_answer.answer = [];
            }
            resetCheckednumber(question);
        };

        function carouselPostChange(event) {
            vm.updateCurrentQuestion(event.activeIndex);
            //console.log($scope.carousel.getActiveCarouselItemIndex());
            // going from questionnaire header page to first section
            if (event.lastActiveIndex == 0) {
                if(vm.questionnaire.status == 'In Progress' && vm.isResume){
                    vm.sectionIndex = 0;
                    vm.questionIndex = 0;
                    vm.questionTotalIndex = 0;
                    vm.checkedNumber = 0;
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
                    console.log("testing for textbox");
                    vm.checkmarkPopup(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                    saveAnswer(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                    vm.questionIndex++;
                    resetCheckednumber(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                    console.log('questTotalIndex = ' + vm.questionTotalIndex + " and questionIndex = " + vm.questionIndex);
                    vm.isQuestion = true;
                    console.log('Merge question is: ' + Object(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]));
                }
                // coming from question, going to section header
                else if (event.lastActiveIndex > 0 && vm.carouselItems[event.lastActiveIndex-1].type == 'question' && vm.carouselItems[event.activeIndex-1].type == 'header') {
                    vm.isQuestion = false;
                    vm.questionTotalIndex++;
                    vm.checkmarkPopup(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                    saveAnswer(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                    console.log("vm.sectionIndex="+vm.sectionIndex+ " and vm.questionIndex=" + vm.questionIndex);
                    if(vm.sectionIndex < vm.questionnaire.sections.length-1){
                        vm.sectionIndex++;
                        console.log('HERE1 sectionIndex= ' + vm.sectionIndex);
                    } else {
                        console.log("BUG BUG BUG: sectionIndex becomes too large!");
                    }
                    vm.questionIndex = 0;
                    resetCheckednumber(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                    vm.maxQuestionIndex = vm.questionnaire.sections[vm.sectionIndex].questions.length-1;
                    console.log('HERE2 ' + vm.questionTotalIndex + " and questionIndex = " + vm.questionIndex);
                    // coming from section header, going to question
                } else if (event.lastActiveIndex > 0 && vm.carouselItems[event.lastActiveIndex-1].type == 'header' && vm.carouselItems[event.activeIndex-1].type == 'question') {
                    vm.isQuestion = true;
                    resetCheckednumber(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                }
            }
            // if left swipe
            else if (event.activeIndex - event.lastActiveIndex < 0) {
                // coming from question, going to question
                if (event.lastActiveIndex > 0 && vm.carouselItems[event.lastActiveIndex-1].type == 'question' && vm.carouselItems[event.activeIndex-1].type == 'question') {
                    console.log("BEFORE BUG: sectionIndex=" + vm.sectionIndex + " and questionIndex=" + vm.questionIndex);
                    vm.questionTotalIndex--;
                    vm.checkmarkPopup(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                    saveAnswer(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                    vm.questionIndex--;
                    resetCheckednumber(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
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
                    resetCheckednumber(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                    vm.questionTotalIndex--;
                    console.log('HERE5 ' + vm.questionTotalIndex + " and questionIndex = " + vm.questionIndex);
                }
                // coming from question to section header
                else if (event.lastActiveIndex > 0 && vm.carouselItems[event.lastActiveIndex-1].type == 'question' && vm.carouselItems[event.activeIndex-1].type == 'header') {
                    vm.isQuestion = false;
                    vm.checkmarkPopup(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                    saveAnswer(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
                }
            }
            var question = vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex];
            // update color gradient
            updateColorGradient(Object.keys(question.options).length, question.polarity);
            vm.currentPolarity = question.polarity;
            // if answer was given in previous session, fill color in correctly
            if ((question.question_type_category_key == 'multiple choice') && (typeof question.answerColor == 'undefined') && question.patient_answer.answer.length > 0 && question.patient_answer.answer[0] != -1) {
                var keys = Object.keys(question.options);
                var answerIndex = keys.indexOf("" + question.patient_answer.answer[0]);
                updateOptionBackgroundColor(question, answerIndex)
            }
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        }

        function resetCheckednumber(question) {
            if(question.question_type_category_key == 'checkbox' && question.patient_answer.is_defined == '1') {
                if(question.patient_answer.answer[0].Skipped=='1') {
                    question.patient_answer.answer = ['SKIPPED'];
                    vm.checkedNumber = 0;
                } else {
                    vm.checkedNumber = question.patient_answer.answer.length;
                }
            } else {
                vm.checkedNumber = 0;
            }
        }

        function summaryPage() {
            console.log(vm.startIndex);
            console.log("section: " + vm.sectionIndex + " and question: " + vm.questionIndex);
            console.log("saving in summary page: " + vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
            saveAnswer(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);

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
                            data: vm.questionnaire.sections[i].questions[j],
                            addable: vm.questionnaire.sections[i].questions[j].is_addable === '1',
                            add: false,
                            feedbackSectionDown: true,
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

        vm.getNumFills = function(text) {
            return text.split(" ");
        };

        function manageRemovedQuestions(){
            for(var i = 0; i < vm.questionnaire.sections.length; i++)
                if(!vm.questionnaire.sections[i].questions)
                    vm.questionnaire.sections[i].questions = [];
        }

        vm.setMaxLength = setMaxLength;

        function setMaxLength(question) {
            document.getElementById("textType").maxLength = question.options[0].char_limit;
        }


        function bindScaleParameters(question) {
            console.log('this function bind scale parameters');
            //var keys = Object.keys(question.options);
            // console.log(question.options[0].min_value);
            // console.log(question.options[0].max_value);
            // if (keys.length != 2) {
            //     console.log("Option size should be 2, is " + keys.length);
            // }
            // else {
            //$scope.minText = question.options[0].min_value;
            //$scope.minCaption = question.options[0].min_caption;
            //$scope.maxText = question.options[0].max_value;
            //$scope.maxCaption = question.options[0].max_caption;

            // set the style of the options
            var min = question.options[0].min_value;
            var max = question.options[0].max_value;
            //console.log(min+" :min, max: "+max);
            $scope.options = []; //{opt: []};
            var options = $scope.options;
            for (var i = min; i <= max; i++) {
                options.push({text: i + "", value: i});
            }
            // console.log("scope.options: ", $scope.options);
            // console.log("options: ", options);
            var scalewidth = $(".scale").width();
            var scalebtn = {
                "height": "auto",
                "float": "left",
                "text-align": "center",
                "width": Math.floor(100 / options.length) + "\%"
            };
            //console.log($scope.scalebtn);
            // }

            // this is to avoid the problem of html not updating when controller updates
            var returning = {
                options: options,
                formatting: scalebtn
            };

            return returning;

        }

        function initializeSliderAns(question){
            console.log('in initializeSliderAns');
            console.log(question);
            if(question.optional == '1' && question.patient_answer.answer[0].Skipped == '1'){
                question.patient_answer.answer[0].sliderAns = 'SKIPPED';
            }
        }

        // function fixSliderValue(question){
        //     console.log("2 tempAns = "+ vm.tempAns);
        //     question.patient_answer[0].sliderAns = vm.tempAns;
        // }

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
                $scope.carousel.next();
                $scope.carousel.prev();
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
            if (question.answerChangedFlag || question.question_type_category_key == 'slider') {
                console.log("saveanswer()");
                console.log(question.question_type_category_key);
                console.log("patient answer is: ");
                console.log(Object(question.patient_answer));
                if(question.question_type_category_key === 'slider') {
                    if(!question.patient_answer.hasOwnProperty('answer')) {
                        console.log('Adding answer property');
                        question.patient_answer.answer = [{sliderAns:''}];
                    }
                    if(question.patient_answer.answer.length === 0){
                        question.patient_answer.answer.push({})
                    }
                    if(!question.patient_answer.answer[0].hasOwnProperty('sliderAns')) {
                        if (vm.tempAns !== 50 && question.patient_answer.answer[0].sliderAns == 50) {
                            question.patient_answer.answer[0].sliderAns = vm.tempAns;
                        }
                    }
                    Questionnaires.saveQuestionnaireAnswer(vm.questionnaire.qp_ser_num, question.ser_num, question.patient_answer.answer[0].sliderAns, question.options[0].answer_option_ser_num, question.question_type_category_key, vm.questionnaire.sections[vm.sectionIndex].section_ser_num);
                } else if(question.question_type_category_key == 'textbox') {
                    Questionnaires.saveQuestionnaireAnswer(vm.questionnaire.qp_ser_num, question.ser_num, question.patient_answer.answer[0].text, question.options[0].answer_option_ser_num, question.question_type_category_key, vm.questionnaire.sections[vm.sectionIndex].section_ser_num);
                } else if(question.question_type_category_key == 'checkbox') {
                    if(!(question.options[0].is_exact == '1' && vm.checkedNumber < question.options[0].nb_answer) || question.patient_answer.answer[0]=='SKIPPED') {
                        if(question.patient_answer.answer[0]=='SKIPPED') {
                            Questionnaires.saveQuestionnaireAnswer(vm.questionnaire.qp_ser_num, question.ser_num, -1, 'SKIPPED', question.question_type_category_key, vm.questionnaire.sections[vm.sectionIndex].section_ser_num);
                        } else {
                            var toReturn = [];
                            for (var i = 0; i < question.patient_answer.answer.length; i++) {
                                toReturn.push(question.patient_answer.answer[i].CheckboxAnswerOptionSerNum);
                            }
                            Questionnaires.saveQuestionnaireAnswer(vm.questionnaire.qp_ser_num, question.ser_num, -1, toReturn, question.question_type_category_key, vm.questionnaire.sections[vm.sectionIndex].section_ser_num);
                        }
                    }
                } else {
                    console.log("about to call save quest answer");
                    console.log(question);
                    // TODO: skipped does not save for multiple choice, this is a quick fix, write it in a better way later
                    if(question.patient_answer.answer[0] === 'SKIPPED'){
                        Questionnaires.saveQuestionnaireAnswer(vm.questionnaire.qp_ser_num, question.ser_num, -1, 'SKIPPED', question.question_type_category_key, vm.questionnaire.sections[vm.sectionIndex].section_ser_num);
                    }else{
                        Questionnaires.saveQuestionnaireAnswer(vm.questionnaire.qp_ser_num, question.ser_num, -1, question.options[question.patient_answer.answer[0]].answer_option_ser_num, question.question_type_category_key, vm.questionnaire.sections[vm.sectionIndex].section_ser_num);
                    }
                }
                if (vm.questionnaire.status == 'New') {
                    Questionnaires.updateQuestionnaireStatus(vm.questionnaire.qp_ser_num, 'In Progress');
                    vm.questionnaire.status = "In Progress";
                }
            }
            //saving question feedback
            if(question.patient_answer.hasOwnProperty('feedback')) {
                console.log('SAVE FEEDBACK');
                console.log(question.patient_answer.feedbackText);
                console.log(question.patient_answer.feedback);


                // var nlpEnable = question.patient_answer.nlpFeedbackEnable;
                //
                // if (!nlpEnable || nlpEnable === "false") {
                //     nlpEnable = false;
                // } else {
                //     nlpEnable = true;
                // }

                console.log(vm.enableNlp);

                Questionnaires.saveQuestionFeedback(vm.questionnaire.qp_ser_num,question.ser_num,question.patient_answer.feedback, vm.questionnaire.sections[vm.sectionIndex].section_ser_num, question.patient_answer.feedbackText, vm.enableNlp);
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
            question.answerChangedFlag = true;
            console.log("Question.patient_answer is ");
            console.log(Object(question.patient_answer));
            console.log("checknumber = "+vm.checkedNumber);
            if(!question.hasOwnProperty('patient_answer')) {
                question.patient_answer= {};
            }
            if(!question.patient_answer.hasOwnProperty('answer')) {
                question.patient_answer.answer=[];
            }
            //question.patient_answer.answer = (!question.patient_answer.hasOwnProperty('answer'))? []:question.patient_answer.answer;

            //if previous choice was to skip question, toggle skip boolean
            if (question.patient_answer.answer.indexOf("SKIPPED") > -1) {
                toggleCheckboxSkip(false, question);
            }

            console.log("Object is "+Object(question.patient_answer));

            //var answerIndex = question.patient_answer.answer.indexOf({CheckboxAnswerOptionSerNum:optionKey});
            var answerIndex = question.patient_answer.answer.map(function(e) { return e.CheckboxAnswerOptionSerNum; }).indexOf(optionKey);
            console.log("Selected option sernum = " + answerIndex);

            // is currently selected, remove it
            if (answerIndex > -1) {
                question.answerChangedFlag = true;
                question.patient_answer.answer.splice(answerIndex, 1);
                vm.tmpAnswer = question.patient_answer.answer;
                vm.checkedNumber=question.patient_answer.answer.length;
                console.log("In if, checkedNumber = "+vm.checkedNumber);
                console.log("Object after splice in if is "+Object(question.patient_answer));
                console.log("tmpAnswer = " + Object(vm.tmpAnswer));
                console.log(Object(question.patient_answer));
            } else { // is newly selected
                question.answerChangedFlag = true;
                question.patient_answer.is_defined = '1';
                //question.patient_answer.push(optionKey);
                // push answer to answer array
                //question.patient_answer[vm.checkboxSavingIndex].AnsSerNum=optionKey;
                // if(vm.checkboxSavingIndex==0) {
                //     question.patient_answer.answer = [{'CheckboxAnswerOptionSerNum':''}];
                //     question.patient_answer.answer[0].CheckboxAnswerOptionSerNum=optionKey;
                //
                //     //question.patient_answer.answer.push({'CheckboxAnswerOptionSerNum':optionKey});
                // } else {
                question.patient_answer.answer.push({'CheckboxAnswerOptionSerNum':optionKey});
                // }
                // vm.checkboxSavingIndex++;
                console.log("Answer array");
                console.log(Object(question.patient_answer));
                vm.checkedNumber=question.patient_answer.answer.length;
                console.log("In else, checkedNumber = "+vm.checkedNumber);
                console.log("Object after push in if else else is "+Object(question.patient_answer));
                vm.tmpAnswer = question.patient_answer.answer;
                console.log("tmpAnswer = " + Object(vm.tmpAnswer));
            }
            console.log("Object at the end is ");
            console.log(Object(question.patient_answer));
        }

        function isCheckedFcn(optionKey) {
            var question = vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex];
            var answerIndex = question.patient_answer.indexOf(optionKey);
            return (answerIndex > -1);
        }

        function toggleScaleSkip(skip, question) {
            console.log("CHECK answerChangedFlag= " + question.answerChangedFlag + " and skip=" + skip);
            question.answerChangedFlag = true;
            if (skip) {
                question.patient_answer.answer[0].Skipped = '1';
                question.patient_answer.answer[0].sliderAns = 'SKIPPED';
                if (!$scope.$$phase) {
                    $scope.$digest();
                }
            }
            else {
                question.patient_answer.answer[0].Skipped = '0';
                question.patient_answer.answer[0].sliderAns = '';
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
                question.patient_answer.answer = vm.tmpAnswer;
                resetCheckednumber(question);
                console.log("UNCHECKING SKIP: " + Object(question.patient_answer));

                //question.patient_answer = [];
            }
            question.skip = !skip;
        }
        // Bug Here
       vm.setFeedbackTitleText = function(question){
            if(question) {
                return question.patient_answer.feedback ? question.feedback_options[question.patient_answer.feedback-question.feedback_options[0].feedback_ser_num].feedback_title_text : question.feedback_title_text;
            }
        };

        vm.firstFeedback = true;
        vm.isFirstFeedback = function(){
            console.log("FIRSY FEEDBACK");
            if(vm.firstFeedback){
                console.log("YES IT IS");
                nlpModal.show();
                vm.firstFeedback = false;
            }
        };

        vm.enableNlp = true;
        vm.setNLP = function(enable){
            vm.enableNlp = enable;
            nlpModal.hide();
        };

        vm.popRemoveQuestionModal = function(){
            if(vm.removeQuestionModal == null)
                vm.removeQuestionModal = removeQuestionModalTemp;
            vm.removeQuestionModal.toggle();
        };

        vm.feedbackIcon = function(question, item, feedbackOptionNum) {
            console.log(question);
            let feedbackTitle = document.getElementById('feedbackTitle_'+item.data.ser_num);

            if (question.patient_answer.feedback != question.feedback_options[feedbackOptionNum].feedback_ser_num) {
                question.patient_answer.feedback = question.feedback_options[feedbackOptionNum].feedback_ser_num;
                vm.pullUpComment('questionFeedbackText_'+item.data.ser_num);
                item.feedbackSectionDown = false;
            } else {
                question.patient_answer.feedback = null;
                vm.pushDownComment('questionFeedbackText_'+item.data.ser_num);
                item.feedbackSectionDown = true;
            }
            vm.isFirstFeedback();
        };


        // Jordan Added
        vm.toggleFeedback = function(item){
            let id = 'questionFeedbackText_'+item.data.ser_num;
            if(item.feedbackSectionDown)
                vm.pullUpComment(id);
            else
                vm.pushDownComment(id);
            item.feedbackSectionDown = !item.feedbackSectionDown;

            vm.isFirstFeedback();
        };

        vm.pullUpComment = function(id){
            var feedback = document.getElementById(id);
            feedback.className ='pull-up up-position';
        };

        vm.pushDownComment = function(id){
            var feedback = document.getElementById(id);
            feedback.className = 'push-down down-position';
        };

        vm.removeQuestion = function(){
            Questionnaires.removeQuestionFromPatientQuestionnaire(vm.questionnaire.qp_ser_num,vm.currentQuestion.ser_num);
            vm.popRemoveQuestionModal();
            carousel.next();
        };

        vm.isCheckedCheckmark = function(question, optionKey) {
            return (question.patient_answer.answer.map(function(e) { return e.CheckboxAnswerOptionSerNum; }).indexOf(optionKey) > -1);
        };

        function skipQuestion(question) {
            question.patient_answer.answer = ['SKIPPED'];
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        }

        function isCheckboxDisabled(question, optionKey) {
            // var question = vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex];
            var answerIndex = question.patient_answer.answer.map(function(e) { return e.CheckboxAnswerOptionSerNum; }).indexOf(optionKey);
            return !(answerIndex>-1) && (vm.checkedNumber >= question.options[0].nb_answer || question.patient_answer.answer[0]=='SKIPPED');
        }

        function removeListener() {
            document.removeEventListener('ons-carousel:postchange', carouselPostChange);
        }
    }
}) ();
