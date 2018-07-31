var myApp = angular.module('MUHCApp');
myApp.service('Questionnaires', [
    'RequestToServer',
    '$filter',
    'Patient',
    'LocalStorage',
    '$q',
    'UserPreferences',
    function (RequestToServer, $filter, Patient, LocalStorage, $q, UserPreferences) {

        var questionnaireList = [];
        var newQuestionnaires = {};
        var inProgressQuestionnaires = {};
        var completeQuestionnaires = {};
        var historicalQuestionnaires = [];
        var newAnswers = {};
        var currentQuestionnaire = {};
        var completedQuestionnaireByName = {};
        var scores = [];
        var algorithms = [];
        var minmax = []; // [min,max]
        var answers = []; // [{option_ser_num, scale_value},..]

        function addToQuestionnaireObject(questionnaires) {
            for (var key in questionnaires.PatientQuestionnaires) {
                if (questionnaires.PatientQuestionnaires[key]) questionnairesObject.PatientQuestionnaires[key] = questionnaires.PatientQuestionnaires[key];
            }
            questionnairesObject.Questionnaires = questionnaires.Questionnaires;


            LocalStorage.WriteToLocalStorage('Questionnaires', questionnairesObject);
        }

        // calculate the scores of Fact-B
        /*function calculateFACT_B (ep)
        {

        }

        function calculateBRSQ (ep)
        {
            var scores = {total: 0, sections: {}};
            for (var section in ep)
            {
                var secscores = {score: 0};
                // calculate section score
                for (var question in section)
                {

                }
                scores.sections[section.ser_num] = secscores;
            }
        }

        function calculateScores(entity_ser_num, section_ser_num, question_ser_num)
        {
              var url_params = {
                  "patient_ser_num": 1, //Patient.getPatientId()
                  "language": "en", //UserPreferences.getLanguage();
                  "entity_ser_num": entity_ser_num,
                  "section_ser_num": section_ser_num,
                  "question_ser_num": question_ser_num
              };

              // get entity_patient_rel's that needs computing
              RequestToServer.sendRequestWithResponse('Questionnaires', null, null, null, null, "http://127.0.0.1:5000/questionnaires-absentscores/", url_params)
                  .then(function (response) {
                    console.log(response);
                    // calculate the entire questionnaire
                    for (var ep in response) {
                        if (ep.title == "Breast Radiotherapy Symptom Questionnaire") {
                            calculateBRSQ(ep);
                        }
                        else if (ep.title == "FACT-B") {
                            calculateFACT_B(ep);
                        }
                    }
                  },
                  function (error) {
                    deferred.reject({Success: false, Location: '', Error: error});
              });
        }*/

        return {
            getQuestionnaireCount: function (type) {
                if (type == "New") {
                    return Object.keys(newQuestionnaires).length;
                }
                else if (type == "In Progress") {
                    return Object.keys(inProgressQuestionnaires).length;
                }
                else if (type == "Completed") {
                    return Object.keys(completeQuestionnaires).length;
                }

                return -1;
            },
            submitQuestionnaire: function (questionnaireSerNum) {
                // TODO
                questionnaireAnswers[questionnaireSerNum].PatientId = Patient.getPatientId();
                dateCompleted = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                questionnaireAnswers[questionnaireSerNum].DateCompleted = dateCompleted;
                questionnairesObject.PatientQuestionnaires[questionnaireSerNum].CompletionDate = dateCompleted;
                questionnaireAnswers[questionnaireSerNum].CompletedFlag = 1;
                questionnairesObject.PatientQuestionnaires[questionnaireSerNum].CompletedFlag = 1;


                submittableQuestionnaire = angular.copy(questionnaireAnswers[questionnaireSerNum]);
                RequestToServer.sendRequest('QuestionnaireAnswers', submittableQuestionnaire);
            },
            getNumberOfUnreadQuestionnaires: function () {
                return Object.keys(newQuestionnaires).length;
            },
            isEmpty: function () {
                return (questionnaireList.length === 0);
            },
            clearQuestionnaires: function () {
                questionnaireList = [];
                newQuestionnaires = {};
                inProgressQuestionnaires = {};
                completeQuestionnaires = {};
            },
            clearQuestionnaire: function () {
                currentQuestionnaire = {};
            },
            getQuestionnaires: function (type) {
                if (type == 'New') {
                    return newQuestionnaires;
                }
                else if (type == "In Progress") {
                    return inProgressQuestionnaires;
                }
                else {
                    return completeQuestionnaires;
                }
            },
            getByQuestionnaireName: function () {
                return completedQuestionnaireByName;
            },
            getQuestionnairesDateArray: function () {
                return completedQuestionnaireByDateArray;
            },
            setQuestionnaires: function (questionnaires) {
                questionnaireList = questionnaires;
                // sort questionnaires by status
                var j = 0;
                for (var i = 0; i < questionnaireList.length; i++) {
                    var questionnaire = questionnaireList[i];
                    if (questionnaire.status == "New") {
                        newQuestionnaires[questionnaire.qp_ser_num] = questionnaire;
                    }
                    else if (questionnaire.status == "Completed") {
                        completeQuestionnaires[j] = questionnaire;
                        j++;

                        var questionnaireName = questionnaire.nickname;
                        var questionnaireDate = new Date(questionnaire.last_updated).getTime();


                        if (completedQuestionnaireByName[questionnaireName] === undefined ||
                            questionnaireDate > new Date(completedQuestionnaireByName[questionnaireName].last_updated).getTime()) {
                            // keep a questionnaire prototype
                            completedQuestionnaireByName[questionnaireName] = questionnaire;
                        }


                    }
                    else {
                        inProgressQuestionnaires[questionnaire.qp_ser_num] = questionnaire;
                    }
                }
            },
            setQuestionnaire: function (questionnaire) {
                currentQuestionnaire = questionnaire;
            },
            getQuestionnaire: function () {
                console.log("questionnaireService getQuest");
                console.log(currentQuestionnaire);
                return currentQuestionnaire;
            },
            updateQuestionnaireStatus: function (questionnaire_patient_rel_ser_num, new_status) {
                let params = {
                    'qp_ser_num': questionnaire_patient_rel_ser_num,
                    'new_status': new_status,
                };
                RequestToServer.sendRequestWithResponse('UpdateQuestionnaireStatus', params) // 'UpdateQuestionnaireStatus'
                    .then(function (response) {
                            this.setQuestionnaires(response.Data);
                            deferred.resolve({Success: true, Location: 'Server'});
                        },
                        function (error) {
                            deferred.reject({Success: false, Location: '', Error: error});
                        });
                // RequestToServer.sendRequestWithResponse('Questionnaires', null, null, null, null, 'http://127.0.0.1:5000/update-questionnaire-status/', url_params)
                //     .then(function(response) {
                //         console.log(response);
                //     });
            },
            // to get 1 questionnaire:  language, questionnaire_patient_rel_ser_num
            // to get list
            // save answer: section, question type
            saveQuestionnaireAnswer: function (questionnaire_patient_rel_ser_num, question_ser_num, answerValue, answeroption_ser_num, question_type, section) {
                let deferred = $q.defer();
                let _this = this;

                let params = {
                    'qp_ser_num': questionnaire_patient_rel_ser_num,
                    'q_ser_num': question_ser_num,
                    'patientAnswers': answeroption_ser_num,
                    'answerValue': answerValue,
                    'questionType': question_type,
                    'sectionSerNum': section
                    // 'ao_ser_num': answeroption_ser_num
                };

                RequestToServer.sendRequestWithResponse('QuestionnaireAnswers', params)
                    .then(function (response) {
                            _this.setQuestionnaires(response.Data);
                            deferred.resolve({Success: true, Location: 'Server'});
                        },
                        function (error) {
                            deferred.reject({Success: false, Location: '', Error: error});
                        });

            },
            saveQuestionFeedback: function(questionnaire_patient_rel_ser_num, question_ser_num, answeroption_ser_num, section) {
                let deferred = $q.defer();
                let _this = this;
                var temp = {'feedbackAnswerOptionSerNum': answeroption_ser_num, 'feedbackText':null};
                let params = {
                    'qp_ser_num': questionnaire_patient_rel_ser_num,
                    'q_ser_num': question_ser_num,
                    'sectionSerNum': section,
                    'patientAnswers': temp,
                };

                RequestToServer.sendRequestWithResponse('QuestionFeedback', params)
                    .then(function (response) {
                            //_this.setQuestionnaires(response.Data);
                            console.log('success saving feedback');
                            deferred.resolve({Success: true, Location: 'Server'});
                        },
                        function (error) {
                            deferred.reject({Success: false, Location: '', Error: error});
                        });
            },
            requestQuestionnaires: function (type) {
                let deferred = $q.defer();
                this.clearQuestionnaires();
                let _this = this;

                // Parameters
                let params = {
                    'language': 'EN'
                };

                // CONNECTION TO FIREBASE
                RequestToServer.sendRequestWithResponse('Questionnaires', params)
                    .then(function (response) {
                            _this.setQuestionnaires(response.Data);
                            deferred.resolve({Success: true, Location: 'Server'});
                        },
                        function (error) {
                            deferred.reject({Success: false, Location: '', Error: error});
                        });

                return deferred.promise;
            },
            requestQuestionnaire: function (questionnaire_patient_rel_ser_num) {
                let deferred = $q.defer();
                this.clearQuestionnaire();
                let _this = this;

                // Parameters
                let params = {
                    'qp_ser_num': questionnaire_patient_rel_ser_num,
                    'language': 'EN'
                };

                // CONNECTION TO FIREBASE
                RequestToServer.sendRequestWithResponse('Questionnaire', params)
                    .then(function (response) {
                            console.log("response.Data");
                            console.log(response.Data);
                            _this.setQuestionnaire(response.Data);
                            deferred.resolve({Success: true, Location: 'Server'});
                        },
                        function (error) {
                            deferred.reject({Success: false, Location: '', Error: error});
                        });

                return deferred.promise;
            },
            setHistoricalQuestionnaires: function (questionnaires) {
                historicalQuestionnaires = questionnaires;
            },

            getHistoricalQuestionnaires: function () {
                return historicalQuestionnaires;
            },

            requestHistoricalQuestionnaires(questionnaireSerNum) {
                var deferred = $q.defer();
                historicalQuestionnaires = [];
                var _this = this;

                RequestToServer.sendRequestWithResponse('HistoricalQuestionnaires', {
                    questionnaire_ser_num: questionnaireSerNum,
                    language: UserPreferences.getLanguage()
                })
                    .then(function (response) {
                            historicalQuestionnaires = response.Data;
                            _this.setHistoricalQuestionnaires(response.Data);
                            deferred.resolve({Success: true, Location: 'Server'});
                        },
                        function (error) {
                            deferred.reject({Success: false, Location: '', Error: error});
                        });

                return deferred.promise;
            },

            clearHistoricalQuestionnaires: function() {
                historicalQuestionnaires = [];
            },


            // =====================
            // Scores part
            // ======================

            clearMinMax: function () {
                minmax = [];
            },

            getMinmax: function () {
                return minmax;
            },

            clearAlgorithms: function () {
                algorithms = [];
            },

            getAlgorithms: function () {
                return algorithms;
            },

            requestAlgorithms: function (entity_ser_num) {
                var deferred = $q.defer();
                this.clearAlgorithms();

                var url_params = {
                    "language": "en", //UserPreferences.getLanguage();
                    "entity_ser_num": entity_ser_num
                };

                RequestToServer.sendRequestWithResponse('Questionnaires', null, null, null, null, "http://127.0.0.1:5000/questionnaire-algorithms/", url_params)
                    .then(function (response) {
                            // set algorithms
                            algorithms = response;

                            deferred.resolve({Success: true, Location: 'Server'});
                        },
                        function (error) {
                            deferred.reject({Success: false, Location: '', Error: error});
                        }
                    );

                return deferred.promise;
            },

            clearScores: function () {
                scores = [];
            },

            getScores: function () {
                return scores;
            },

            requestEntityScores: function (entity_ser_num, alg_ser_num) {
                var deferred = $q.defer();
                this.clearScores();

                // CONNECTION TO ANNA'S LOCAL API
                var url_params = {
                    "patient_ser_num": 1, //Patient.getPatientId()
                    "language": "en", //UserPreferences.getLanguage();
                    "entity_ser_num": entity_ser_num,
                    "alg_ser_num": alg_ser_num
                };

                // get scores
                RequestToServer.sendRequestWithResponse('Questionnaires', null, null, null, null, "http://127.0.0.1:5000/questionnaire-scores/", url_params)
                    .then(function (response) {

                            // set scores
                            scores = response;
                            console.log(scores);

                            deferred.resolve({Success: true, Location: 'Server'});
                        },
                        function (error) {
                            console.error(error);
                            deferred.reject({Success: false, Location: '', Error: error});
                        }
                    );

                return deferred.promise;
            },

            requestSectionScores: function (entity_ser_num, section_ser_num, alg_ser_num) {
                var deferred = $q.defer();
                this.clearScores();
                var _this = this;

                // CONNECTION TO ANNA'S LOCAL API
                var url_params = {
                    "patient_ser_num": 1, //Patient.getPatientId()
                    "language": "en", //UserPreferences.getLanguage();
                    "entity_ser_num": entity_ser_num,
                    "section_ser_num": section_ser_num,
                    "alg_ser_num": alg_ser_num
                };

                // get scores
                RequestToServer.sendRequestWithResponse('Questionnaires', null, null, null, null, "http://127.0.0.1:5000/questionnaire-scores/", url_params)
                    .then(function (response) {

                            // set scores
                            scores = response;

                            deferred.resolve({Success: true, Location: 'Server'});
                        },
                        function (error) {
                            deferred.reject({Success: false, Location: '', Error: error});
                        });

                return deferred.promise;
            },

            requestQuestionScores: function (entity_ser_num, section_ser_num, question_ser_num, alg_ser_num) {
                var deferred = $q.defer();
                this.clearScores();
                var _this = this;

                // CONNECTION TO ANNA'S LOCAL API
                var url_params = {
                    "patient_ser_num": 1, //Patient.getPatientId()
                    "language": "en", //UserPreferences.getLanguage();
                    "entity_ser_num": entity_ser_num,
                    "section_ser_num": section_ser_num,
                    "question_ser_num": question_ser_num,
                    "alg_ser_num": alg_ser_num
                };

                // get scores
                // use RequestToServer service and Server.js
                RequestToServer.sendRequestWithResponse('Questionnaires', null, null, null, null, "http://127.0.0.1:5000/questionnaire-scores/", url_params)
                    .then(function (response) {
                            // set scores and minmax
                            scores = response.scores;
                            var portions = response.portions;
                            var portionArr = [];
                            for (var i in portions) {
                                portionArr.push(portions[i].portion);
                            }
                            // get min and max of portions
                            // if portions returns undefined, it means the alg is default, standardized to 100
                            if (portions == undefined) {
                                minMax = [0, 100];
                            }
                            else {
                                minMax = [Math.min.apply(null, portionArr), Math.max.apply(null, portionArr)];
                            }

                            deferred.resolve({Success: true, Location: 'Server'});
                        },
                        function (error) {
                            deferred.reject({Success: false, Location: '', Error: error});
                        });

                return deferred.promise;
            },

            clearAnswers: function () {
                answers = [];
            },

            getAnswers: function () {
                return answers;
            },

            requestQuestionAnswers: function (entity_ser_num, section_ser_num, question_ser_num) {
                var deferred = $q.defer();
                this.clearAnswers();
                var _this = this;

                // CONNECTION TO ANNA'S LOCAL API
                var url_params = {
                    "patient_ser_num": 1, //Patient.getPatientId()
                    "language": "en", //UserPreferences.getLanguage();
                    "entity_ser_num": entity_ser_num,
                    "section_ser_num": section_ser_num,
                    "question_ser_num": question_ser_num
                };

                // get scores
                // use RequestToServer service and Server.js
                RequestToServer.sendRequestWithResponse('Questionnaires', null, null, null, null, "http://127.0.0.1:5000/questionnaire-answers/", url_params)
                    .then(function (response) {
                            // set scores and minmax
                            answers = response;
                            deferred.resolve({Success: true, Location: 'Server'});
                        },
                        function (error) {
                            deferred.reject({Success: false, Location: '', Error: error});
                        });
            }
        }
    }]);
