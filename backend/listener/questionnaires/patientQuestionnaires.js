var exports = module.exports = {};
var mysql = require('mysql');
var q = require('q');
var credentials = require('./../config.json');

/*var sqlConfig={
  port:'/Applications/MAMP/tmp/mysql/mysql.sock',
  user:'root',
  password:'root',
  database:'QuestionnairesDB',
  dateStrings:true
};
/*
*Connecting to mysql database
*/
var sqlConfig={
  host:credentials.HOST,
  user:credentials.MYSQL_USERNAME,
  password:credentials.MYSQL_PASSWORD,
  database:'QuestionnairesDB',
  dateStrings:true
};
/*
*Re-connecting the sql database, NodeJS has problems and disconnects if inactive,
The handleDisconnect deals with that
*/
var connection = mysql.createConnection(sqlConfig);

function handleDisconnect(myconnection) {
  myconnection.on('error', function(err) {
    //console.log('Re-connecting lost connection');
    connection.destroy();
    connection = mysql.createConnection(sqlConfig);
    handleDisconnect(connection);
    connection.connect();
  });
}

handleDisconnect(connection);

//Queties to obtain the questions and question choices for questionnaires
var queryQuestions = "SELECT DISTINCT Questionnaire.QuestionnaireSerNum as QuestionnaireDBSerNum, Questionnaire.QuestionnaireName, QuestionnaireQuestion.OrderNum, QuestionnaireQuestion.QuestionnaireQuestionSerNum, Question.QuestionSerNum, Question.isPositiveQuestion, Question.QuestionQuestion as QuestionText_EN, Question.QuestionName as Asseses_EN, Question.QuestionName_FR as Asseses_FR, Question.QuestionQuestion_FR as QuestionText_FR, QuestionType.QuestionType, QuestionType.QuestionTypeSerNum FROM Questionnaire, Question, QuestionType, Patient, QuestionnaireQuestion WHERE QuestionnaireQuestion.QuestionnaireSerNum = Questionnaire.QuestionnaireSerNum AND QuestionnaireQuestion.QuestionSerNum = Question.QuestionSerNum AND Question.QuestionTypeSerNum = QuestionType.QuestionTypeSerNum AND Questionnaire.QuestionnaireSerNum IN ? ORDER BY QuestionnaireDBSerNum, OrderNum";
var queryQuestionChoices = "SELECT QuestionSerNum, MCSerNum as OrderNum, MCDescription as ChoiceDescription_EN, MCDescription_FR as ChoiceDescription_FR  FROM QuestionMC WHERE QuestionSerNum IN ? UNION ALL SELECT * FROM QuestionCheckbox WHERE QuestionSerNum IN ? UNION ALL SELECT * FROM QuestionMinMax WHERE QuestionSerNum IN ? ORDER BY QuestionSerNum, OrderNum DESC";
var queryAnswersPatientQuestionnaire = "SELECT QuestionnaireQuestionSerNum, Answer.Answer, PatientQuestionnaireSerNum as PatientQuestionnaireDBSerNum FROM Answer WHERE PatientQuestionnaireSerNum IN ? ORDER BY PatientQuestionnaireDBSerNum;"


/*SELECT QuestionnaireQuestionSerNum,  GROUP_CONCAT(Answer SEPARATOR ', ') as Answer, PatientQuestionnaireSerNum as PatientQuestionnaireDBSerNum FROM Answer WHERE PatientQuestionnaireSerNum IN ? GROUP BY QuestionnaireQuestionSerNum ORDER BY PatientQuestionnaireDBSerNum;"*/
exports.getPatientQuestionnaires = function (rows)
{
  var r = q.defer();
  //console.log('QUESTIONNAIRE ROWS=====================================================',rows);
  if(rows.length!== 0)
  {
    var questionnaireDBSerNumArray = getQuestionnaireDBSerNums(rows);
    var r = q.defer();
    var quer = connection.query(queryQuestions, [[questionnaireDBSerNumArray]], function(err,  questions, fields){
      if(err) r.reject(err);

      //console.log(questions);
      getQuestionChoices(questions).then(function(questionsChoices){
        var questionnaires = prepareQuestionnaireObject(questionsChoices,rows);
        var patientQuestionnaires = {};
        attachingQuestionnaireAnswers(rows).then(function(paQuestionnaires)
        {
          patientQuestionnaires = paQuestionnaires;
          r.resolve({'Questionnaires':questionnaires, 'PatientQuestionnaires':patientQuestionnaires});
        }).catch(function(error)
        {
          //console.log(error);
          r.reject(error);
        });
      }).catch(function(err){
        r.reject(err);
      })
    });  
  }else{
    r.resolve([]);
  }
  return r.promise;
};

//Formats questionnaire object to be ready for the app.
function prepareQuestionnaireObject(questionnaires, opalDB)
{
  var questionnairesObject = {};
  for(var i = 0;i<questionnaires.length;i++)
  {
    var questionnaireSerNum = questionnaires[i].QuestionnaireDBSerNum;
    if(!questionnairesObject.hasOwnProperty(questionnaires[i].QuestionnaireDBSerNum))
    {
      questionnairesObject[questionnaires[i].QuestionnaireDBSerNum] = {};
      questionnairesObject[questionnaires[i].QuestionnaireDBSerNum].QuestionnaireDBSerNum = questionnaires[i].QuestionnaireDBSerNum;
      questionnairesObject[questionnaires[i].QuestionnaireDBSerNum].QuestionnaireName = questionnaires[i].QuestionnaireName;
      delete questionnaires[i].QuestionnaireName;
      delete questionnaires[i].QuestionnaireDBSerNum;
      questionnairesObject[questionnaireSerNum].Questions = {};
      questionnairesObject[questionnaireSerNum].Questions[questionnaires[i].QuestionnaireQuestionSerNum]=questionnaires[i];
    }else{
      delete questionnaires[i].QuestionnaireName;
      delete questionnaires[i].QuestionnaireDBSerNum;
      questionnairesObject[questionnaireSerNum].Questions[questionnaires[i].QuestionnaireQuestionSerNum]=questionnaires[i];
    }
  }
  
  return questionnairesObject;
  
}
//Extracts only questionnaireSerNum for query injection
function getQuestionnaireDBSerNums(rows)
{
  var array = [];
  for (var i = 0; i < rows.length; i++) {
    array.push(rows[i].QuestionnaireDBSerNum);
  };
  return array;
}

//Gets the choices for  questions
function getQuestionChoices(rows)
{
  var r = q.defer();
  var array = [];
  for (var i = 0; i < rows.length; i++) {
    array.push(rows[i].QuestionSerNum);
  };
  connection.query(queryQuestionChoices,[[array],[array],[array]],function(err,choices,fields){
    //console.log(err);
    if(err) r.reject(err);
    var questions = attachChoicesToQuestions(rows,choices);
    ////console.log(questions);
    r.resolve(questions);
  });
  return r.promise;
}

//Helper function to attach choices to particular questions
function attachChoicesToQuestions(questions,choices)
{

  for (var i = 0; i < questions.length; i++) {
    for (var j = choices.length - 1; j >= 0; j--) {
      if(questions[i].QuestionSerNum == choices[j].QuestionSerNum)
      {
        if(!questions[i].hasOwnProperty('Choices'))
        {
          questions[i].Choices = [];
        }
        questions[i].Choices.push(choices[j]);
        choices.splice(j,1);
      }
    };
  };
  return questions;
}

//Attaching answers to answered questionnaires
function attachingQuestionnaireAnswers(opalDB)
{
  var r = q.defer();
  var patientQuestionnaires = {};
  var patientQuestionnaireSerNumArray = [];
  for (var i = 0; i < opalDB.length; i++) {
    patientQuestionnaires[opalDB[i].QuestionnaireSerNum] = opalDB[i];
    if(opalDB[i].CompletedFlag == 1 || opalDB[i].CompletedFlag == '1')
    {
      
      patientQuestionnaireSerNumArray.push(opalDB[i].PatientQuestionnaireDBSerNum);
    }
  }
  if(patientQuestionnaireSerNumArray.length>0)
  {
    var quer = connection.query(queryAnswersPatientQuestionnaire, [[patientQuestionnaireSerNumArray]],function(err, rows, fields)
    {
      //console.log("QUESTIONNAIRE ANSWERS======================================================", rows);
      //console.log(quer.sql);
      //console.log('line 169', err);
      if(err) r.reject(err);
      var answersQuestionnaires = {};
      for (var i = 0; i < rows.length; i++) {
        if(!answersQuestionnaires.hasOwnProperty(rows[i].PatientQuestionnaireDBSerNum))answersQuestionnaires[rows[i].PatientQuestionnaireDBSerNum] = [];
        answersQuestionnaires[rows[i].PatientQuestionnaireDBSerNum].push(rows[i]);
      }
      for (var i = 0; i < opalDB.length; i++) {

        if(opalDB[i].CompletedFlag == 1 || opalDB[i].CompletedFlag == '1') patientQuestionnaires[opalDB[i].QuestionnaireSerNum].Answers = answersQuestionnaires[opalDB[i].PatientQuestionnaireDBSerNum];
        //console.log(patientQuestionnaires[opalDB[i].QuestionnaireSerNum]);
      }

      r.resolve(patientQuestionnaires);
      
    }); 
  }else{
    //console.log('Hello World');
    r.resolve(patientQuestionnaires);
  }
  return r.promise;
  
}
//Query answers table
function getAnswersQuestionnaires()
{
  connection.query(getAnswersQuery, [])
}
/**
* Inserting questionnaire answers
*
**/
var inputAnswersQuery = "INSERT INTO `Answer`(`AnswerSerNum`, `QuestionnaireQuestionSerNum`, `Answer`, `LastUpdated`, `PatientSerNum`, `PatientQuestionnaireSerNum`) VALUES (NULL,?,?,NULL,?,?)"
var patientSerNumQuery = "SELECT PatientSerNum FROM Patient WHERE Patient.PatientId = ?;"
var inputPatientQuestionnaireQuery = "INSERT INTO `PatientQuestionnaire`(`PatientQuestionnaireSerNum`, `PatientSerNum`, `DateTimeAnswered`, `QuestionnaireSerNum`) VALUES (NULL,?,?,?)"
exports.inputQuestionnaireAnswers = function(parameters)
{
  var r = q.defer();
  getPatientSerNum(parameters.PatientId).then(function(serNum){
    var sa=connection.query(inputPatientQuestionnaireQuery,[serNum, parameters.DateCompleted, parameters.QuestionnaireDBSerNum],function(err,result)
    {
      //console.log(sa.sql);
      if(err)r.reject(err);
      //console.log(result);
      inputAnswersHelper(result.insertId,serNum, parameters.Answers).then(function(res){
        r.resolve(result.insertId);
      }).catch(function(err){
        r.reject(err);
      });
    });
  });
  return r.promise;
};
//Get PatientSerNum for that part
function getPatientSerNum(patientId)
{
  var r = q.defer();
  connection.query(patientSerNumQuery, [patientId],function(err,rows,fields)
  {
    if(err) r.reject(err);
    else r.resolve(rows[0].PatientSerNum);
  });
  return r.promise;
}
//Helper processes most of the work to insert query.
function inputAnswersHelper(id,patientSerNum, answers)
{
  var r = q.defer();
  var arrayPromises = [];
  //console.log(answers);
  for (var i in answers) {
    var objectAnswer = answers[i].Answer;
    if(answers[i].QuestionType == 'Checkbox')
    {
      for(var key in objectAnswer)
      { 
        if(objectAnswer[key]!=='')
        {
          arrayPromises.push(promisifyQuery(inputAnswersQuery, [answers[i].QuestionnaireQuestionSerNum,objectAnswer[key], patientSerNum,id]));
        }
      }
    }else{
      arrayPromises.push(promisifyQuery(inputAnswersQuery, [answers[i].QuestionnaireQuestionSerNum,objectAnswer, patientSerNum,id]));
    }
  }
  q.all(arrayPromises).then(function(result)
  {
    //console.log(result);
    r.resolve(result);
  }).catch(function(err){
    //console.log(err);
    r.reject(err);
  });
  
  return r.promise;
}
//Turns a callback query function into a promise
function promisifyQuery(query, parameters)
{
  var r = q.defer();
  connection.query(query,parameters,function(err,rows,fields)
  {
    if(err) r.reject(err);
    else r.resolve(rows);
  });
  return r.promise;

}