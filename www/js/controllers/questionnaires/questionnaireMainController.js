/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/


var app1 = angular.module('MUHCApp');
app1.controller('QuestionnaireMainController', function ($scope, $location, $anchorScroll, $rootScope, $sce, $http, $window, $filter, progressBarManager, Questionnaires, $timeout, NavigatorParameters, UserPreferences, Params) {

    // Questionnaires.getQuestionnaireAnswers();
    if (Questionnaires.isEmpty()) {
        $scope.emptyQuestionnaires = true;
    } else {
        $scope.emptyQuestionnaires = false;
        initQuestionnaire();


    }

    function initQuestionnaire() {
        var params = NavigatorParameters.getParameters();
        $scope.questionnaireDBSerNum = params.DBSerNum;
        $scope.subAnswers = false;
        $scope.language = UserPreferences.getLanguage().toUpperCase();
        $scope.sourceTab = params.Tab; // Source tab from which this questionnaire was clicked (new, progress or completed).

        $scope.reachEnd = false; // Reset this variable to hide the "Go to summary" button.

        $scope.questionnaireSerNum = params.SerNum;


        $scope.clickedScrollArrow = new Array();

        // $scope.subData = Questionnaires.isQuestionnaireComplete($scope.questionnaireDBSerNum);

        // TEMPORARY: commenting out this function call because it fails on text field questions, and because the In progress tab was removed.
        // setQuestionnaireAnswersObject(Questionnaires.getQuestionnaireAnswers($scope.questionnaireSerNum));
        $scope.questionaires = Questionnaires.getPatientQuestionnaires().Questionnaires;

        $scope.questionaire = $scope.questionaires[$scope.questionnaireDBSerNum];
        questionsObject = $scope.questionaire.Questions;
        $scope.questions = [];

        for (key in questionsObject) {
            $scope.questions.push(questionsObject[key]);
        }

        /* Each question's OrderNum is received as a string. It must be converted to an int so that the orderBy filter
         * can sort the questions correctly.
         * -SB */
        for (let i = 0; i < $scope.questions.length; i++) {
            $scope.questions[i].OrderNum = parseInt($scope.questions[i].OrderNum);
        }

        $scope.questions = $filter('orderBy')($scope.questions, 'OrderNum', false);
        $scope.clickedScrollArrow = new Array($scope.questions.length);


        for (i = 0; i < $scope.questions.length; i++) {
            $scope.clickedScrollArrow[i] = false;
        }


        $scope.question;
        $scope.options;
        $scope.shown = new Array($scope.questions.length);
        $scope.answerShown = new Array($scope.questions.length);
        $scope.checkbox1 = new Array($scope.questions.length);
        $scope.carousel;
        $scope.homepage;
        $scope.sumpage;

        ons.orientation.on("change", function (event) {

            var i = $scope.carousel._scroll / $scope.carousel._currentElementSize;
            delete $scope.carousel._currentElementSize;
            $scope.carousel.setActiveCarouselItemIndex(i);
        });

        var listener = document.addEventListener('ons-carousel:postchange', carouselPostChange);

    }

    function carouselPostChange(event) {

        if (event != undefined) {
            $scope.carousel = event.carousel;
            $scope.index = event.activeIndex;
        }
        if ($scope.index == 0) {
            $scope.homepage = true;
        } else {
            $scope.homepage = false;
        }

        if ($scope.index == ($scope.questions.length + 1)) {
            $scope.sumpage = true;
        } else {
            $scope.sumpage = false;
        }


        returnIndex();

        if ($scope.answers != undefined) {

        }

        if ($scope.index >= $scope.questions.length) {

            $scope.checkboxString = '';
            // At first there should be no answer shown
            for ($i = 0; $i < $scope.questions.length; $i++) {
                $scope.answerShown[$i] = false;
            }
        }

        if ($scope.index > $scope.questions.length) {
            // They have reached the end and now the "Go To Summary Page" button should be shown on all the pages
            $scope.reachEnd = true;
        }


        for ($i = 1; $i <= $scope.shown.length; $i++) {
            if ($i == $scope.index) {
                $scope.shown[$i - 1] = true;
            } else {
                $scope.shown[$i - 1] = false;
            }
        }


        if (($scope.index <= $scope.questions.length) && ($scope.index > 0)) {
            $scope.question = $scope.questions[$scope.index - 1];
            $scope.questionText = ($scope.language === "EN") ? $scope.question.QuestionText_EN : $scope.question.QuestionText_FR;

            if ($scope.question.QuestionType == 'MC') {
                if (($scope.question != undefined) && ($scope.question.Choices != undefined)) {
                    $scope.options = $scope.question.Choices;

                }
                $scope.checked1 = [];
                $scope.answer;
                setChecked();
            } else if ($scope.question.QuestionType == 'MinMax') {
                $scope.setCheckedScale = new Array(10);
                for ($i = 0; $i < 10; $i++) {
                    $scope.setCheckedScale = $scope.getChecked($i);
                }
                // If the source is LEE than there are only 5 options
                // stores which button is clicked
                $scope.buttons = [true, false, false, false, false, false, false, false, false, false, false];
                // all the numbers that coule be clicked, except there is no 0, 0 is there for the reason that an empty progress bar
                // is shown if nothing is clicked
                $scope.numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

                // Percentage heights of different vertical progress bars
                $scope.heights = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
                /*
                        if ($scope.question.Choices[1].OrderNum == 5) {
                          // Possible answers excluding 0. Just there to take place in the array.
                          $scope.buttons = $scope.buttons.slice(0, 6);
                          $scope.numbers = $scope.numbers.slice(0, 6);
                          $scope.heights = [0, 20, 40, 60, 80, 100];
                        }
                */
                var numberOfRatings = parseInt($scope.question.Choices[1].OrderNum);

                $scope.buttons = $scope.buttons.slice(0, numberOfRatings + 1);
                $scope.numbers = $scope.numbers.slice(0, numberOfRatings + 1);
                $scope.heights = $scope.heights.slice(0, numberOfRatings + 1);

                /*
                        if ($scope.question.Choices[1].OrderNum == 4) {
                            // Possible answers excluding 0. Just there to take place in the array.
                            $scope.buttons = $scope.buttons.slice(0, 5);
                            $scope.numbers = $scope.numbers.slice(0, 5);
                            $scope.heights = [0, 25, 50, 75, 100];
                        } else if ($scope.question.Choices[1].OrderNum == 5) {
                            // Possible answers excluding 0. Just there to take place in the array.
                            $scope.buttons = $scope.buttons.slice(0, 6);
                            $scope.numbers = $scope.numbers.slice(0, 6);
                            $scope.heights = [0, 20, 40, 60, 80, 100];
                        } else if ($scope.question.Choices[1].OrderNum == 7) {
                            // Possible answers excluding 0. Just there to take place in the array.
                            $scope.buttons = $scope.buttons.slice(0, 8);
                            $scope.numbers = $scope.numbers.slice(0, 8);
                            $scope.heights = [0, 25, 37, 50, 62, 75, 87, 100];
                          }
                */

                // Background color of empty progress bar is initially white
                $scope.colors = ['white'];
                var length = $scope.heights.length;
                setColors(length, $scope.question.isPositiveQuestion);


                if (($scope.answers != undefined) && ($scope.answers[$scope.index - 1] != undefined)) {
                    num = $scope.answers[$scope.index - 1];
                    for ($i = 0; $i < $scope.buttons.length; $i++) {
                        if (num == $i) {
                            $scope.buttons[$i] = true;
                        } else {
                            $scope.buttons[$i] = false;
                        }
                    }
                }

            } else if ($scope.question.QuestionType == 'yes') {
                if (typeof $scope.answers !== "undefined" && $scope.answers[$scope.index - 1] == 'Yes') {
                    $scope.checkedYes = true;
                    $scope.checkedNo = false;
                } else if (typeof $scope.answers !== "undefined" && $scope.answers[$scope.index - 1] == 'No') {
                    $scope.checkedYes = false;
                    $scope.checkedNo = true;
                } else {
                    $scope.checkedYes = false;
                    $scope.checkedNo = false;
                }
                // checkbox stores the value of the clicked button
                $scope.checkbox = undefined;
            } else if ($scope.question.QuestionType == 'image') {
                $scope.colors = Params.colorsArray;

                if ($scope.answers == undefined) {
                    $scope.answers = new Array(Questionnaires.getQuestions().length);
                    $scope.barTrack = {};
                    $scope.i = 0;
                    $scope.prog = 0;
                } else if ($scope.answers[$scope.index - 1] != undefined) {
                    $scope.barTrack = {};
                    for (x in $scope.answers[$scope.index - 1]) {
                        $scope.barTrack[x] = $scope.answers[$scope.index - 1][x] * 10;
                    }

                    $scope.i = undefined
                    $scope.prog = undefined;
                } else {
                    $scope.i = 0;
                    $scope.prog = 0;
                    $scope.barTrack = {};
                }

                if (question != undefined) {
                    if (question.assesses == 'Front Pain') {
                        $scope.frontPic = true;
                        $scope.left = 'Right';
                        $scope.right = 'Left';
                        $scope.midSection = 'Torso';
                        $scope.lowSection = 'Genitals/Lower Stomach';
                        $scope.id = '#front';
                    } else {
                        $scope.frontPic = false;
                        $scope.left = 'Left';
                        $scope.right = 'Right';
                        $scope.midSection = 'Back';
                        $scope.lowSection = 'Buttocks';
                        $scope.id = '#back';
                    }
                    var elementHeight = $($scope.id)[0].height;
                    var elementWidth = $($scope.id)[0].width;

                    $timeout(function () {
                        $scope.iHeight = elementHeight;
                        $scope.elementWidth = elementWidth;
                        $scope.rightShift = 0.05125 * $scope.width;
                        $scope.imageWidth = elementWidth;
                        $scope.headWidth = $scope.headPercent * elementWidth;
                        $scope.headHeight = $scope.headHeightPercent * elementHeight;
                        $scope.midSectionHeight = $scope.midSectionHeightPercent * elementHeight;
                        $scope.torsoWidth = $scope.torsoPercent * elementWidth;
                        $scope.leftMarginArm = (($scope.width - elementWidth) / 2) - ((6 / 24) * $scope.width);
                        $scope.leftArmWidth = $scope.leftArmWidthPercent * elementWidth;
                        $scope.innerTorsoMarginLeft = -1 * $scope.innerTorsoPercent * elementWidth;
                        $scope.handLegLeftMargin = $scope.handLegLeftMarginPercent * elementWidth;
                        $scope.rightHandWidth = $scope.rightHandPercentage * elementWidth;
                        $scope.leftHandWidth = $scope.leftHandPercentage * elementWidth;
                    }, 10);
                }
            } else if ($scope.question.QuestionType == 'Checkbox') {
                $scope.options = $scope.question.Choices;

                $scope.checked = new Array($scope.options.length);
                $scope.choices = new Array($scope.options.length);

                if ($scope.options != undefined) {
                    if ($scope.answers != undefined) {

                        for ($i = 0; $i < $scope.checked.length; $i++) {
                            if ($scope.answers[$scope.index - 1] != undefined) {
                                if ($scope.answers[$scope.index - 1][$i] == undefined) {
                                    $scope.checked[$i] = false;
                                } else {
                                    $scope.checked[$i] = true;
                                    $scope.choices[$i] = $scope.answers[$scope.index - 1][$i];
                                }
                            }
                        }
                        if ($scope.answers[$scope.index - 1] != undefined) {

                        }
                        if (($scope.answers[$scope.index - 1] != undefined) && ($scope.answers[$scope.index - 1][$scope.checked.length - 1] == 'None of the Above')) {
                            $scope.noneChecked = true;
                        } else {
                            $scope.noneChecked = false;
                        }
                    }
                }


            } else if ($scope.question.QuestionType == 'SA') {
                if ($scope.answers != undefined) $scope.longAns = $scope.answers[$scope.index - 1];
            }


            $timeout(function () {
                if ($scope.numAnswered == undefined) {
                    $scope.numAnswered = 0;
                }
                if ($scope.answers == undefined) {
                    $scope.answers = new Array($scope.questions.length);
                }
            });
        }
    };


    $scope.goToSummary = function () {
        $scope.carousel.setActiveCarouselItemIndex($scope.questions.length + 1);
    }

    $scope.start = function () {
        $scope.carousel.setActiveCarouselItemIndex(1);
    }

    $scope.back = function () {
        $scope.carousel.setActiveCarouselItemIndex($scope.index - 1);
    }

    $scope.forward = function () {
        $scope.carousel.setActiveCarouselItemIndex($scope.index + 1);
    }

    $scope.trustAsHtml = function (questionText) {
        if ($scope.question != undefined) {
            assesses = ($scope.language === "EN") ? $scope.question.Asseses_EN : $scope.question.Asseses_FR;
        } else {
            return;
        }
        i = questionText.search(assesses);
        if (i == -1) {
            // Removing the <h4> tag so that questionText is dynamic based on the user's chosen font size.
            // newHtml = "<h4>" + questionText + "</h4>";
            newHtml = questionText;
        } else {
            questionPart1 = questionText.slice(0, i);
            questionPart2 = questionText.slice(i + assesses.length);
            // Removing the <h4> tag so that questionText is dynamic based on the user's chosen font size.
            // newHtml = "<h4>" + questionPart1 + "<span style='color:darkmagenta'><strong>" + assesses + "</strong></span>" + questionPart2 + "</h4>";
            newHtml = questionPart1 + "<span style='color:darkmagenta'><strong>" + assesses + "</strong></span>" + questionPart2;
        }
        return $sce.trustAsHtml(newHtml);
    }

    $scope.trustThisAsHtml = function () {
        return $sce.trustAsHtml(($scope.language === "EN") ? $scope.questionaire.Intro_EN : $scope.questionaire.Intro_FR);
    }

    function setQuestionnaireAnswersObject(object) {

        if (object == undefined) {
            return;
        }
        answers = object.Answers;

        $scope.answers = {};
        for (key in answers) {
            // orderNum = questionsObject[key].OrderNum;
            orderNum = questionsObject[key].Choices[1].OrderNum; // This line has a bug because text field questions have no Choices.
            $scope.answers[orderNum - 1] = answers[key].Answer;
        }

    }

    $scope.questionnaireInProgress = function () {
        return Questionnaires.isQuestionnaireInProgress($scope.questionnaireSerNum);
    }

    function returnIndex() {
        $timeout(function () {
            $scope.toolbarIndex = $scope.index;

        });
    }

    $scope.getHomePage = function () {
        if ($scope.index == undefined) {
            return true;
        } else {

            if ($scope.shown[$scope.index] == true) {
                return true;
            } else {
                return false;
            }
        }
    }

    $scope.goToBottom = function (position, index) {


        $scope.clickedScrollArrow[index] = true;

        $location.hash(position);
        $anchorScroll();
    };

    // function getScrollButtonTop () {
    //   $timeout(function () {
    //
    //
    //   });
    // }

    $scope.$on('$destroy', function () {

        document.removeEventListener('ons-carousel:postchange', carouselPostChange);
        ons.orientation.off("change");
    });

    // Question 1 Controller
    /////////////////////////
    /////////////////////////


    // checked stores whether or not the option is clicked or not. objectClass stores what class a particular list item will take.
    // Encountered a really weird problem here where if the checked value was anything but undefined it was unchecked. So the values
    // start off as false and later on when they are clicked are changed to undefined. Weird but works!
    function setChecked() {
        var choiceDescription = "";

        if (($scope.options != undefined) && ($scope.answers != undefined) && ($scope.answers[$scope.index - 1] != undefined)) {
            ans = $scope.answers[$scope.index - 1];
            for ($i = 0; $i < $scope.options.length; $i++) {
                choiceDescription = ($scope.language === "EN") ? $scope.options[$i].ChoiceDescription_EN : $scope.options[$i].ChoiceDescription_FR;
                if ((ans != undefined) && (ans == choiceDescription)) {
                    $scope.checked1[$i] = true;
                } else {
                    $scope.checked1[$i] = false;
                }
            }
            // if (((ans != undefined) && (ans.Answer == 'other')) || ($scope.checkbox == 'other')) {
            //     $scope.checked1[$scope.options.length] = true;
            // } else {
            //     $scope.checked1[$scope.options.length] = false;
            // }
        }
    }

    // Run when one of the options is clicked
    $scope.clicked1 = function (option, i, otherAns) {

        // Get the option text
        var optionText;
        if (option === "other") {
            console.log("'Other' option for multiple choice where the user can enter in what they want has not been configured.");
            optionText = option;
        }
        else if (typeof option.ChoiceDescription_EN !== "undefined" || typeof option.ChoiceDescription_FR !== "undefined") {
            optionText = ($scope.language === 'EN') ? option.ChoiceDescription_EN : option.ChoiceDescription_FR;
        }
        else {
            optionText = "MISSING_VALUE";
        }

        // iterates the number of answered questions if something is clicked
        if ($scope.answers[$scope.index - 1] == undefined) {
            $scope.numAnswered = $scope.numAnswered + 1;
        }
        // checkbox stores the answer chosen.
        $scope.checkbox1[$scope.index - 1] = optionText;

        // makes all the checked values false for the moment
        for ($i = 0; $i <= $scope.options.length; $i++) {
            $scope.checked1[$i] = false;
        }
        // makes the clicked, checked value, undefined because of the bug mentioned earlier.
        $scope.checked1[i] = true;
        $scope.answer = optionText;
        // Stores the answer as an object where there is the clicked answer and a possibly defined variable called otherAns
        // this stores the possibly filled out other value
        $scope.answers[$scope.index - 1] = optionText;

            // $scope.answers[$scope.index - 1] = {
        //     Answer: optionText,
        //     // otherAns: otherAns    // DO NOT SEND BACK otherAns because management do not want this option + Column does not exist in the database.
        // };
        Questionnaires.setQuestionnaireAnswers($scope.answers[$scope.index - 1], $scope.questions[$scope.index - 1].QuestionnaireQuestionSerNum, $scope.questionnaireDBSerNum, $scope.questionnaireSerNum);
        // If other is chosen but they havent filled it in than the answer is made undefined and the number of answered questions is
        // subtracted by 1
        if ((optionText == 'other') && ((otherAns == undefined) || (otherAns == ""))) {
            $scope.answers[$scope.index - 1] = undefined;
            Questionnaires.setQuestionnaireAnswers(undefined, $scope.questions[$scope.index - 1].QuestionnaireQuestionSerNum, $scope.questionnaireDBSerNum, $scope.questionnaireSerNum);
            $scope.numAnswered = $scope.numAnswered - 1;
        }
    }

    // Checks whether the box should be collapsed or not for the other answer.
    $scope.checkCollapse = function (checkbox) {
        if (($scope.checkbox1 != undefined) && ($scope.checkbox1[$scope.index - 1] == 'other')) {
            $scope.checked1[$scope.options.length] = true;
            return true;
        } else {
            $scope.otherAns = undefined;
        }
    };

    // Question 2 Controller
    /////////////////////////
    /////////////////////////

    $scope.numAnswers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];


    // Sets the different possible colors the progress bars can have.
    function setColors(len, isPositiveQuestion) {


        if (isPositiveQuestion) {
            for ($i = 1; $i < len; $i++) {
                if ($i <= (len / 5 * 1)) {
                    $scope.colors[$i] = 'darkred';
                } else if ($i < (len / 5 * 3)) {
                    $scope.colors[$i] = 'red';
                } else if ($i < (len / 5 * 4)) {
                    $scope.colors[$i] = 'orange';
                } else {
                    $scope.colors[$i] = 'lime';
                }
            }
        } else {
            for ($i = 1; $i < len; $i++) {
                if ($i <= (len / 5 * 1)) {
                    $scope.colors[$i] = 'lime';
                } else if ($i < (len / 5 * 3)) {
                    $scope.colors[$i] = 'orange';
                } else if ($i < (len / 5 * 4)) {
                    $scope.colors[$i] = 'red';
                } else {
                    $scope.colors[$i] = 'darkred';
                }
            }
        }

    }

    $scope.getChecked = function (num) {
        if ($scope.answers != undefined) {
            if ($scope.answers[$scope.index - 1] == num) {
                return true;
            } else {
                return false;
            }
        }
    }

    // Run when one of the buttons is clicked.
    $scope.clicked2 = function (ans, index) {
        // Number of answered questions incremented
        if ($scope.answers[$scope.index - 1] == undefined) {
            $scope.numAnswered = $scope.numAnswered + 1;
        }
        // No longer show the empty progress bar
        $scope.buttons[0] = false;

        $scope.answers[$scope.index - 1] = ans;
        Questionnaires.setQuestionnaireAnswers(ans, $scope.questions[$scope.index - 1].QuestionnaireQuestionSerNum, $scope.questionnaireDBSerNum, $scope.questionnaireSerNum);


        // Setting which buttons was clicked
        for ($i = 0; $i < $scope.heights.length; $i++) {
            if ($i == ans) {
                $scope.buttons[$i] = true;
            } else {
                $scope.buttons[$i] = false;
            }
        }

    };

    // Question 3 Controller
    /////////////////////////
    /////////////////////////
    $scope.answer3 = function (checkbox, index) {
        // If a button is clicked the num answered variable is iterated.
        if ($scope.answers[$scope.index - 1] == undefined) {
            $scope.numAnswered = $scope.numAnswered + 1;
        }
        $scope.answers[$scope.index - 1] = checkbox;
        if(checkbox === "Yes"){
            $scope.checkedYes = true;
            $scope.checkedNo = false;
        }
        else if (checkbox === "No"){
            $scope.checkedNo = true;
            $scope.checkedYes = false;
        }
        Questionnaires.setQuestionnaireAnswers(checkbox, $scope.questions[$scope.index - 1].QuestionnaireQuestionSerNum, $scope.questionnaireDBSerNum, $scope.questionnaireSerNum);
    }

    // Question 4 Controller
    /////////////////////////
    /////////////////////////

    // Run when the text input is changed
    $scope.answer4 = function (answer) {
        // If the question is answered the numAnsweredVariable is iterated
        if ($scope.answers[$scope.index - 1] == undefined) {
            $scope.numAnswered = $scope.numAnswered + 1;
        }
        $scope.answers[$scope.index - 1] = answer;
        Questionnaires.setQuestionnaireAnswers(answer, $scope.questions[$scope.index - 1].QuestionnaireQuestionSerNum, $scope.questionnaireDBSerNum, $scope.questionnaireSerNum);
        // If the user deletes their answer so that it becomes an empty string the answer is changed to undefined and the numAnswered
        // variable is decremented
        if (answer == "") {
            $scope.answers[$scope.index - 1] = undefined;
            Questionnaires.setQuestionnaireAnswers(undefined, $scope.questions[$scope.index - 1].QuestionnaireQuestionSerNum, $scope.questionnaireDBSerNum, $scope.questionnaireSerNum);
            $scope.numAnswered = $scope.numAnswered - 1;
        }
    }

    // Image Controller
    /////////////////////////
    /////////////////////////

    $scope.left;
    $scope.right;
    $scope.midSection;
    $scope.lowSection;
    $scope.i;
    $scope.prog = 0;
    $scope.barTrack = {};
    $scope.width = document.documentElement.clientWidth;
    $scope.height = document.documentElement.clientHeight;
    $scope.headPercent = 0.31434783;
    $scope.headHeightPercent = 0.15136719;
    $scope.torsoPercent = 0.47826087;
    $scope.innerTorsoPercent = 0.06777938;
    $scope.leftArmWidthPercent = 0.25897555;
    $scope.midSectionHeightPercent = 0.34999023;
    $scope.handLegLeftMarginPercent = 0.07201559;
    $scope.rightHandPercentage = 0.25417267;
    $scope.leftHandPercentage = 0.23510972;
    $scope.head;
    $scope.areaClicked;

    $scope.clickedImage = function (area) {

        if (($scope.answers[$scope.index - 1] == undefined) || (Object.keys($scope.answers[$scope.index - 1]).length === 0)) {
            $scope.numAnswered = $scope.numAnswered + 1;

        }
        if ($scope.answers[$scope.index - 1] == undefined) {
            $scope.answers[$scope.index - 1] = {};
        }

        if ($scope.answers[$scope.index - 1][area] == undefined) {
            $scope.answers[$scope.index - 1][area] = 1;
            $scope.barTrack[area] = 10;
            $scope.prog = 10;
        }

    }

    $scope.startCounter = function (part) {
        if ($scope.answers[$scope.index - 1] == undefined) {
            $scope.answers[$scope.index - 1] = {};
            $scope.barTrack = {};
        } else {
            if ($scope.answers[$scope.index - 1][part] == undefined) {
                $scope.i = 1;
                $scope.prog = $scope.i * 10;
                $scope.answers[$scope.index - 1][part] = $scope.i;
                $scope.barTrack[part] = $scope.i * 10;
            } else {
                $scope.i = $scope.answers[$scope.index - 1][part];
                $scope.prog = $scope.i * 10;
                $scope.barTrack[part] = $scope.prog;
            }
        }
        touch = $interval(function () {

            if ($scope.i >= 10) {
                $scope.i = 10;
                $scope.prog = $scope.i * 10;
                $interval.cancel(touch);
                return;
            } else {
                $scope.i++;
                $scope.answers[$scope.index - 1][part] = $scope.i;
                $scope.prog = $scope.i * 10;
                $scope.barTrack[part] = $scope.prog;

            }
        }, 500);
    }

    $scope.stopCounter = function () {
        $interval.cancel(touch);
        touch = undefined;
    }

    $scope.reset = function (index) {
        key = Object.keys($scope.barTrack)[index];

        $scope.prog = 0;
        $scope.i = 0;
        delete $scope.answers[$scope.index - 1][key]
        delete $scope.barTrack[key];
        if (Object.keys($scope.answers[$scope.index - 1]).length == 0) {
            $scope.answers[$scope.index - 1] = undefined;
        }
    }

    $scope.getKey = function (index) {
        return Object.keys($scope.barTrack)[index];
    }

    // Checkbox Controller
    /////////////////////////
    /////////////////////////


    $scope.chosen = function (option, index) {

        // Get the option text
        var optionText;
        if (option === "QUESTIONNAIRE_NONE_OF_THE_ABOVE") {
            optionText = $filter('translate')(option);
        }
        else if (typeof option.ChoiceDescription_EN !== "undefined" || typeof option.ChoiceDescription_FR !== "undefined") {
            optionText = ($scope.language === 'EN') ? option.ChoiceDescription_EN : option.ChoiceDescription_FR;
        }
        else {
            optionText = "MISSING_VALUE";
        }

        if (($scope.noneChecked == true) && ($scope.checked[$scope.checked.length - 1] == true)) {
            $scope.checked[$scope.checked.length - 1] = false;
            $scope.choices[$scope.checked.length - 1] = undefined;
        }
        if (option === "QUESTIONNAIRE_NONE_OF_THE_ABOVE") {
            for ($i = 0; $i < $scope.checked.length - 1; $i++) {
                $scope.checked[$i] = false;
                $scope.choices[$i] = undefined;
            }
            $scope.noneChecked = true;
        } else {
            $scope.noneChecked = false;
        }
        if ($scope.checked[$scope.checked.length - 1] == false) {
            $scope.noneChecked = false;
        }
        if ($scope.answers[$scope.index - 1] == undefined) {
            $scope.numAnswered = $scope.numAnswered + 1;
        }


        var i = $scope.choices.indexOf(optionText);
        if (i < 0) {
            $scope.choices[index] = optionText;
        } else {
            $scope.choices[index] = undefined;
        }
        $scope.answers[$scope.index - 1] = {};

        for (val in $scope.choices) {
            if ($scope.choices[val] != undefined) {
                $scope.answers[$scope.index - 1][val] = $scope.choices[val];
            }
        }
        Questionnaires.setQuestionnaireAnswers($scope.answers[$scope.index - 1], $scope.questions[$scope.index - 1].QuestionnaireQuestionSerNum, $scope.questionnaireDBSerNum, $scope.questionnaireSerNum);


        for ($i = 0; $i < $scope.choices.length; $i++) {
            if ($scope.answers[$scope.index - 1][$i] != undefined) {
                return;
            }
        }
        $scope.answers[$scope.index - 1] = undefined;
        Questionnaires.setQuestionnaireAnswers(undefined, $scope.questions[$scope.index - 1].QuestionnaireQuestionSerNum, $scope.questionnaireDBSerNum, $scope.questionnaireSerNum);
        $scope.numAnswered = $scope.numAnswered - 1;
    }

    // Summmary Controller
    /////////////////////////
    /////////////////////////

    if ($scope.hasOwnProperty('questions')) $scope.answerToShow = new Array($scope.questions.length);

    $scope.chooseAction = function (index, oneQuestion) {
        if ($scope.answers[index] != undefined) {
            if ((oneQuestion.QuestionType == 'SA') || (oneQuestion.QuestionType == 'Checkbox') || (oneQuestion.QuestionType == 'image') || (oneQuestion.QuestionType == 'MC')) {
                $scope.showAnswer(index);
            } else {
                $scope.goToPage(index);
            }
        } else {
            $scope.goToPage(index);
        }
    };

    // Called when the user decides to edit or answer a question chosen from the summary page
    $scope.goToPage = function (index) {
        $scope.carousel.setActiveCarouselItemIndex(index + 1);
    }

    // Chooses whether the user is able to submit answers or not. If not all of the answers are answered then they cannot,
    // EXCEPT if the answer is a free TEXT, then it is NOT mandatory. It could be empty. So it is ok not to answer this kind of question type 'SA'
    $scope.checkSubmit = function () {
        for ($i = 0; $i < $scope.questions.length; $i++) {
            // if answer is in free TEXT format, it is NOT mandatory. It could be empty.
            if ($scope.questions[$i].QuestionType !== 'SA') {
                if (!$scope.hasOwnProperty('answers') || typeof $scope.answers[$i] == 'undefined') {
                    return true;
                }
            }
        }
        return false;
    }

    // Called when the submit button is clicked. Now shows the alert dialog.
    $scope.subPros = function () {
        $scope.submitted = true;
    }

    // Called when the user clicks the 'cancel' button in the alert dialog. This closes the alert dialog.
    $scope.cancel = function () {
        $scope.submitted = false;
    }

    // For not just goes back to the homepage when the answers are submitted
    $scope.submitAns = function () {
        // $scope.carousel.setSwipeable(false);
        $scope.subAnswers = true;

        $timeout(function () {
            $scope.carousel.setActiveCarouselItemIndex($scope.questions.length + 2);
            Questionnaires.submitQuestionnaire($scope.questionnaireDBSerNum, $scope.questionnaireSerNum);
            $scope.carousel.refresh();
        }, 100);
    }

    // Decides what answer to show. This is purely only for the 'eye' icon where the answer can be previewed.
    $scope.showAnswer = function (index) {
        $scope.answerShown[index] = !$scope.answerShown[index];
        $scope.animateShowAnswer = ($scope.answerShown[index]) ? 'animated fadeInDown' : 'animated fadeOutUp';
        if ($scope.questions[index].QuestionType == 'Checkbox') {


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
        } else if (($scope.questions[index].QuestionType == 'image') && ($scope.answers[index] != undefined)) {
            $scope.checkboxString = '';
            for (x in $scope.answers[index]) {
                if ($scope.checkboxString == '') {
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

    $scope.showAnswerReview = function (index) {
        $scope.showAnswer(index);
        return $scope.answerToShow[index];
    }


    // Last Controller
    /////////////////////////
    /////////////////////////


    $scope.goToBeggining = function () {
        $window.location.href = 'views/personal/personal.html';
    }

    /**
     * styleIfSelected
     * @author Stacey Beard
     * @date 2019-03-21
     * @desc Returns the style to apply to a button based on whether it's selected or not.
     *       This is what makes selected buttons a different colour than unselected ones.
     * @param isSelected Condition that should evaluate to true if the button is selected or to false if it isn't.
     * @returns {*} The style to apply to the button.
     */
    $scope.styleIfSelected = function(isSelected) {
        if (isSelected) {
            return {"background-color":"#d6f2ff"} // Light blue
        }
        else {
            return {}
        }
    }
});
