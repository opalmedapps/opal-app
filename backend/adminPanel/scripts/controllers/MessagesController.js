app.controller('MessagesController',function ($scope, Messages,api,AllPatients,$timeout,$rootScope,User) {
	var messages=[];

  $scope.user=User.getUserFirstName() + ' ' + User.getUserLastName();
		refreshConversations();
		$rootScope.NumberOfNewMessages=0;
		function refreshConversations(){
			$scope.glue=true;
			api.getAllPatients().then(function(result){
				AllPatients.setPatients(result);
				Messages.getMessagesFromServer().then(function(messagesFromService){
				Messages.setMessages(messagesFromService);
				$timeout(function(){
					$scope.chat=Messages.getMessages();
					console.log($scope.chat);
					$rootScope.NumberOfNewMessages=0;
					$scope.goToConversation(0);
					
				});
			 });
			});
		};

$scope.goToConversation=function(index)
{

	$scope.selectedIndex=index;
	$scope.conversation=$scope.chat[index].Messages;
	//$scope.conversation.ReadStatus=1;
	console.log($scope.conversation);
	if($scope.chat[index].ReadStatus==0)
	{
		$scope.chat[index].ReadStatus=1;
		Messages.readConversation(index);

	}

}
$scope.sendMessage=function(index){
	$rootScope.checkSession();
	var messageToSend={};
	console.log(Messages.getMessages());
 var messageDate=new Date();

 Messages.sendMessage($scope.newMessage, $scope.chat[$scope.selectedIndex].PatientSerNum, messageDate);
 $scope.newMessage='';

};



});
