var myApp=angular.module('MUHCApp');
myApp.controller('DocumentsController',['Documents', '$scope', 'UserPreferences',function(Documents,$scope,UserPreferences){
  init();
  function init(){

      $scope.documents=Documents.getDocuments();
      $scope.selectedDocument=$scope.documents[0];
console.log($scope.documents);
if(UserPreferences.getLanguage()=='EN'){
  for(var i=0;i<$scope.documents.length;i++){
    $scope.documents[i].Name=$scope.documents[i].AliasName_EN;
    $scope.documents[i].Description=$scope.documents[i].AliasDescription_EN;
  }

}else{
  for(var i=0;i<$scope.documents.length;i++){
    $scope.documents[i].Name=$scope.documents[i].AliasName_FR;
    $scope.documents[i].Description=$scope.documents[i].AliasDescription_FR;
  }
}
  }

  $scope.goToDocument=function(document)
  {
    $scope.selectedDocument=document;
  }

}]);
