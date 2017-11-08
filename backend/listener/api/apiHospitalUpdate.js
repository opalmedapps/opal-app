const exports = module.exports = {};
const sqlInterface = require('./sqlInterface.js');

//API call to log user out
exports.logout=function(requestObject)
{
  return sqlInterface.addToActivityLog(requestObject);
};

//Send message
exports.sendMessage=function(requestObject)
{
  return sqlInterface.sendMessage(requestObject);
};

//Input questionnaire answers to DB
exports.inputQuestionnaireAnswers = function(requestObject)
{
  return sqlInterface.inputQuestionnaireAnswers(requestObject);
};

//Input feedback
exports.inputFeedback=function(requestObject)
{
  return sqlInterface.inputFeedback(requestObject);
};

//User Account Change
exports.accountChange = function (requestObject) {
   return sqlInterface.updateAccountField(requestObject);
};

//Update Read Status
exports.updateReadStatus=function(requestObject)
{
  return sqlInterface.updateReadStatus(requestObject.UserID,requestObject.Parameters);
};

//Update checkin
exports.checkIn = function (requestObject) {
    return sqlInterface.checkIn(requestObject);
};

//Update device token for push notifications
exports.updateDeviceIdentifier= function(requestObject)
{
  return sqlInterface.updateDeviceIdentifier(requestObject);
};

//Input rating for 
exports.inputEducationalMaterialRating= function(requestObject)
{
  return sqlInterface.inputEducationalMaterialRating(requestObject);
};

// Get all notifications
exports.getAllNotifications = function (requestObject) {
    return sqlInterface.getAllNotifications(requestObject);
};