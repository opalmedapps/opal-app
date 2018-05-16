/*
 * Filename     :   questionnairesService.js
 * Description  :
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   03 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */


var myApp = angular.module('MUHCApp');

myApp.service('Questionnaires', ['RequestToServer', '$filter', 'Patient', 'LocalStorage', '$q',
    function(RequestToServer, $filter, Patient, LocalStorage, $q) {
        let questionnaireAnswers = {};
        let questionnairesObject = {};
        let needsToRefresh = true;

        function findAndReplacePatientQuestionnaires(questionnaires) {
            let questionnairesObjectRef = questionnaires.Questionnaires;
            let patientQuestionnaireObject = questionnaires.PatientQuestionnaires;

            for (var serNum in questionnairesObjectRef) {
                let questionCopy = questionnairesObjectRef[serNum];
                if (questionnairesObject.hasOwnProperty(serNum) && questionCopy.QuestionnaireDBSerNum == questionnairesObject[serNum].QuestionnaireDBSerNum) {
                    questionnairesObject[serNum] = questionCopy;
                }
            }
            for (var serNum in patientQuestionnaireObject) {
                let questionAnswerCopy = questionnairesObjectRef[serNum];
                if (questionnairesObject.hasOwnProperty(serNum) && questionAnswerCopy.QuestionnaireSerNum == questionnairesObject[serNum].QuestionnaireSerNum) {
                    questionnairesObject[serNum] = questionAnswerCopy;
                }
            }
        }

        function addToQuestionnaireObject(questionnaires) {
            // Make sure questionnaires object has been properly initialized before adding
            if (!questionnairesObject.PatientQuestionnaires && !questionnairesObject.Questionnaires) {
                questionnairesObject.PatientQuestionnaires = {};
                questionnairesObject.Questionnaires = {};
            }

            for (let key in questionnaires.PatientQuestionnaires) {
                if (questionnaires.PatientQuestionnaires[key]) questionnairesObject.PatientQuestionnaires[key] = questionnaires.PatientQuestionnaires[key];
            }
            questionnairesObject.Questionnaires = questionnaires.Questionnaires;
        }

        return {
            updatePatientQuestionnaires: function(questionnaires) {
                if (questionnaires && typeof questionnaires !== 'undefined') {
                    findAndReplacePatientQuestionnaires(questionnaires);
                    addToQuestionnaireObject(questionnaires);
                }
            },
            setPatientQuestionnaires: function(questionnaires) {
                questionnairesObject = {};
                questionnairesObject.PatientQuestionnaires = {};
                questionnairesObject.Questionnaires = {};
                if (questionnaires && typeof questionnaires !== 'undefined') addToQuestionnaireObject(questionnaires);
            },
            getPatientQuestionnaires: function() {
                return questionnairesObject;
            },
            setQuestionnaireAnswers: function(Answer, questionnaireQuestionSerNum, questionnaireDBSerNum, questionnaireSerNum) {
                // if((Object.keys(questionnaireAnswers).length == 0 ) || (Object.keys(questionnaireAnswers[questionnaireSerNum]).length == 0)) {
                if ((Object.keys(questionnaireAnswers).length == 0) || (!questionnaireAnswers[questionnaireSerNum])) {
                    questionnaireAnswers[questionnaireSerNum] = {};


                    questionnaireAnswers[questionnaireSerNum].QuestionnaireDBSerNum = questionnairesObject.Questionnaires[questionnaireDBSerNum].QuestionnaireDBSerNum;
                    questionnaireAnswers[questionnaireSerNum].CompletedFlag = questionnairesObject.PatientQuestionnaires[questionnaireSerNum].CompletedFlag;
                    ;
                    questionnaireAnswers[questionnaireSerNum].Answers = {};
                    questionnaireAnswers[questionnaireSerNum].QuestionnaireSerNum = questionnaireSerNum;
                }
                questionnaireAnswers[questionnaireSerNum].Answers[questionnaireQuestionSerNum] = {
                    Answer: Answer,
                    QuestionType: questionnairesObject.Questionnaires[questionnaireDBSerNum].Questions[questionnaireQuestionSerNum].QuestionType,
                    QuestionnaireQuestionSerNum: questionnairesObject.Questionnaires[questionnaireDBSerNum].Questions[questionnaireQuestionSerNum].QuestionnaireQuestionSerNum,
                };
            },
            getQuestionnaireAnswers: function(questionnaireSerNum) {
                if (questionnaireAnswers == undefined) {
                    return undefined;
                }
                if (questionnaireAnswers[questionnaireSerNum] == undefined) {
                    return undefined;
                }
                if ((Object.keys(questionnaireAnswers).length == 0) || (Object.keys(questionnaireAnswers[questionnaireSerNum]).length == 0)) {
                    return undefined;
                } else {
                    return questionnaireAnswers[questionnaireSerNum];
                }
            },
            submitQuestionnaire: function(questionnaireDBSerNum, questionnaireSerNum) {
                questionnaireAnswers[questionnaireSerNum].PatientId = Patient.getPatientId();
                dateCompleted = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                questionnaireAnswers[questionnaireSerNum].DateCompleted = dateCompleted;
                questionnairesObject.PatientQuestionnaires[questionnaireSerNum].CompletionDate = dateCompleted;
                questionnaireAnswers[questionnaireSerNum].CompletedFlag = 1;
                questionnairesObject.PatientQuestionnaires[questionnaireSerNum].CompletedFlag = 1;


                submittableQuestionnaire = angular.copy(questionnaireAnswers[questionnaireSerNum]);
                RequestToServer.sendRequest('QuestionnaireAnswers', submittableQuestionnaire);
            },
            getNumberOfUnreadQuestionnaires: function() {
                let unread = 0;
                for (let key in questionnairesObject) {
                    if (questionnairesObject[key].CompletedFlag == '0') {
                        unread++;
                    }
                }
                return unread;
            },
            isQuestionnaireComplete: function(questionnaireSerNum) {
                if (typeof questionnaireAnswers[questionnaireSerNum] !== 'undefined') {
                    return questionnaireAnswers[questionnaireSerNum].CompletedFlag;
                } else {
                    return questionnairesObject[questionnaireSerNum].CompletedFlag;
                }
            },
            isQuestionnaireInProgress: function(questionnaireSerNum) {
                if (typeof questionnaireAnswers[questionnaireSerNum] == 'undefined') {
                    return false;
                } else {
                    return true;
                }
            },
            isEmpty: function() {
                return (Object.keys(questionnairesObject).length === 0);
            },
            needsRefreshing: function() {
                return needsToRefresh;
            },
            clearQuestionnaires: function() {
                questionnaireAnswers = {};
                questionnairesObject = {};
            },
            requestQuestionnaires: function() {
                let deferred = $q.defer();
                this.clearQuestionnaires();
                let _this = this;
                RequestToServer.sendRequestWithResponse('Questionnaires')
                    .then(function(response) {
                            if (response.Code == '3') {
                                _this.setPatientQuestionnaires(response.Data);
                                deferred.resolve({Success: true, Location: 'Server'});
                                needsToRefresh = false;
                            }
                        },
                        function(error) {
                            deferred.reject({Success: false, Location: '', Error: error});
                        });

                return deferred.promise;
            },
            updateQuestionnairesFromNotification: function(notif) {
                needsToRefresh = true;
            },
            getQuestionnaireUrl: function() {
                return './views/personal/questionnaires/questionnairesList.html';
            },
            getQuestionnaireName: function() {
                return 'New Questionnaire';
            },
        };
}]);
