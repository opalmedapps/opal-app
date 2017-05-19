/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
var myApp=angular.module('MUHCApp');
myApp.controller('TxTeamMessagesController',['$scope','$timeout','TxTeamMessages','UserPreferences','NavigatorParameters',function($scope,$timeout,TxTeamMessages,UserPreferences,NavigatorParameters){

    //Initializing


    init();
    //Initializing name and body of post
    function init()
    {
        $scope.noMessages = true;
        var messages = TxTeamMessages.getTxTeamMessages();
        messages = TxTeamMessages.setLanguageTxTeamMessages(messages);
        if (messages.length>0) $scope.noMessages = false;
        $scope.txTeamMessages=messages;
    }
    //Function that goes to individual team message
    $scope.goToTeamMessage=function(message)
    {
        if(message.ReadStatus === '0')
        {
            message.ReadStatus = '1';
            TxTeamMessages.readTxTeamMessageBySerNum(message.TxTeamMessageSerNum);
        }
        NavigatorParameters.setParameters({'Navigator':'personalNavigator','Post':message});
        personalNavigator.pushPage('./views/personal/treatment-team-messages/individual-team-message.html');
    };

    $scope.showHeader = function (index) {

        if (index === $scope.txTeamMessages.length -1) return true;

        var current = (new Date($scope.txTeamMessages[index].DateAdded)).setHours(0,0,0,0);
        var previous = (new Date($scope.txTeamMessages[index+1].DateAdded)).setHours(0,0,0,0);
        return current !== previous;
    }

}]);
myApp.controller('IndividualTxTeamMessageController',['$scope','NavigatorParameters','TxTeamMessages','Patient', function($scope,NavigatorParameters,TxTeamMessages, Patient){
    var parameters=NavigatorParameters.getParameters();
    var message = TxTeamMessages.setLanguageTxTeamMessages(parameters.Post);
    $scope.FirstName = Patient.getFirstName();
    $scope.message=message;
}]);
