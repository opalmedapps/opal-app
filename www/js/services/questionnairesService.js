

var myApp = angular.module('MUHCApp');
myApp.service('Questionnaires', ['RequestToServer', '$filter', 'Patient', 'LocalStorage', '$q', function(RequestToServer, $filter, Patient, LocalStorage, $q) {
    var questionnaireList = [];
    var newQuestionnaires = {};
    var inProgressQuestionnaires = {};
    var completeQuestionnaires = {};
    var newAnswers = {};
    var currentQuestionnaire;

    function addToQuestionnaireObject(questionnaires) {
        for (var key in questionnaires.PatientQuestionnaires) {
            if (questionnaires.PatientQuestionnaires[key]) questionnairesObject.PatientQuestionnaires[key] = questionnaires.PatientQuestionnaires[key];
        }
        questionnairesObject.Questionnaires = questionnaires.Questionnaires;


        LocalStorage.WriteToLocalStorage('Questionnaires', questionnairesObject);
    }

    return {
        getQuestionnaireCount: function(type) {
            if (type == 'New') {
                return Object.keys(newQuestionnaires).length;
            } else if (type == 'In progress') {
                return Object.keys(inProgressQuestionnaires).length;
            } else if (type == 'Completed') {
                return Object.keys(completeQuestionnaires).length;
            }

            return -1;
        },
        submitQuestionnaire: function(questionnaireSerNum) {
            // TODO
            questionnaireAnswers[questionnaireSerNum].PatientId = Patient.getPatientId();
            dateCompleted = $filter('date')(new Date(),'yyyy-MM-dd HH:mm:ss');
            questionnaireAnswers[questionnaireSerNum].DateCompleted = dateCompleted;
            questionnairesObject.PatientQuestionnaires[questionnaireSerNum].CompletionDate = dateCompleted;
            questionnaireAnswers[questionnaireSerNum].CompletedFlag = 1;
            questionnairesObject.PatientQuestionnaires[questionnaireSerNum].CompletedFlag = 1;


            submittableQuestionnaire = angular.copy(questionnaireAnswers[questionnaireSerNum]);
            RequestToServer.sendRequest('QuestionnaireAnswers', submittableQuestionnaire);
        },
        getNumberOfUnreadQuestionnaires: function() {
            return Object.keys(newQuestionnaires).length;
        },
        isEmpty: function() {
            return (questionnaireList.length === 0);
        },
        clearQuestionnaires: function() {
            questionnaireList = [];
            newQuestionnaires = {};
            inProgressQuestionnaires = {};
            completeQuestionnaires = {};
        },
        clearQuestionnaire: function() {
            currentQuestionnaire = {};
        },
        getQuestionnaires: function(type) {
            if (type == 'New') {
                return newQuestionnaires;
            } else if (type == 'In progress') {
                return inProgressQuestionnaires;
            } else {
                return completeQuestionnaires;
            }
        },
        setQuestionnaires: function(questionnaires) {
            questionnaireList = questionnaires;
            // sort questionnaires by status
            for (let i = 0; i < questionnaireList.length; i++) {
                let questionnaire = questionnaireList[i];
                if (questionnaire.status == 'New') {
                    newQuestionnaires[questionnaire.qp_ser_num] = questionnaire;
                } else if (questionnaire.status == 'Completed') {
                    completeQuestionnaires[questionnaire.qp_ser_num] = questionnaire;
                } else {
                    inProgressQuestionnaires[questionnaire.qp_ser_num] = questionnaire;
                }
            }
        },
        setQuestionnaire: function(questionnaire) {
            currentQuestionnaire = questionnaire;
        },
        getQuestionnaire: function() {
            return currentQuestionnaire;
        },
        updateQuestionnaireStatus: function(questionnaire_patient_rel_ser_num, new_status) {
            let params = {
                'qp_ser_num': questionnaire_patient_rel_ser_num,
                'new_status': new_status,
            };
            // TODO: change request when the database for questions is ready
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
        saveQuestionnaireAnswer: function(questionnaire_patient_rel_ser_num, question_ser_num, answeroption_ser_num, question_type, section) {
            let deferred = $q.defer();
            let _this = this;

            let params = {
                'qp_ser_num': questionnaire_patient_rel_ser_num,
                'q_ser_num' : question_ser_num,
                'patientAnswers': answeroption_ser_num,
                'questionType': question_type,
                'sectionSerNum': section
                // 'ao_ser_num': answeroption_ser_num
            };
            // TODO: change request when the database for questions is ready
            RequestToServer.sendRequestWithResponse('QuestionnaireAnswers', params)
                .then(function (response) {
                        _this.setQuestionnaires(response.Data);
                        deferred.resolve({Success: true, Location: 'Server'});
                    },
                    function (error) {
                        deferred.reject({Success: false, Location: '', Error: error});
                    });
            // RequestToServer.sendRequestWithResponse('Questionnaires', null, null, null, null, 'http://127.0.0.1:5000/questionnaire-answer/', url_params)
            //     .then(function(response) {
            //         console.log(response);
            //     });
        },
        requestQuestionnaires: function(type) {
            let deferred = $q.defer();
            this.clearQuestionnaires();
            let _this = this;

            // Parameters
            let params = {
                'language': 'en'
            };
            // TODO: change request when the database for questions is ready
            // RequestToServer.sendRequestWithResponse('Questionnaires', null, null, null, null, 'http://127.0.0.1:5000/questionnaires/', url_params)
            //     .then(function(response) {
            //             console.log(response);
            //             _this.setQuestionnaires(response);
            //             deferred.resolve({Success: true, Location: 'Server'});
            //         },
            //         function(error) {
            //             deferred.reject({Success: false, Location: '', Error: error});
            //         });

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
        requestQuestionnaire: function(questionnaire_patient_rel_ser_num) {
            let deferred = $q.defer();
            this.clearQuestionnaire();
            let _this = this;

            // Parameters
            let params = {
                'qp_ser_num': questionnaire_patient_rel_ser_num,
                'language': 'ENG'
            };
            // TODO: change request when the database for questions is ready
            // RequestToServer.sendRequestWithResponse('Questionnaires', null, null, null, null, 'http://127.0.0.1:5000/questionnaires/', url_params)
            //     .then(function(response) {
            //             console.log(response);
            //             _this.setQuestionnaires(response);
            //             deferred.resolve({Success: true, Location: 'Server'});
            //         },
            //         function(error) {
            //             deferred.reject({Success: false, Location: '', Error: error});
            //         });

            // CONNECTION TO FIREBASE
            RequestToServer.sendRequestWithResponse('Questionnaire',params)
                .then(function (response) {
                        _this.setQuestionnaire(response.Data);
                        deferred.resolve({Success: true, Location: 'Server'});
                    },
                    function (error) {
                        deferred.reject({Success: false, Location: '', Error: error});
                    });

            return deferred.promise;
        }
    };
}]);
