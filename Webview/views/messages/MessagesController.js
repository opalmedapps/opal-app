var app=angular.module('MUHCApp');
app.controller('MessagesController',function(UpdateUI, RequestToServer, $filter, $rootScope, UserAuthorizationInfo,$location,$anchorScroll,$timeout,$scope,Messages, Patient,$rootScope){
  $rootScope.NumberOfNewMessages='';
  $scope.sendButtonDisabled=true;
  $scope.newMessage='';
 $scope.messages=Messages.getUserMessages();



$scope.personClicked=function(index){
    var conversation=$scope.messages[index].Messages;
    $timeout(function(){
      $rootScope.searchingMask=false;
      $scope.glue=false;
      $scope.person.selected='';
      $scope.selectedIndex=index;
       if($scope.messages[$scope.selectedIndex].ReadStatus==0){
        for (var i = 0; i < conversation.length; i++) {
            console.log($scope.messages[index].Messages[i].MessageSerNum);
            RequestToServer.sendRequest('MessageRead',$scope.messages[index].Messages[i].MessageSerNum);
            $scope.messages[index].Messages[i].ReadStatus=1;
        };
    }
      $scope.messages[$scope.selectedIndex].ReadStatus=1;
      $scope.conversation=conversation;
      Messages.changeConversationReadStatus($scope.selectedIndex);
      $scope.glue=true;
    });
};

$scope.$watch('person.selected', function(){
  $timeout(function(){
    $rootScope.searchingMask=false;
    $scope.glue=false;
    if($scope.person.selected!==undefined){
      var index=$scope.person.selected.index;
      if(index!==undefined)
      {
        $scope.selectedIndex=index;
        var conversation=$scope.messages[$scope.selectedIndex].Messages;
        if($scope.messages[$scope.selectedIndex].ReadStatus==0){
            for (var i = 0; i < $scope.messages[$scope.selectedIndex].Messages.length; i++) {
                console.log($scope.messages[index].Messages[i].MessageSerNum);
                RequestToServer.sendRequest('MessageRead',$scope.messages[index].Messages[i].MessageSerNum);
                $scope.messages[index].Messages[i].ReadStatus=1;
            };
        Messages.changeConversationReadStatus($scope.selectedIndex);
        $scope.messages[$scope.selectedIndex].ReadStatus=1;
        }
        $scope.conversation=conversation;
        $scope.glue=true;
      }else{
        if($scope.messages[$scope.selectedIndex].ReadStatus==0){
          for (var i = 0; i < $scope.messages[$scope.selectedIndex].Messages.length; i++) {
            console.log($scope.messages[$scope.selectedIndex].Messages[i].MessageSerNum);
              RequestToServer.sendRequest('MessageRead',$scope.messages[$scope.selectedIndex].Messages[i].MessageSerNum);
              $scope.messages[$scope.selectedIndex].Messages[i].ReadStatus=1;
          };
          Messages.changeConversationReadStatus($scope.selectedIndex);
          $scope.messages[$scope.selectedIndex].ReadStatus=1;
        }
        $scope.conversation=$scope.messages[$scope.selectedIndex].Messages;
        $scope.glue=true;
      }
    }
  });
});

  $scope.person = {};

  $scope.people = [];
  if($scope.messages===undefined){
    $scope.messages=[];
  }
  for(var i=0;i<$scope.messages.length;i++){
    var tmp={};
    tmp.name=$scope.messages[i].MessageRecipient;

    tmp.Role=$scope.messages[i].Role;
    tmp.index=i;
    $scope.people.push(tmp);
  }
  $scope.person.selected='';
  $scope.selectedIndex=0;
  $scope.conversation=$scope.messages[0].Messages;
  $scope.glue=true;
  $scope.messageAttachmentOpener=function(mes){
   var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
  if(app){
     var ref = window.open(mes.Attachment, '_blank', 'location=yes');
   }else{
     window.open(mes.Attachment);
   }
};
$scope.$watch('upload.Document',function(){
  if($scope.upload){
    if(!$scope.upload.Document){
   $timeout(function(){
        $scope.showAttachment=false;
      })
    }else{
       $timeout(function(){
        $scope.showAttachment=true;
      })
    }
}else{
  $timeout(function(){
        $scope.showAttachment=false;
  })
}
});

//Messages in Conversation Logic
$scope.$watchGroup(['newMessage','upload'],function(){
  if($scope.newMessage==''&&$scope.upload==null){
    $scope.sendButtonDisabled=true;
  }else{
    $scope.sendButtonDisabled=false;
  }
});


  $scope.submitMessage=function(){
    $scope.glue=false;
    //Create object to send
    var objectToSend={};
    //Get conversation for details
    var conversation=$scope.messages[$scope.selectedIndex];
    //create object
    objectToSend.ReceiverSerNum=conversation.UserSerNum;
    objectToSend.SenderSerNum=Patient.getUserSerNum();
    objectToSend.SenderRole='Patient';
    objectToSend.ReceiverRole=conversation.Role;
    $scope.messages[$scope.selectedIndex].DateOfLastMessage=new Date();
    Messages.setDateOfLastMessage($scope.selectedIndex, $scope.messages[$scope.selectedIndex].DateOfLastMessage);
    objectToSend.MessageDate=$filter('formatDateToFirebaseString')(new Date());
    objectToSend.MessageContent=$scope.newMessage;
    if($scope.upload){
      objectToSend.Attachment=$scope.upload.Document;
      Messages.addNewMessageToConversation($scope.selectedIndex,$scope.newMessage,new Date(),$scope.upload.Document);
      $scope.upload=null;
    }else{
      Messages.addNewMessageToConversation($scope.selectedIndex,$scope.newMessage,new Date());
    }

    //Send message request
    RequestToServer.sendRequest('Message',objectToSend);
    $scope.newMessage='';
    $scope.glue=true;
    $scope.messages=Messages.getUserMessages();
  }

  $scope.getStyle=function(index){

    if($scope.messages[index].ReadStatus===0){
        return '#3399ff';
    }else{
        return '#ccc';
    }
  };
});
