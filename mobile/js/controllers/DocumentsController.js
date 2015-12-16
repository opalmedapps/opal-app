var myApp = angular.module('MUHCApp');
myApp.controller('DocumentsController', ['Patient', 'Documents', 'UpdateUI', '$scope', '$timeout', 'UserPreferences', 'RequestToServer', '$cordovaFile','UserAuthorizationInfo','$q',function(Patient, Documents, UpdateUI, $scope, $timeout, UserPreferences, RequestToServer,$cordovaFile,UserAuthorizationInfo,$q) {
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

myApp.controller('SingleDocumentController', ['Documents', '$timeout', '$scope', '$cordovaEmailComposer','FileManagerService','$sce',function(Documents, $timeout, $scope,$cordovaEmailComposer, FileManagerService,$sce) {
  console.log('Simgle Document Controller');
  var page = myNavigator.getCurrentPage();
  var image = page.options.param;
  if(image.DocumentType=='pdf')
  {
    image.PreviewContent='./img/pdf-icon.png';
  }else{
    image.PreviewContent=image.Content;
  }

  $scope.documentObject=image;
  $scope.shareViaEmail=function()
  {
    var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
    if (app) {
      $cordovaEmailComposer.isAvailable().then(function() {
        var attachment='base64:'+'attachment.'+image.DocumentType+'//'+image.Content.substring(image.Content.indexOf(',')+1,image.Content.length);
        var email = {
          to: '',
          cc: '',
          bcc: [],
          attachments: [
            attachment
          ],
          subject: 'MUHC Document',
          body: '',
          isHtml: true
        };
       $cordovaEmailComposer.open(email).then(null, function () {
         console.log('User canceled emal');
       });
  }, function () {
    console.log('Function is not available');
  });
    } else {
      window.open(image.Content);
    }

  }
  $scope.openDocument = function() {
      var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
      if (app) {
        var ref = cordova.InAppBrowser.open(image.Content, '_blank', 'EnableViewPortScale=yes');
      } else {
        window.open(image.Content);
      }
    }
    /*var gesturableImg = new ImgTouchCanvas({
            canvas: document.getElementById('mycanvas2'),
            path: "./img/D-RC_ODC_16June2015_en_FNL.png"
        });*/
}]);
myApp.service('FileManagerService',function($q){
var file='';
function readDataUrl(file,response) {
  var r=$q.defer();
    var reader = new FileReader();
    var img='';
    reader.onloadend = function(evt) {
        console.log("Read as data URL");
        r.resolve(response(evt.target.result));
    };
   reader.readAsDataURL(file);
   return r.promise;
}
function callback(fileURL)
{
  var r=$q.defer();
  file=fileURL;
  r.resolve(fileURL);
  return r.promise;
}
function gotFile(file){
    var r=$q.defer();
    r.resolve(readDataUrl(file,callback));
    return r.promise;
}
return{
  getFileUrl:function(filePath)
  {

    var r=$q.defer();
    console.log(filePath);
    window.resolveLocalFileSystemURL(filePath, function(fileEntry){
      console.log('Inside getFileUrl');
      fileEntry.file(function(file){
        r.resolve(gotFile(file));
      },function(error)
      {
        r.reject(error);
        console.log(error);
      });
    }, function(error){
      console.log(error);
        r.reject(error.code);
    });
    return r.promise;
  },
  downloadFileIntoStorage:function(url,targetPath)
  {
    var r=$q.defer();
    var fileTransfer = new FileTransfer();
    fileTransfer.download(url, targetPath,
      function(entry) {
        console.log(entry);
        r.resolve(entry);
      },
      function(err) {
        console.log(err);
        r.reject(err);
      });
    }
  };
});
