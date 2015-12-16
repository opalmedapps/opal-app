var myApp = angular.module('MUHCApp');
myApp.controller('DocumentsController', ['Patient', 'Documents', 'UpdateUI', '$scope', '$timeout', 'UserPreferences', 'RequestToServer', function(Patient, Documents, UpdateUI, $scope, $timeout, UserPreferences, RequestToServer) {
  documentsInit();

  function documentsInit() {
    $scope.documents = Documents.getDocuments();
    if($scope.documents.length==0){
      $scope.noDocuments=true;
    }
    if (UserPreferences.getLanguage() == 'EN') {
      for (var i = 0; i < $scope.documents.length; i++) {
        $scope.documents[i].Name = $scope.documents[i].AliasName_EN;
        $scope.documents[i].Description = $scope.documents[i].AliasDescription_EN;
      }
    } else {
      for (var i = 0; i < $scope.documents.length; i++) {
        $scope.documents[i].Name = $scope.documents[i].AliasName_FR;
        $scope.documents[i].Description = $scope.documents[i].AliasDescription_FR;
      }
    }
  }

  function loadDocuments() {
    var UserData = UpdateUI.UpdateSection('Documents');
    UserData.then(function() {
      documentsInit();
    });
  };


  $scope.refreshDocuments = function($done) {
    RequestToServer.sendRequest('Refresh', 'Documents')
    $timeout(function() {
      loadDocuments();
      $done();
    }, 2000);
  };
}]);

myApp.controller('SingleDocumentController', ['Documents', '$timeout', '$scope', function(Documents, $timeout, $scope) {
  console.log('Simgle Document Controller');
  var page = myNavigator.getCurrentPage();
  var image = page.options.param;
  console.log(image);
  $scope.documentObject = image;
  $scope.openDocument = function() {
      var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
      if (app) {
        var ref = window.open(image.Content, '_blank', 'location=yes');
      } else {
        window.open(image.Content);
      }
    }
    /*var gesturableImg = new ImgTouchCanvas({
            canvas: document.getElementById('mycanvas2'),
            path: "./img/D-RC_ODC_16June2015_en_FNL.png"
        });*/
}]);
