var myApp=angular.module('MUHCApp');

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
      fileEntry.file(function(file){
        r.resolve(gotFile(file));
      },function(error)
      {
        r.reject(error);
      });
    }, function(error){
     console.log('about to resolve this files errors');
        r.reject(error.code);
    });
    return r.promise;
  }

};


});
