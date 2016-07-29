var myApp=angular.module('MUHCApp');

myApp.service('FileManagerService',function($q, $cordovaFileOpener2,$filter ){
  var file='';
  var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;

  //Obtaining device paths for documents
  var urlDeviceDocuments = '';
  var urlCDVPathDocuments = '';
  if(app)
  {
    if(ons.platform.isAndroid())
    {
      urlDeviceDocuments = cordova.file.externalRootDirectory+'/Documents/';
      urlCDVPathDocuments = "cdvfile://localhost/sdcard/Documents/";
    }else{
      urlDeviceDocuments = cordova.file.documentsDirectory+'/Documents/';
      urlCDVPathDocuments = "cdvfile://localhost/persistent/Documents/";
    } 
    console.log(urlDeviceDocuments, urlDeviceDocuments);
  } 
  //Tell me whether a url is a pdf link
  function isPDFDocument(url)
  {
    	var index = url.lastIndexOf('.');
      var substring = url.substring(index+1,url.length);
      console.log(substring);
      return (substring=='pdf')?true:false;
  }

  //Reads data from file an return base64 representation
  function readDataAsUrl(file)
  {
    var r=$q.defer();
      var reader = new FileReader();
      var img='';
      reader.onloadend = function(evt) {
          console.log("Read as data URL");
          r.resolve(evt.target.result);
      };
    reader.readAsDataURL(file);
    return r.promise;
  }
 
return {
  //Obtains file type
  getFileType:function(url)
  {
    var index = url.lastIndexOf('.');
    var substring = url.substring(index+1,url.length);
    return substring;
  },
  //Public function to determine whether a link is a url
  isPDFDocument:function(url)
  {
    return isPDFDocument(url);
  },
  //Downloads a document into the device storage
  downloadFileIntoStorage:function(url,targetPath)
  {
    var r=$q.defer();
    var fileTransfer = new FileTransfer();
    window.resolveLocalFileSystemURL(targetPath,function(fileEntry)
    {
      console.log(fileEntry);
      r.resolve(true);
    },function()
    {
      fileTransfer.download(url, targetPath,
      function(entry) {
        console.log(entry);
        r.resolve(entry);
      },
      function(err) {
        console.log(err);
        r.reject(err);
      });
    });
    return r.promise;
    
  },
  //Shares a url using the social sharing options
  shareDocument:function(name, url)
  {
    //Check if its an app
    if (app) {
      
      //Set the subject for the document
      var options = {subject: name};
      //Determine if its a document, if it is, download document and print otherwise, simple sahre the url link
      // if(isPDFDocument(url))
      // {
      //   options.files = [url];
      // }else{
      //   options.url = url;
      // }
      options.url = url;
      var onSuccess = function(result) {
      console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
      console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
      };
      var onError = function(msg) {
      console.log("Sharing failed with message: " + msg);
        };
      window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
		} else {
			ons.notification.alert({ message: $filter('translate')('AVAILABLEDEVICES')});
		}


  },
  //Gets the base64 representation of a file in the cordova file storage
  getFileUrl:function(filePath)
  {
    var r=$q.defer();
    console.log(filePath);
    window.resolveLocalFileSystemURL(filePath, function(fileEntry){
      fileEntry.file(function(file){
        r.resolve(readDataAsUrl(file));
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
  //Opens a pdf depending on the device or browser
    openPDF:function(url)
    {
      console.log(url);
      var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
      if (app) {
        if(ons.platform.isAndroid()){
            window.cordova.plugins.FileOpener.canOpenFile(url, function(data){
                console.log('extension: ' + data.extension + '\n' +'canBeOpen: ' + data.canBeOpen);
                if(data.canBeOpen)
                {
                  window.cordova.plugins.FileOpener.openFile(url, function(data){
                    console.log(data.message);
                  }, function(data){
                    console.log(data);
                      ons.notification.alert({ message:$filter('traslate')('UNABLETOOPEN') });
                  });
                }else{
                  	ons.notification.alert({ message:$filter('traslate')('UNABLETOOPEN') });
                }
            }, function(error){ons.notification.alert({ message:$filter('traslate')('UNABLETOOPEN') });});
          }else{
            var ref = cordova.InAppBrowser.open(url, '_blank', 'EnableViewPortScale=yes');
          }
      } else {
        window.open(url);
      }
    },
    //Gets document file storage url
    getDocumentUrls:function(document)
    {
      var documentName = 'docMUHC'+document.DocumentSerNum+"."+document.DocumentType;
      var urlCDV = urlCDVPathDocuments+documentName;
      var urlPathFile = urlDeviceDocuments+documentName;
      return {cdvUrl:urlCDV,urlPathFile:urlPathFile};
    },
    //Gets the absolute path for file storage
    getFilePathForDocument:function(document)
    {
      var documentName = 'docMUHC'+document.DocumentSerNum+"."+document.DocumentType;
      return urlDeviceDocuments+documentName;
    },
    //Gets the CDVFile representation for the document
    getCDVFilePathForDocument:function(document)
    {
      var documentName = 'docMUHC'+document.DocumentSerNum+"."+document.DocumentType;
      return urlCDVPathDocuments+documentName;
    },
    //Gets an incomplete base64 string and adds the specific string to it
    setBase64Document:function(document)
    {
      if(document.DocumentType=='pdf')
      {
        document.Content='data:application/pdf;base64,'+document.Content;
      }else{
        document.Content='data:image/'+document.DocumentType+';base64,'+document.Content;
      }
      return document;
    },
    //Determines whether a document has been saved the device
    findDocumentInDevice:function(type, documentSerNum)
    {
      var r = $q.defer();
      var documentName = 'docMUHC'+documentSerNum+"."+type;
      var urlCDV = urlCDVPathDocuments+documentName;
      var urlPathFile = urlDeviceDocuments+documentName;
      window.resolveLocalFileSystemURL(urlCDV,function(fileEntry)
      {
        r.resolve({cdvUrl:urlCDV,urlPathFile:urlPathFile});
      },function(error){
        r.reject(error);
      });
      return r.promise;
    },
    //Opens the url for a document
    openUrl:function(url)
    {
      var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
      if (app) {
        var ref = cordova.InAppBrowser.open(url, '_blank', 'EnableViewPortScale=yes');
      } else {
        window.open(url);
      }
    }
  };
});