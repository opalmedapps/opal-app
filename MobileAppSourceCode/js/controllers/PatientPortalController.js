
/**
*
*
**/
var myApp=angular.module('MUHCApp');
myApp.controller('PatientPortalController',function(UpdateUI, RequestToServer, $filter, $rootScope, UserAuthorizationInfo,$location,$anchorScroll,$timeout,$scope,Messages, Patient,$rootScope){
 $rootScope.NumberOfNewMessages='';
 function loadInfo(){
           var dataVal= UpdateUI.UpdateUserFields();
           dataVal.then(function(data){
                $timeout(function(){
                  $scope.messages=Messages.getUserMessages();
                  $scope.conversation=$scope.messages[$scope.selectedIndex].Messages;
                  $rootScope.NumberOfNewMessages='';       
                });
}, function(error){console.log(error);});

        };
         $scope.load = function($done) {
          RequestToServer.sendRequest('Refresh');
          $timeout(function() {
            loadInfo();
                $done();        
          }, 3000);
};

 $scope.messages=Messages.getUserMessages();
 
$scope.personClicked=function(index){
    var conversation=$scope.messages[index].Messages;
    $timeout(function(){
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
            console.log($scope.messages[index].Messages[i].MessageSerNum);
              RequestToServer.sendRequest('MessageRead',$scope.messages[index].Messages[i].MessageSerNum);
              $scope.messages[index].Messages[i].ReadStatus=1;         
          };
          Messages.changeConversationReadStatus($scope.selectedIndex);
          $scope.messages[$scope.selectedIndex].ReadStatus=1;
        }
        $scope.conversation=$scope.messages[$scope.selectedIndex];
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
  $timeout(function(){
      $scope.person.selected='';
      $scope.messages[0];
      $scope.selectedIndex=0;
      $scope.conversation=$scope.messages[0].Messages;
      $scope.glue=true;
  });
  $scope.submitMessage=function(){
    //Create object to send
    var objectToSend={};
    //Get conversation for details
    var conversation=$scope.messages[$scope.selectedIndex];
    //create object
    objectToSend.ReceiverSerNum=conversation.UserSerNum;
    objectToSend.SenderSerNum=Patient.getUserSerNum();
    objectToSend.SenderRole='Patient';
    objectToSend.ReceiverRole=conversation.Role;
    objectToSend.MessageDate=$filter('formatDateToFirebaseString')(new Date());
    objectToSend.MessageContent=$scope.newMessage;
    //Add message to conversation
    Messages.addNewMessageToConversation($scope.selectedIndex,$scope.newMessage,new Date());
    //Send message request
    RequestToServer.sendRequest('Message',objectToSend);
    $scope.newMessage=''; 
  }

  $scope.getStyle=function(index){
    
    if($scope.messages[index].ReadStatus===0){
        return '#3399ff';
    }else{
        return '#ccc';
    }
  };
});
myApp.controller('ListOfConversationMobileController',['RequestToServer','UpdateUI', '$rootScope', 'UserAuthorizationInfo','$location','$anchorScroll','$timeout','$scope','Messages',
  function(RequestToServer, UpdateUI, $rootScope, UserAuthorizationInfo,$location,$anchorScroll,$timeout,$scope,Messages){
     
     $scope.$watch('person.selected', function(){
        if($scope.person.selected!==undefined){
          $timeout(function(){
            var index=$scope.person.selected.index;
            $scope.person.selected=undefined;
            if($scope.messages[index].ReadStatus==0){
            for (var i = 0; i < $scope.messages[index].Messages.length; i++) {
                RequestToServer.sendRequest('MessageRead',$scope.messages[index].Messages[i].MessageSerNum);
                $scope.messages[index].Messages[i].ReadStatus=1;
            };
          }
            $scope.messages[$scope.selectedIndex].ReadStatus=1;
            Messages.changeConversationReadStatus($scope.selectedIndex);
            Messages.changeConversationReadStatus($scope.selectedIndex);
            myNavigatorMessages.pushPage("pageMessage.html", { param: index }, {animation:'slide'});
          })
        }
    });

     $scope.messages=Messages.getUserMessages();    
     $scope.person = {};
     $scope.people = [];
     if(!$scope.messages){
      $scope.messages=[];
     }
      for(var i=0;i<$scope.messages.length;i++){
        var tmp={};
        tmp.name=$scope.messages[i].MessageRecipient;
        tmp.Role=$scope.messages[i].Role;
        tmp.index=i;
        $scope.people.push(tmp);
        if(i===$scope.messages.length-1){
          $scope.initialized=true;
        }
      }


        $scope.personClicked=function(index){
          $scope.person.selected=undefined;
          if($scope.messages[index].ReadStatus==0){
            for (var i = 0; i < $scope.messages[index].Messages.length; i++) {
                console.log($scope.messages[index].Messages[i]);
                RequestToServer.sendRequest('MessageRead',$scope.messages[index].Messages[i].MessageSerNum);
                $scope.messages[index].Messages[i].ReadStatus=1;
            };
          }
          $scope.messages[index].ReadStatus=1;
          Messages.changeConversationReadStatus($scope.selectedIndex);
          Messages.changeConversationReadStatus($scope.selectedIndex);
          myNavigatorMessages.pushPage("pageMessage.html", { param: index }, {animation:'slide'});
        };
    



  }]);


myApp.controller('MessagePageController',function(RequestToServer,$filter, Patient,Messages,UpdateUI,$timeout,$scope){
//Loading Functionality
 function loadInfo(){
           var dataVal= UpdateUI.UpdateUserFields();
           dataVal.then(function(data){
                $timeout(function(){
                  $scope.messages=Messages.getUserMessages();
                  $scope.conversation=$scope.messages[$scope.selectedIndex].Messages;
                });
}, function(error){console.log(error);});

        };


         $scope.load2 = function($done) {
           RequestToServer.sendRequest('Refresh');
          $timeout(function() {
            loadInfo();
                $done();
                
          }, 3000);
};
 $scope.getStyle=function(index){
    
    if($scope.messages[index].ReadStatus===0){
        return '#3399ff';
    }else{
        return '#ccc';
    }
  };
 
//Obtaining Index of current message
 var page = myNavigatorMessages.getCurrentPage();
 var parameters=page.options.param;
//Setting the scroll to last message, and initializing the conversation parameters
 $scope.glue=false;
 $scope.selectedIndex=parameters;
 $scope.messages=Messages.getUserMessages();
 $scope.conversation=$scope.messages[$scope.selectedIndex].Messages;
 $scope.glue=true;

//Individual sent message function, saves message via service to firebase and to user's object
 $scope.submitMessage=function(){
   //Create object to send
    var objectToSend={};
    //Get conversation for details
    var conversation=$scope.messages[$scope.selectedIndex];
    //create object
    objectToSend.ReceiverSerNum=conversation.UserSerNum;
    objectToSend.SenderSerNum=Patient.getUserSerNum();
    objectToSend.SenderRole='Patient';
    objectToSend.ReceiverRole=conversation.Role;
    objectToSend.MessageDate=$filter('formatDateToFirebaseString')(new Date());
    objectToSend.MessageContent=$scope.newMessageMobile;
    //Add message to conversation
    Messages.addNewMessageToConversation($scope.selectedIndex,$scope.newMessageMobile,new Date());
    //Send message request
    RequestToServer.sendRequest('Message',objectToSend);
    $scope.newMessageMobile=''; 
    
}
});





