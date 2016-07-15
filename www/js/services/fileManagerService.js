var myApp=angular.module('MUHCApp');

myApp.service('FileManagerService',function($q, $cordovaFileOpener2,$filter ){
  var file='';
  var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
  function isPDFDocument(url)
  {
    	var index = url.lastIndexOf('.');
      var substring = url.substring(index+1,url.length);
      console.log(substring);
      return (substring=='pdf')?true:false;
  }
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
return {
  getFileType:function(url)
  {
    var index = url.lastIndexOf('.');
    var substring = url.substring(index+1,url.length);
    return substring;
  },
  isPDFDocument:function(url)
  {
    return isPDFDocument(url);
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
  },
  shareDocument:function(name, url)
  {
    //Check if its an app
    if (app) {
      
      //Set the subject for the document
      var options = {subject: name};
      //Determine if its a document, if it is, allow printing
      if(isPDFDocument(url))
      {
        options.files = [url];
      }else{
        options.url = url;
      }
      var onSuccess = function(result) {
      console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
      console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
      }
      var onError = function(msg) {
      console.log("Sharing failed with message: " + msg);
        }
      window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
		} else {
			ons.notification.alert({ message: $filter('translate')('AVAILABLEDEVICES')});
		}


  },
  getFileUrl:function(filePath)
  {
    var r=$q.defer();
    console.log(filePath);
    window.resolveLocalFileSystemURL(filePath, function(fileEntry){
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
            }, function(error){ons.notification.alert({ message:$filter('traslate')('UNABLETOOPEN') });});;
          }else{
            var ref = cordova.InAppBrowser.open(url, '_blank', 'EnableViewPortScale=yes');
          }
      } else {
        window.open(url);
      }
    },
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