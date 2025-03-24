(function() {
    'use strict';

    /**
     * @name QuestionnaireMainController
     * @desc This is the controller for src/views/personal/questionnaires/questionnaires.html
     *       It is responsible for the carousel of in progress and new questionnaires
     *       For more information of the use cases, see the activate() function
     */

    angular
        .module('MUHCApp')
        .controller('QuestionnaireMainController', QuestionnaireMainController);

    QuestionnaireMainController.$inject = [
        '$filter',
        '$scope',
        '$timeout',
        'NativeNotification',
        'Navigator',
        'Params',
        'Questionnaires',
        'Notifications'
    ];

    /* @ngInject */
    function QuestionnaireMainController($filter, $scope, $timeout, NativeNotification, Navigator, Params, Questionnaires, Notifications) {
        let vm = this;

        // constants
        vm.allowedStatus = Params.QUESTIONNAIRE_DB_STATUS_CONVENTIONS;
        vm.allowedType = Params.QUESTIONNAIRE_DB_TYPE_CONVENTIONS;
        const answerSavedInDBValidStatus = Params.ANSWER_SAVED_IN_DB_STATUS;

        // variables global to this controller
        let purpose = 'default';
        let hasGoneBackToHomeScreen = false;    // this variable is used for noting whether the user has gone back to the home screen or not because if they did, we have to update the startIndex.
        let navigator = null;

        // variables that can be seen from view, sorted alphabetically
        vm.beginInstructions = '';
        vm.carouselItems = [];  // the items that the carousel will display
            /*
                If a question is a checkbox question AND it is skipped then vm.checkedNumber = 0. If a question is not a checkbox question vm.checkedNumber is also 0.
                If a question is a checkbox question but has answers in its array, then the checkedNumber is changed to the number of answers for that question.
                Note that skipped functionality is non-extant as of 07 January 2020
             */
        vm.checkedNumber = 0;   // this is the number of items check for a checkbox question.
        vm.editQuestion = false;    // true if the user completed the questionnaire but came back to edit their answer, false otherwise. Used in the toolbar.
        vm.isConsent = false;
        vm.isQuestion = false;  // this boolean represent whether the current item in the carousel is a question or not. It is not really needed as of 07 January 2020 but coded for future use, for example for information button.
        vm.hasDescription = false;  // the questionnaire has a description
        vm.hasInstruction = false;      // the questionnaire has an instruction to display
        vm.hasLogo = false;     // the questionnaire has a logo to display
        vm.loadingSaveAnswer = false;      // loading for saving answer
        vm.loadingQuestionnaire = true;     // loading for questionnaire
        vm.progressBarPercent = 0;  // this is for the progress bar in the carousel
        vm.questionnaire = {}; // the questionnaire that this controller is dealing with
        vm.questionnaireStart = true;   // marks whether we just started a questionnaire or not (i.e. the questionnaire home page)
        vm.resumeInstructions = '';
        vm.startIndex = 1;  // the index where the carousel will start in, skip the questionnaire start home page
        vm.sectionIndex = 0;
        vm.questionIndex = 0;

        // functions that can be seen from view, sorted alphabetically
        vm.beginQuestionnaire = beginQuestionnaire;
        vm.finishQuestionnaireFromQuestion = finishQuestionnaireFromQuestion;
        vm.initTextboxQuestion = initTextboxQuestion;   // initialization functions for the different question types
        vm.initRadioButtonQuestion = initRadioButtonQuestion;
        vm.initSliderQuestion = initSliderQuestion;
        vm.initCheckboxQuestion = initCheckboxQuestion;
        vm.isCheckboxDisabled = isCheckboxDisabled;
        vm.isCheckedCheckmark = isCheckedCheckmark;
        vm.next = next;
        vm.prev = prev;
        vm.resumeQuestionnaire = resumeQuestionnaire;
        vm.toggleCheckboxSelection = toggleCheckboxSelection;

        activate();

        // //////////////

        function activate() {
            navigator = Navigator.getNavigator();

            let params = Navigator.getParameters();

            if (!params?.questionnairePurpose
                || !Questionnaires.validateQuestionnairePurpose(params?.questionnairePurpose)
            ) {
                setPageText();
                vm.loading = false;
                handleLoadQuestionnaireErr();
            } else {
                purpose = params.questionnairePurpose.toLowerCase();
                vm.isConsent = purpose === 'consent';
                setPageText(purpose);
            }

            /*
             now there are 3 cases:
                1) the questionnaire is new and we are waiting for the user to begin it.
                    The user has to click on the begin button or swipe which will activate the beginQuestionnaire function.
                    In this case, the questionnaire starts at the beginning.
                    The indices should be:
                        startIndex = 1 for the item after questionnaire home page
                        sectionIndex = 0
                        questionIndex = 0
                2) the questionnaire is in progress but not being send by the summary page.
                    The user can click on the resume button or swipe to resume the questionnaire, which will activate the resumeQuestionnaire function.
                    In this case, the questionnaire restarts at wherever the user left, which requires us to find out where that is.
                    The function to find this out is in the questionnairesService, which will return the 3 indices
                    In the case where the questionnaire is actually found to be completed (i.e. all answers are filled) we should send the user to the summary page
                        this is handled by both the activate and the resumeQuestionnaire function, just in case
                3) the questionnaire is in progress and send by the summary page to being edited.
                    The user will go directly to a selected question.
                    This option is indicated by the boolean variable editQuestion, which should be sent by the summary page in the navigator's parameter if this is the case.
                    The indices of the selected question should also be sent by the summary page, otherwise it defaults to start the questionnaire from beginning.
                        Note that we still need to find out the startIndex since it is the index of the carousel. This is done by the function in questionnairesService
                    This case is handled by the resumeQuestionnaire function, and have to be activated in the activate() since the user is not prompted for action.
             */

            if (!params.hasOwnProperty('answerQuestionnaireId')){
                vm.loadingQuestionnaire = false;
                handleLoadQuestionnaireErr();
            }

            // listen to the carousel changes
            addListener();

            Questionnaires.requestQuestionnaire(params.answerQuestionnaireId)
                .then(function(){
                    $timeout(function(){
                        // get the questionnaire and get the carousel for displaying the questions and sections
                        vm.carouselItems = Questionnaires.getCarouselItems();
                        vm.questionnaire = Questionnaires.getCurrentQuestionnaire();

                        // check if it is coming back from the summary page to edit question, if the boolean is not given, assume false.
                        if (params.hasOwnProperty('editQuestion')) {
                            vm.editQuestion = params.editQuestion;
                        }

                        // Set the indices with the parameters passed from navigator
                        initializeIndex(params);

                        // get the fields that can be displayed
                        setDisplayableFields();

                        // dealing with the sent by summary page case
                        if (vm.editQuestion){
                            resumeQuestionnaire(vm.startIndex);
                        }

                        // listen to the event of destroy the controller in order to do clean up
                        $scope.$on('$destroy', function() {
                            removeListener();
                            // Reload user profile if questionnaire was opened via Notifications tab,
                            // and profile was implicitly changed.
                            Navigator.reloadPreviousProfilePrepopHandler('notifications.html');
                        });

                        // no longer loading
                        delayLoading();
                    })
                })
                .catch(function(error){
                    $timeout(function(){
                        vm.loadingQuestionnaire = false;
                        handleLoadQuestionnaireErr(error);
                    });
                });
        }

        /**
         * @name next
         * @desc This public function serves to move the carousel on to the next item
         */
        function next(){
            vm.carousel.next();
        }

        /**
         * @name prev
         * @desc this public function serves to move the carousel to the previous item
         */
        function prev(){
            vm.carousel.prev();
        }

        /**
         * @name beginQuestionnaire
         * @param {boolean} bySwipe if it is activated by swiping to the right then True
         * @desc This function is used to update the questionnaire status when beginning a questionnaire and, in case that the user uses the button "begin" instead of swiping, move the carousel
         */
        async function beginQuestionnaire(bySwipe){
            let inProgress = vm.allowedStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS;
            let oldStatus = vm.questionnaire.status;

            // if the questionnaire was not started yet, start it
            if (vm.questionnaireStart) {
                vm.loadingQuestionnaire = true;

                try {
                    // update status for the questionnaire of service and listener / database
                    // send the request before setting the status locally, because the request can fail if the questionnaire was locked by another user
                    let response = await Questionnaires.updateQuestionnaireStatus(vm.questionnaire.qp_ser_num, inProgress, oldStatus);

                    Notifications.implicitlyMarkCachedNotificationAsRead(
                        response?.QuestionnaireSerNum,
                        Params.NOTIFICATION_TYPES.LegacyQuestionnaire
                    );

                    $timeout(() => {
                        vm.questionnaire.status = inProgress;

                        // we are no longer at the home page
                        vm.questionnaireStart = false;

                        // set the indices (mere formality)
                        vm.startIndex = 1;  // skip questionnaire home page
                        vm.sectionIndex = 0;
                        vm.questionIndex = 0;

                        vm.loadingQuestionnaire = false;

                        // this is to force update the carousel even by swiping it
                        bySwipe ? vm.carousel.setActiveCarouselItemIndex(vm.startIndex) : next();

                        vm.carousel.refresh();
                    });
                }
                catch(error) {
                    $timeout(() => {
                        console.error(error);
                        vm.loadingQuestionnaire = false;
                        handleLoadQuestionnaireErr(error);
                    });
                }
            }
        }

        /**
         * @name resumeQuestionnaire
         * @desc this public function serves to resume the questionnaire.
         * @param {int} startIndex
         */
        function resumeQuestionnaire(startIndex) {

            // only process if the questionnaire was not started
            if (vm.questionnaireStart){

                // we need to re-determine the placement of the carousel if the user has changed something
                if (hasGoneBackToHomeScreen){
                    setInProgressIndex();
                    startIndex = vm.startIndex;
                }

                // we are out of home page
                vm.questionnaireStart = false;

                // resume
                if (startIndex > -1) {

                    $timeout(function(){
                        vm.carousel.setActiveCarouselItemIndex(startIndex);
                        vm.carousel.refresh();
                        hasGoneBackToHomeScreen = false;
                    });

                } else {
                    // questionnaire is completed
                    summaryPage();
                }
            }
        }

        /**
         * @name finishQuestionnaireFromQuestion
         * @desc this public function deals with the situation where we complete a question and goes to the summary page.
         *      It verifies that the question has been saved before going to the summary page.
         *      A small drawback is that it only concerns about whether the last question sent is saved, and not about all questions sent saved or not
         */
        function finishQuestionnaireFromQuestion(){
            loadingSaveAnswerModal.show();

            let question = vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex];

            // if question answer unchanged then ignore it
            if (!question.hasOwnProperty("answerChangedFlag") || typeof question.answerChangedFlag === 'undefined' || !question.answerChangedFlag){
                // remove any listener for the current controller, for example the listener to the carousel
                removeListener();

                loadingSaveAnswerModal.hide();

                // go to summary page
                summaryPage();
            } else {
                resetAnswerIsDefinedFlag(question);

                // verify if the checkbox questions are answered correctly
                if (!verifyCheckboxNumberOfAnswer(question)){
                    answerInvalid(question);
                }

                // verify if the required textbox questions are answered correctly
                if (!verifyRequiredTextboxAnswer(question)){
                    answerInvalid(question);
                }

                // save answer
                saveAnswer(question)
                    .then(function(){
                        // remove any listener for the current controller, for example the listener to the carousel
                        removeListener();

                        $timeout(function(){
                            loadingSaveAnswerModal.hide();

                            // go to summary page
                            summaryPage();
                        });

                    }).catch(error => {
                        $timeout(() => {
                            console.error(error);
                            loadingSaveAnswerModal.hide();
                            handleSaveAnswerErr(error);
                        });
                });
            }
        }

        /**
         * @name initTextboxQuestion
         * @desc function for initialization of text box question
         * @param {object} question
         */
        function initTextboxQuestion(question){
            question.answerChangedFlag = false;

            // this set the maximum input length of the textbox questions
            document.getElementById('textType').setAttribute('maxlength', question.options[0].char_limit);   // this char_limit is determined by listener as of the moment (January 2020)
        }

        /**
         * @name initRadioButtonQuestion
         * @desc function for initialization of radio button question
         * @param {object} question
         */
        function initRadioButtonQuestion(question){
            question.answerChangedFlag = false;
        }

        /**
         * @name initCheckboxQuestion
         * @desc function for initialization of checkbox question
         * @param {object} question
         */
        function initCheckboxQuestion(question) {

            question.answerChangedFlag = false;

            updateCheckedNumber(question);
        }

        /**
         * @name initSliderQuestion
         * @desc the initialization function for the slider type question. Currently (May 2020), the only the vertical scale questions
         * @param {object} question
         * @returns {Array} contain the options for the dots scale questions
         */
        function initSliderQuestion(question) {
            question.answerChangedFlag = false;

            // set the style of the options
            let min = Number(question.options[0].min_value);
            let max = Number(question.options[0].max_value);
            let inc = Number(question.options[0].increment);

            let options = [];

            options.push({text: `${min} ${question.options[0].min_caption}`, value: min});
            for(let i = min+inc; i < max; i+=inc) {
                options.push({text: `${i}`, value: i});
            }
            options.push({text: `${max} ${question.options[0]. max_caption}`, value: max});

            return options;
        }

        /**
         * @name isCheckedCheckmark
         * @desc this public function serves to determine whether an option is selected for a checkbox question. It influences the style and the checkmark displayed in the html
         * @param {object} question the question itself
         * @param {int} optionKey the id of the option
         * @returns {boolean} true if it is checked
         */
        function isCheckedCheckmark(question, optionKey) {
            return (question.patient_answer.answer.map(function(e) { return e.answer_value; }).indexOf(optionKey) > -1);
        }

        /**
         * @name isCheckboxDisabled
         * @desc this public function is used to determine whether the number of checked options is over the set limit. If it is, disable the options in the html file such that the user is no longer able to touch it.
         * @param {object} question the question itself
         * @param {int} optionKey the id of the option
         * @returns {boolean} true if the option cannot be checked
         */
        function isCheckboxDisabled(question, optionKey) {
            let answerIndex = question.patient_answer.answer.map(function(e) {return e.answer_value;}).indexOf(optionKey);

            return !(answerIndex>-1) && (vm.checkedNumber >= question.options[0].maxAnswer);
        }

        /**
         * @name toggleCheckboxSelection
         * @desc this public function is used to check or uncheck the checkbox question's option. TODO: can this be done better using ng-model?
         * @param {object} question the question itself
         * @param {int} optionKey the id of the option
         * @param {string} optionText the text of the option itself, not sent to the backed, but saved for display purpose
         */
        function toggleCheckboxSelection(question, optionKey, optionText) {
            question.answerChangedFlag = true;

            let answerIndex = question.patient_answer.answer.map(function(e) {return e.answer_value;}).indexOf(optionKey);

            // is currently selected, remove it
            if (answerIndex > -1) {
                question.patient_answer.answer.splice(answerIndex, 1);
                vm.checkedNumber = question.patient_answer.answer.length;
            } else { // is newly selected
                question.patient_answer.answer.push({'answer_value': optionKey, 'answer_option_text': optionText});

                // update the number of options checked
                vm.checkedNumber = question.patient_answer.answer.length;
            }
        }

        /*
            Private function
         */

        /**
         * @name summaryPage
         * @desc This function leads to the summary page
         */
        function summaryPage(){
            // go to summary page directly
            navigator.replacePage('views/personal/questionnaires/answeredQuestionnaire.html', {
                answerQuestionnaireId: vm.questionnaire.qp_ser_num,
            });
        }

        /**
         * @name setPageText
         * @desc set the page title and descriptions according to the questionnaire purpose requested on the list page
         *      if the purpose is not passed as an argument, the text will default to the default's translation
         * @param {string} questionnairePurpose
         */
        function setPageText(questionnairePurpose = 'default') {
            vm.beginInstructions = $filter('translate')(
                Questionnaires.getQuestionnaireBeginByPurpose(questionnairePurpose)
            );
            vm.resumeInstructions = $filter('translate')(
                Questionnaires.getQuestionnaireResumeByPurpose(questionnairePurpose)
            );
        }

        /**
         * @name initializeIndex
         * @desc This private function set the startIndex, sectionIndex and the questionIndex for the first time
         * @param {object} params the parameter passed from the navigator
         */
        function initializeIndex(params){
            // get the indices for the questionnaire and the carousel
            // if the indices are not given, then assume its starting anew
            if (params.hasOwnProperty('startIndex') && params.hasOwnProperty('sectionIndex') && params.hasOwnProperty('questionIndex')){
                // if all three are given, use those and do not search for any other startIndex
                vm.startIndex = params.startIndex;
                vm.sectionIndex = params.sectionIndex;
                vm.questionIndex = params.questionIndex;
            }else{
                if (params.hasOwnProperty('startIndex')){
                    vm.startIndex = params.startIndex;
                }

                if (params.hasOwnProperty('sectionIndex') && params.hasOwnProperty('questionIndex')) {
                    vm.sectionIndex = params.sectionIndex;
                    vm.questionIndex = params.questionIndex;
                }

                // if in progress questionnaire, find where the questionnaire was being left at
                if (vm.questionnaire.status === vm.allowedStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS){
                    setInProgressIndex();
                }
            }
        }

        /**
         * @name setDisplayableFields
         * @desc this private function does a basic check for if the logo, description, and instruction fields for the questionnaire is displayable to user
         */
        function setDisplayableFields(){
            vm.hasLogo = vm.questionnaire.logo !== undefined && vm.questionnaire.logo !== '' && vm.questionnaire.logo !== null;
            vm.hasInstruction = vm.questionnaire.instruction !== '' && vm.questionnaire.instruction !== null && vm.questionnaire.instruction !== undefined;
            vm.hasDescription = vm.questionnaire.description !== '' && vm.questionnaire.description !== null && vm.questionnaire.description !== undefined;
        }

        /**
         * @name carouselOverScroll
         * @desc this function is called once an overscroll in the carousel is detected. It only acts when the carousel is at its last element and moves it to the summary page
         * @param event
         */
        function carouselOverScroll (event){

            let itemType = '';

            if (event.activeIndex > 0 && vm.carouselItems[event.activeIndex - 1] !== undefined && vm.carouselItems[event.activeIndex - 1].hasOwnProperty('type')){
                itemType = vm.carouselItems[event.activeIndex - 1].type;
            }

            // coming from question, going to the summary page
            if (event.activeIndex === vm.carouselItems.length && itemType === 'question'){
                finishQuestionnaireFromQuestion();
            }else if (event.activeIndex === vm.carouselItems.length && itemType === 'section') {
                // coming from section, going to the summary
                summaryPage();
            }
        }

        /**
         * @name carouselPostChange
         * @desc This function is called once a movement in the carousel is detected.
         * @param event
         */
        function carouselPostChange(event){

            let activeIndex = event.activeIndex;
            let lastActiveIndex = event.lastActiveIndex;

            let lastItem = {};
            let activeItem = {};
            let lastItemType = '';
            let activeItemType = '';

            // lastActiveIndex === 0 means home page and < 0 will be error
            // these checks are needed since the home page does not have the property type
            // the check statement inside the following 2 if-s must be written in this order because we take advantage of lazy check
            if (lastActiveIndex > 0 && vm.carouselItems[lastActiveIndex - 1].hasOwnProperty('type')){
                lastItem = vm.carouselItems[lastActiveIndex - 1];
                lastItemType = lastItem.type;
            }

            if (activeIndex > 0 && vm.carouselItems[activeIndex - 1].hasOwnProperty('type')){
                activeItem = vm.carouselItems[activeIndex - 1];
                activeItemType = activeItem.type;
            }

            // if right swipe
            if (activeIndex - lastActiveIndex > 0){

                $timeout(rightSwipe(activeIndex, lastActiveIndex, activeItem, activeItemType, lastItem, lastItemType));
            }
            // if left swipe
            else if (activeIndex - lastActiveIndex < 0){

                $timeout(leftSwipe(activeIndex, lastActiveIndex, activeItem, activeItemType, lastItem, lastItemType));
            }
        }

        /**
         * @name leftSwipe
         * @desc this private function deals with whatever we have to do when the carousel detects a left swipe.
         *      It relays most of the tasks to other private functions, but mostly updates the indices questionIndex and sectionIndex itself.
         * @param {int} activeIndex the current active index of the carousel
         * @param {int} lastActiveIndex the last active index of the carousel
         * @param {object} activeItem the current item shown on the carousel
         * @param {string} activeItemType the type of the current item
         * @param {object} lastItem the previous item shown on the carousel
         * @param {string} lastItemType the type of the previous item
         */
        function leftSwipe(activeIndex, lastActiveIndex, activeItem, activeItemType, lastItem, lastItemType){
            /*
                A left swipe has the following 5 possibilities:
                    1) coming from a question, going to a question
                    2) coming from a question, going to a section
                    3) coming from a section, going to a question
                    4) coming from a section, going to the questionnaire home page
                    5) coming from a question, going to the questionnaire home page
                Note that it is not possible to swipe back from a summary page
            */

            // note that cases 2, 3 and 4 are not displayed for the view in the current version,
            // until multi-section questionnaire is available in OpalAdmin

            // coming from question, going to question
            if (lastActiveIndex > 0 && lastItemType === 'question' && activeItemType === 'question') {
                comingFromQuestion();

                // we dealt with the previous question, going to the next, this is to deal with the case where the user scrolls more than 1 item at once (which does not happen in the app)
                vm.questionIndex = parseInt(activeItem.data.question_position) - 1;

                goingToQuestion();
            }
            // coming from section header, going to question
            else if (lastActiveIndex > 0 && lastItemType === 'section' && activeItemType === 'question') {
                // since we are going back to the previous section, we have to modify the sectionIndex accordingly
                if (vm.sectionIndex > 0) {
                    // TODO: this might not be correct when we have more than 1 section due to user overscrolling multiple items (which does not happen in the app).
                    // In that case, we can set a while loop and check for whether the number of items skipped is >= total number of questions in that section, i.e. vm.questionnaire.sections[vm.sectionIndex].questions.length
                    vm.sectionIndex--;
                }

                // since we are going back to the previous section, the new questionIndex would be the last question's index of the previous section
                vm.questionIndex = parseInt(activeItem.data.question_position) - 1;

                goingToQuestion();
            }
            // coming from question to section header
            else if (lastActiveIndex > 0 && lastItemType === 'question' && activeItemType === 'section') {
                comingFromQuestion();

                goingToSection();
            }
            // coming from a section or a question, going to the questionnaire home page
            else if (lastActiveIndex > 0 && activeIndex === 0){
                goingToHome();
            }
        }

        /**
         * @name rightSwipe
         * @desc this private function deals with whatever we have to do when the carousel detects a right swipe.
         *      It relays most of the tasks to other private functions, but updates the indices questionIndex and sectionIndex itself.
         * @param {int} activeIndex the current active index of the carousel
         * @param {int} lastActiveIndex the last active index of the carousel
         * @param {object} activeItem the current item shown on the carousel
         * @param {string} activeItemType the type of the current item
         * @param {object} lastItem the previous item shown on the carousel
         * @param {string} lastItemType the type of the previous item
         */
        function rightSwipe(activeIndex, lastActiveIndex, activeItem, activeItemType, lastItem, lastItemType){
            /*
            A right swipe has the following 7 possibilities:
                1) coming from a question, going to a question
                2) coming from a question, going to a section
                3) coming from a section, going to a question
                4) coming from the questionnaire home page, going to a section
                5) coming from the questionnaire home page, going to a question
                6) coming from a question, going to the summary page
                7) coming from a section, going to the summary page
             */

            // note that cases 2, 3, and 4 are not displayed for the view in the current version,
            // until multi-section questionnaire is available in OpalAdmin

            // note: index access to vm.carouselItems is lastActiveIndex/activeIndex - 1 because the carouselItems does not include the questionnaire home page

            // coming from question, going to question
            if (lastActiveIndex > 0 && lastItemType === 'question' && activeItemType === 'question'){

                // first do whatever we have to for the coming from a question part
                comingFromQuestion();

                // update the questionIndex for the new question, this is set to prevent user scrolling more than 1 item at once (which does not happen in the app)
                vm.questionIndex = parseInt(activeItem.data.question_position) - 1;

                // now do whatever we have to do to go to a new question
                goingToQuestion();
            }
            // coming from question, going to section header
            else if (lastActiveIndex > 0 && lastItemType === 'question' && activeItemType === 'section'){
                // first do whatever we have to for the coming from a question part
                comingFromQuestion();

                // now do whatever we have to do to go to a new section

                // update sectionIndex
                if (vm.sectionIndex < vm.questionnaire.sections.length - 1) {
                    vm.sectionIndex = parseInt(activeItem.position) - 1;
                }

                goingToSection();

            }
            // coming from section header, going to question
            else if (lastActiveIndex > 0 && lastItemType === 'section' && activeItemType === 'question') {
                // nothing to do for coming from a section since we are already in this new section, so do whatever we have to do to go to a new question
                // do not move questionIndex since we are not moving from an old question to a new one
                goingToQuestion();
            }
            // coming from the questionnaire home page, going to a section
            else if (lastActiveIndex === 0 && activeItemType === 'section'){
                comingFromHome();

                vm.sectionIndex = parseInt(activeItem.position) - 1;

                goingToSection();
            }
            // coming from the questionnaire home page, going to a question
            else if (lastActiveIndex === 0 && activeItemType === 'question'){
                comingFromHome();

                goingToQuestion();
            }
            // coming from question, going to the summary page
            else if (lastActiveIndex > 0 && lastItemType === 'question' && activeIndex === vm.carouselItems.length){
                finishQuestionnaireFromQuestion();
            }
            // coming from section, going to the summary
            else if (lastActiveIndex > 0 && lastItemType === 'section' && activeIndex === vm.carouselItems.length){
                summaryPage();
            }
        }

        /**
         * @name goingToQuestion
         * @desc this private function is used to updates the variables when the carousel being moved to a new question.
         */
        function goingToQuestion(){
            // we know now that the next item is a question
            vm.isQuestion = true;

            // update the checkbox checkedNumber
            updateCheckedNumber(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex]);
        }

        /**
         * @name comingFromQuestion
         * @desc this private function deals with the old item (which has to be a question) when the carousel is swiped to a new item
         */
        function comingFromQuestion(){

            let question = vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex];

            // if question answer unchanged then ignore it
            if (!question.hasOwnProperty("answerChangedFlag") || typeof question.answerChangedFlag === 'undefined' || !question.answerChangedFlag){
                return;
            }

            loadingSaveAnswerModal.show();

            resetAnswerIsDefinedFlag(question);

            // verify if the checkbox questions are answered correctly
            if (!verifyCheckboxNumberOfAnswer(question)){
                answerInvalid(question);
            }

            // verify if the required textbox questions are answered correctly
            if (!verifyRequiredTextboxAnswer(question)){
                answerInvalid(question);
            }

            // save answer
            saveAnswer(vm.questionnaire.sections[vm.sectionIndex].questions[vm.questionIndex])
                .then(function(){
                    $timeout(function(){
                        loadingSaveAnswerModal.hide();
                    });
                })
                .catch(error => {
                    $timeout(() => {
                        console.error(error);
                        loadingSaveAnswerModal.hide();
                        handleSaveAnswerErr(error);
                    });
                })
        }

        /**
         * @name goingToSection
         * @desc this private function deals with the next item of carousel being a section
         */
        function goingToSection(){

            // we know now that the next item is a section
            vm.isQuestion = false;

            // restart the questionIndex
            vm.questionIndex = 0;
        }

        /**
         * @name comingFromHome
         * @desc this private function deals with the carousel swiping from a questionnaire home page
         */
        function comingFromHome(){
            // if the questionnaire was not started yet, start it, otherwise do nothing
            // this is to prevent the case that the resume or begin button triggers a carouselPostChange event which will be processed again by the event handler
            if (vm.questionnaireStart){
                if (vm.questionnaire.status === vm.allowedStatus.NEW_QUESTIONNAIRE_STATUS){
                    beginQuestionnaire(true);

                }else if (vm.questionnaire.status === vm.allowedStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS){
                    resumeQuestionnaire(vm.startIndex);
                }
            }
        }

        /**
         * @name goingToHome
         * @desc this private function deals with the carousel being swiped back to the questionnaire home page. It resets all indices
         */
        function goingToHome(){

            hasGoneBackToHomeScreen = true;
            vm.questionIndex = 0;
            vm.sectionIndex = 0;
            vm.questionnaireStart = true;
            vm.isQuestion = false;
        }

        /**
         * @name verifyCheckboxNumberOfAnswer
         * @desc this function performs a check for a user that have completed a checkbox type of question but did not fulfill the number of answers requirements
         * @param {object} question
         * @returns {boolean} true if the number of answers given matches the requirements, false otherwise
         */
        function verifyCheckboxNumberOfAnswer(question){
            // only deal with checkbox type of question
            if (question.type_id === vm.allowedType.CHECKBOX_TYPE_ID){
                // verify if the checkbox questions are answered correctly
                if ((vm.checkedNumber > parseInt(question.options[0].maxAnswer) || vm.checkedNumber < parseInt(question.options[0].minAnswer))) {
                    return false;
                }
            }

            return true;
        }

        /**
         * @name verifyRequiredTextboxAnswer
         * @desc this function performs a check for a user that have completed a textbox type of question having a required field
         * @param {object} question
         * @returns {boolean} true if the required textbox is answered, false otherwise
         */
        function verifyRequiredTextboxAnswer(question){
            // only deal with textbox type of question
            if(question.type_id === vm.allowedType.TEXTBOX_TYPE_ID){
                // verify if the required textbox questions are answered correctly
                if(question.optional === '0' && question.patient_answer.answer[0].answer_value === ""){
                    return false;
                }
            }

            return true;
        }

        /**
         * @name answerInvalid
         * @desc this function is used when the answer given by the user does not respect the required constraints
         * @param {object} question
         */
        function answerInvalid(question){
            question.patient_answer.is_defined = answerSavedInDBValidStatus.ANSWER_INVALID;
        }

        /**
         * @name resetAnswerIsDefinedFlag
         * @desc reset the answer is defined flag when the answer is changed
         * @param question
         */
        function resetAnswerIsDefinedFlag(question) {
            question.patient_answer.is_defined = answerSavedInDBValidStatus.ANSWER_CHANGED;
        }

        /**
         * @name updateCheckedNumber
         * @desc This function adapts the variable vm.checkedNumber from one question to another
         *      If a question is a checkbox question AND it is skipped then vm.checkedNumber = 0. If a question is not a checkbox question vm.checkedNumber is also 0.
         *      If a question is a checkbox question but has answers in its array, then the checkedNumber is changed to the number of answers for that question.
         *      Note that skipped functionality is non-extant as of January 2020
         * @param {object} question
         */
        function updateCheckedNumber(question) {
            if (question.type_id === vm.allowedType.CHECKBOX_TYPE_ID && question.patient_answer.is_defined === '1') {
                vm.checkedNumber = question.patient_answer.answer.length;
            } else {
                vm.checkedNumber = 0;
            }
        }

        /**
         * @name saveAnswer
         * @desc this function serves to save the answer of a question if the question is changed
         * @param {object} question
         * @returns {Promise}
         */
        function saveAnswer(question){
            // the argument for is_skipped is always 0 as of now (January 2019) because the skipped functionality is not available yet
            return Questionnaires.saveQuestionnaireAnswer(vm.questionnaire.qp_ser_num, vm.questionnaire.sections[vm.sectionIndex].section_id, question, 0);
        }

        /**
         * @name handleSaveAnswerErr
         * @desc shows a notification to the user in case a request to server fails to save the answer
         *      and move the user back to the previous page
         * @param {Object} error The original error object being handled.
         */
        function handleSaveAnswerErr(error) {
            navigator.popPage();

            if (error?.Error?.Details === Params.BACKEND_ERROR_CODES.LOCKING_ERROR) {
                NativeNotification.showNotificationAlert(
                    $filter('translate')("QUESTIONNAIRE_LOCKING_ERROR"),
                    $filter('translate')("TITLE"),
                );
            }
            else if (error?.Error?.Details === Params.BACKEND_ERROR_CODES.NOT_ALLOWED_TO_ANSWER) {
                NativeNotification.showNotificationAlert(
                    $filter('translate')("QUESTIONNAIRE_NOT_ALLOWED_TO_ANSWER"),
                    $filter('translate')("TITLE"),
                );
            }
            else NativeNotification.showNotificationAlert($filter('translate')("SERVER_ERROR_SUBMIT_ANSWER"));
        }

        /**
         * @name handleLoadQuestionnaireErr
         * @desc shows a notification to the user in case a request to server fails to load the questionnaire
         *      and move the user back to the previous page
         * @param {Object} error The original error object being handled.
         */
        function handleLoadQuestionnaireErr(error) {
            // go to the questionnaire list page if there is an error
            console.log(navigator);
            navigator.popPage();
            // if there is no page after pop, redirect to questionnaire summary page.
            if (navigator.pages.length == 0){
                navigator.pushPage('views/personal/questionnaires/questionnairesList.html', {questionnairePurpose: 'consent'});
            }

            if (error?.Details === Params.BACKEND_ERROR_CODES.LOCKING_ERROR 
                || error?.Error?.Details === Params.BACKEND_ERROR_CODES.LOCKING_ERROR) {
                NativeNotification.showNotificationAlert(
                    $filter('translate')("QUESTIONNAIRE_LOCKING_ERROR"),
                    $filter('translate')("TITLE"),
                );
            }
            else if (error?.Details === Params.BACKEND_ERROR_CODES.NOT_ALLOWED_TO_ANSWER 
                || error?.Error?.Details === Params.BACKEND_ERROR_CODES.NOT_ALLOWED_TO_ANSWER) {
                NativeNotification.showNotificationAlert(
                    $filter('translate')("QUESTIONNAIRE_NOT_ALLOWED_TO_ANSWER"),
                    $filter('translate')("TITLE"),
                );
            }
            else NativeNotification.showNotificationAlert($filter('translate')("SERVERERRORALERT"));
        }

        /**
         * @name setInProgressIndex
         * @desc This private function is used to find indices for in progress questionnaires and set them for variables accessible by the view.
         */
        function setInProgressIndex(){
            let indices = Questionnaires.findInProgressQuestionIndex(vm.editQuestion, vm.sectionIndex, vm.questionIndex);
            vm.startIndex = indices.startIndex;
            vm.sectionIndex = indices.sectionIndex;
            vm.questionIndex = indices.questionIndex;
        }

        /**
         * @name delayLoading
         * @desc Continue displaying the loading page even if the loading itself has finished
         *      This function is needed because the onsen navigator does not immediately update after after pushing
         */
        function delayLoading(){
            // this timeout 500 is decided arbitrarily. We simply need a long enough time for the navigator to update
            $timeout(function(){
                vm.loadingQuestionnaire = false;
            }, 500);
        }

        /**
         * @name carouselInit
         * @desc initialize the carousel
         * @param event
         */
        function carouselInit (event){
            vm.carousel = event.component;

            // this has to be here because we need the vm.carousel to be initialized
            vm.carousel.once('overscroll', carouselOverScroll);
        }

        /**
         * @name addListener
         * @desc This private function serves to add any listener for this controller
         */
        function addListener() {
            // listener for the carousel
            document.addEventListener('ons-carousel:init', carouselInit);
            document.addEventListener('ons-carousel:postchange', carouselPostChange);
        }

        /**
         * @name removeListener
         * @desc This private function serves to remove any listener for this controller
         */
        function removeListener(){
            // remove listener for the carousel
            document.removeEventListener('ons-carousel:postchange', carouselPostChange);
            vm.carousel.off('overscroll');
            document.removeEventListener('ons-carousel:init', carouselInit);
        }
    }

})();

