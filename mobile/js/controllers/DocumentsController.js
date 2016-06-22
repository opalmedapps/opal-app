var myApp = angular.module('MUHCApp');
myApp.controller('DocumentsController', ['Patient', 'Documents', 'UpdateUI', '$scope', '$timeout', 'UserPreferences', 'RequestToServer', '$cordovaFile','UserAuthorizationInfo','$q','$filter','NavigatorParameters',function(Patient, Documents, UpdateUI, $scope, $timeout, UserPreferences, RequestToServer,$cordovaFile,UserAuthorizationInfo,$q,$filter,NavigatorParameters){
  
  documentsInit();
  
  //Initialize documents, determine if there are documents, set language, determine if content has preview
  function documentsInit() {
    $scope.documents = Documents.getDocuments();
    $scope.documents = Documents.setDocumentsLanguage($scope.documents);
    if($scope.documents.length === 0) $scope.noDocuments=true;
      for (var i = 0; i < $scope.documents.length; i++) {
        if($scope.documents[i].DocumentType=='pdf')
        {
          $scope.documents[i].PreviewContent = './img/pdf-icon.png';
        }else{
          $scope.documents[i].PreviewContent=$scope.documents[i].Content;
        }
    }
  }
  //Go to document function, if not read, read it, then set parameters for navigation
  $scope.goToDocument=function(doc)
  {
    if(doc.ReadStatus == '0')
    {
      doc.ReadStatus ='1';
      Documents.readDocument(doc.DocumentSerNum);
    }
    NavigatorParameters.setParameters({'navigatorName':'personalNavigator', 'Post':doc});
    personalNavigator.pushPage('./views/personal/my-chart/individual-document.html');
  };
  //Function for document refresh, deprecated at the moment. Only refresh at home.
  $scope.refreshDocuments = function($done) {
    RequestToServer.sendRequest('Refresh', 'Documents');
    var UserData = UpdateUI.update('Documents');
    UserData.then(function(){
      documentsInit();
      $done();
    });
    $timeout(function() {
      $done();
    }, 5000);
  };
}]);

/**
 * @name SingleDocumentController
 * @description Responsible for displaying, sharing and printing document
 */
myApp.controller('SingleDocumentController', ['NavigatorParameters','Documents', '$timeout', '$scope', '$cordovaEmailComposer','$cordovaFileOpener2','FileManagerService','Patient','NativeNotification','$filter',function(NavigatorParameters, Documents, $timeout, $scope,$cordovaEmailComposer,$cordovaFileOpener2, FileManagerService,Patient,NativeNotification,$filter) {
  
  //Obtain navigator parameters.
  var parameters = NavigatorParameters.getParameters();
  var image = Documents.setDocumentsLanguage(parameters.Post);
  
  //Determine if its a pdf or an image for small window preview.
  if(image.DocumentType=='pdf')
  {
    image.PreviewContent='./img/pdf-icon.png';
  }else{
    image.PreviewContent=image.Content;
  }
  console.log(image);
  
  //Set the documentObject
  $scope.documentObject=image;
  
  //Share via email function, detemines if its an app, sets the parameters for the email and formats depending on whether is a
  //base64 string or a simple attachment and depending on whether is an Android device or an iOS device
  $scope.shareViaEmail=function()
  {
    var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
    if (app) {

          var attachment='';
          var email = {
            to: '',
            cc: '',
            bcc: [],
            subject: 'MUHC Document',
            body: '',
            isHtml: true
          };
          var base64=image.Content.indexOf('cdvfile');
          var data='';
          if(base64==-1)
          {
            console.log('Base64 file');
            attachment='base64:'+'attachment.'+image.DocumentType+'//'+image.Content.substring(image.Content.indexOf(',')+1,image.Content.length);
            console.log(attachment);
            email.attachments=[attachment];
            console.log(email);
            cordova.plugins.email.isAvailable(function(isAvailable){
                    console.log('is available');
              if(isAvailable)
              {
                cordova.plugins.email.open(email,function(sent){
                  console.log('email ' + (sent ? 'sent' : 'cancelled'));
                },this);
              }else{
                console.log('is not available');
              }
            });
          }else{
            console.log('cdvfile',image.Content );
            var attachmentFilePath = (ons.platform.isAndroid())?image.PathFileSystem:image.Content;
            window.resolveLocalFileSystemURL(attachmentFilePath,function(file){
              console.log(file);
              attachment=file.toURL();
              email.attachments=[attachment];
              console.log(email);
              cordova.plugins.email.isAvailable(function(isAvailable){
                if(isAvailable)
                {
                  cordova.plugins.email.open(email,function(sent){
                    console.log('email ' + (sent ? 'sent' : 'cancelled'));
                  },this);

                }else{
                  console.log('is not available');
                }
              });
            },function(error){
              console.log(error);
            });
          }
          //var attachment='base64:'+'attachment.'+image.DocumentType+'//'+image.Content.substring(image.Content.indexOf(',')+1,image.Content.length);
    } else {
      window.open(image.Content);
    }
  };

  //Print document function, if its an image it puts it into an html tag and prints that html, if its a pdf, it simple prints the pdf
  $scope.printDocument=function()
  {
    var options = {
  			// type of content, use either 'Data' or 'File'
      title: 'Print Document', 	// title of document
      dialogX: -1,				// if a dialog coord is not set, it defaults to -1.
      dialogY: -1,
      success: function(arg){
        console.log(arg);
      },
      error: function(err){
        console.log(err);
      }
    };
    if(ons.platform.isAndroid())
    {
      if(image.DocumentType=='pdf')
      {
        options.type='File';
        options.data = image.CDVfilePath;
        console.log(options);
        window.plugins.PrintPDF.print(options);
      }else{
        FileManagerService.getFileUrl(image.PathFileSystem).then(function(file){
            var page = "<img src='"+file+"' style='width:100%;height:auto'>";
            page.replace(/"/g, '\'');
            console.log(page);
            cordova.plugins.printer.print(page, 'Document.html', function () {
                //alert('Printing finished or canceled');
            });
          }
        );
      }
    }else{
        options.type='File';
        options.data = image.CDVfilePath;
        console.log(options);
        window.plugins.PrintPDF.print(options);
    }
  };
  console.log(FileManagerService);
  
  //Open document function: Opens document depending on the format
  $scope.openDocument = function() {
      var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
      if (app) {
        if(ons.platform.isAndroid()){
          //window.open('https://docs.google.com/viewer?url='+image.Content+'&embedded=true', '_blank', 'location=yes');
          if(image.DocumentType=='pdf')
          {
            console.log(image.PathFileSystem);
            $cordovaFileOpener2.open(
                image.PathFileSystem,
                'application/pdf'
              ).then(function() {
                  // file opened successfully
              }, function(err) {
                console.log(err);
                if(err.status == 9)
                {
                  NativeNotification.showNotificationAlert($filter('translate')("NOPDFPROBLEM"));
                }
                console.log('boom');
                  // An error occurred. Show a message to the user
            });
          }else{
            var ref = cordova.InAppBrowser.open(image.PathFileSystem, '_blank', 'EnableViewPortScale=yes');
          }

          //var ref = cordova.InAppBrowser.open(image.Content, '_system', 'location=yes');
        }else{
            var ref = cordova.InAppBrowser.open(image.Content, '_blank', 'EnableViewPortScale=yes');
        }
      } else {
        window.open(image.Content);
      }
    };
    /*var gesturableImg = new ImgTouchCanvas({
            canvas: document.getElementById('mycanvas2'),
            path: "./img/D-RC_ODC_16June2015_en_FNL.png"
        });*/
}]);
