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

myApp.service('Questionnaires', ['RequestToServer','$filter', 'Patient','LocalStorage', '$q',
    function(RequestToServer, $filter, Patient,LocalStorage,$q){
        var questionnaireAnswers = {};
        var questionnairesObject = {};
        function findAndReplacePatientQuestionnaires(questionnaires)
        {
            var questionnairesObjectRef =questionnaires.Questionnaires;
            var patientQuestionnaireObject =questionnaires.PatientQuestionnaires;
            for(var serDBNum in questionnairesObjectRef)
            {
                var questionCopy = questionnairesObjectRef[serNum];
                if(questionnairesObject.hasOwnProperty(serNum)&&questionCopy.QuestionnaireDBSerNum == questionnairesObject[serNum].QuestionnaireDBSerNum)
                {
                    questionnairesObject[serNum] = questionCopy;
                }
            }
            for(var serNum in patientQuestionnaireObject)
            {
                var questionAnswerCopy = questionnairesObjectRef[serNum];
                if(questionnairesObject.hasOwnProperty(serNum)&&questionAnswerCopy.QuestionnaireSerNum == questionnairesObject[serNum].QuestionnaireSerNum)
                {
                    questionnairesObject[serNum] = questionAnswerCopy;
                }
            }


        }
        function addToQuestionnaireObject(questionnaires)
        {
            for(var key in questionnaires.PatientQuestionnaires)
            {
                if(questionnaires.PatientQuestionnaires[key]) questionnairesObject.PatientQuestionnaires[key] = questionnaires.PatientQuestionnaires[key];
            }
            questionnairesObject.Questionnaires = questionnaires.Questionnaires;


            LocalStorage.WriteToLocalStorage('Questionnaires',questionnairesObject);
        }

        return {
            updatePatientQuestionnaires:function(questionnaires)
            {
                if(questionnaires&&typeof questionnaires !=='undefined')
                {

                    findAndReplacePatientQuestionnaires(questionnaires);
                    addToQuestionnaireObject(questionnaires);
                }
            },
            setPatientQuestionnaires:function(questionnaires)
            {
                console.log(questionnaires);
                questionnairesObject = {};
                questionnairesObject.PatientQuestionnaires = {};
                questionnairesObject.Questionnaires = {};
                if(questionnaires&&typeof questionnaires !=='undefined') addToQuestionnaireObject(questionnaires);
                console.log(questionnairesObject);
            },
            getPatientQuestionnaires:function()
            {
                console.log(questionnairesObject);
                return questionnairesObject;
            },
            setQuestionnaireAnswers:function(Answer, questionnaireQuestionSerNum, questionnaireDBSerNum, questionnaireSerNum)
            {
                if((Object.keys(questionnaireAnswers).length == 0 ) || (Object.keys(questionnaireAnswers[questionnaireSerNum]).length == 0)) {
                    questionnaireAnswers[questionnaireSerNum] = {};
                    console.log(questionnairesObject[questionnaireDBSerNum]);
                    console.log(questionnaireDBSerNum);
                    console.log(questionnairesObject.Questionnaires[questionnaireDBSerNum]);
                    questionnaireAnswers[questionnaireSerNum].QuestionnaireDBSerNum = questionnairesObject.Questionnaires[questionnaireDBSerNum].QuestionnaireDBSerNum;
                    questionnaireAnswers[questionnaireSerNum].CompletedFlag = questionnairesObject.PatientQuestionnaires[questionnaireSerNum].CompletedFlag;;
                    questionnaireAnswers[questionnaireSerNum].Answers = {};
                    questionnaireAnswers[questionnaireSerNum].QuestionnaireSerNum = questionnaireSerNum;
                }
                questionnaireAnswers[questionnaireSerNum].Answers[questionnaireQuestionSerNum] = {
                    Answer: Answer,
                    QuestionType: questionnairesObject.Questionnaires[questionnaireDBSerNum].Questions[questionnaireQuestionSerNum].QuestionType,
                    QuestionnaireQuestionSerNum: questionnairesObject.Questionnaires[questionnaireDBSerNum].Questions[questionnaireQuestionSerNum].QuestionnaireQuestionSerNum
                };
                console.log(questionnaireAnswers);
            },
            getQuestionnaireAnswers:function(questionnaireSerNum)
            {
                if (questionnaireAnswers == undefined) {
                    return undefined;
                }
                if(questionnaireAnswers[questionnaireSerNum] == undefined) {
                    return undefined;
                }
                if((Object.keys(questionnaireAnswers).length == 0 ) || (Object.keys(questionnaireAnswers[questionnaireSerNum]).length == 0)) {
                    console.log('undefined');
                    return undefined;
                } else {
                    console.log(questionnaireAnswers[questionnaireSerNum]);
                    return questionnaireAnswers[questionnaireSerNum];
                }
            },
            submitQuestionnaire:function(questionnaireDBSerNum, questionnaireSerNum) {
                questionnaireAnswers[questionnaireSerNum].PatientId = Patient.getPatientId();
                dateCompleted = $filter('date')(new Date(),'yyyy-MM-dd HH:mm:ss');
                questionnaireAnswers[questionnaireSerNum].DateCompleted = dateCompleted;
                questionnairesObject.PatientQuestionnaires[questionnaireSerNum].CompletionDate = dateCompleted;
                questionnaireAnswers[questionnaireSerNum].CompletedFlag = 1;
                questionnairesObject.PatientQuestionnaires[questionnaireSerNum].CompletedFlag = 1;
                console.log(questionnairesObject);
                console.log(questionnaireAnswers[questionnaireSerNum]);
                submittableQuestionnaire = angular.copy(questionnaireAnswers[questionnaireSerNum]);
                RequestToServer.sendRequest('QuestionnaireAnswers', submittableQuestionnaire);
            },
            getNumberOfUnreadQuestionnaires:function()
            {
                var unread = 0;
                for (var key in questionnairesObject) {
                    if (questionnairesObject[key].CompletedFlag=='0') {
                        unread++;
                    }
                }
                return unread;
            },
            isQuestionnaireComplete:function(questionnaireSerNum) {
                if(typeof questionnaireAnswers[questionnaireSerNum] !== 'undefined') {
                    return questionnaireAnswers[questionnaireSerNum].CompletedFlag;
                } else {
                    return questionnairesObject[questionnaireSerNum].CompletedFlag;
                }
            },
            isQuestionnaireInProgress:function(questionnaireSerNum) {
                if(typeof questionnaireAnswers[questionnaireSerNum] == 'undefined') {
                    return false;
                } else {
                    return true;
                }
            },
            isEmpty:function()
            {
                return (Object.keys(questionnairesObject).length === 0);
            },
            clearQuestionnaires:function()
            {
                questionnaireAnswers = {};
                questionnairesObject = {};
            },
            requestQuestionnaires: function () {
                var deferred = $q.defer();
                this.clearQuestionnaires();
                var _this = this;
                RequestToServer.sendRequestWithResponse('Questionnaires')
                    .then(function (response) {
                        if (response.Code == '3') {
                            console.log(response);
                            _this.setPatientQuestionnaires(response.Data);
                            deferred.resolve({Success: true, Location: 'Server'});
                        }
                    },
                    function (error) {
                        console.log('There was an error contacting hospital ' + JSON.stringify(error));
                        deferred.reject({Success: false, Location: '', Error: error});
                        console.log("returning");

                    });

                return deferred.promise;

            }
        };
    }]);
