var myApp=angular.module('MUHCApp');
myApp.service('Documents',['UserPreferences','$cordovaFileTransfer','$cordovaFile', '$cordovaDevice','$cordovaNetwork', 'UserAuthorizationInfo','$q','$rootScope', function(UserPreferences,$cordovaFileTransfer,$cordovaFile,$cordovaDevice,$cordovaNetwork,UserAuthorizationInfo,$q,$rootScope){
	return{
		setDocuments:function(documents, mode){
			this.Photos=[];
			if(mode==='Online'){
				var keysDocuments=Object.keys(documents);
				for (var i = 0; i < keysDocuments.length; i++) {			
					documents[keysDocuments[i]].Content='data:image/png;base64,'+documents[keysDocuments[i]].Content;
					var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1; 
	            	if(app){
	            		
	 
							var platform=$cordovaDevice.getPlatform();
							var targetPath='';
							if(platform==='Android'){
						    	targetPath = cordova.file.dataDirectory+'MUHCApp'+ 'img'+i+".png";
							}else if(platform==='iOS'){
								targetPath = 'Documents/MUHCApp' + 'img'+i+".png";
							}
							var url = documents[keysDocuments[i]].Content;
						    var trustHosts = true
						    var options = {};
						    documents[keysDocuments[i]].NameFileSystem='MUHCAppimg'+i+".png";
						    documents[keysDocuments[i]].PathFileSystem=cordova.file.dataDirectory;
						    $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
						      .then(function(result) {
						      }, function(err) {
						        console.log(err)
						      }, function (progress) {
						          var downloadProgress = (progress.loaded / progress.total) * 100;
						          console.log(downloadProgress);
						    });
						      $cordovaFileTransfer.download(url,'/sdcard/Download/'+'MUHCApp'+ 'img'+i+".png", options, trustHosts)
						      .then(function(result) {

						      }, function(err) {
						        console.log(err)
						      }, function (progress) {
						          var downloadProgress = (progress.loaded / progress.total) * 100;
						          
							    });
					}
					var imageToPhotoObject={};
					imageToPhotoObject.ImageHospitalName_EN=documents[keysDocuments[i]].ImageHospitalName_EN;
					imageToPhotoObject.ImageHospitalName_FR=documents[keysDocuments[i]].ImageHospitalName_FR;
					imageToPhotoObject.ImageHospitalDescription_EN=documents[keysDocuments[i]].ImageHospitalDescription_EN;
					imageToPhotoObject.ImageHospitalDescription_FR=documents[keysDocuments[i]].ImageHospitalDescription_FR;
					imageToPhotoObject.PathFileSystem=documents[keysDocuments[i]].PathFileSystem;
					imageToPhotoObject.NameFileSystem=documents[keysDocuments[i]].NameFileSystem;
					imageToPhotoObject.Content=documents[keysDocuments[i]].Content;
					documents[keysDocuments[i]].Content=null;
                    documents[keysDocuments[i]].ImagePathLocation=null;
					this.Photos.push(imageToPhotoObject);


				};
			}else if(mode==='Offline'){
					console.log('Offline in Documents');
					var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1; 
	            	if(app){
						var dataUserString=window.localStorage.getItem(UserAuthorizationInfo.UserName);
						var dataUserObject=JSON.parse(dataUserString);
						var images=dataUserObject.Images;
						console.log(images);
						var keysImages=Object.keys(images);
						for (var i = 0; i < keysImages.length; i++) {
						 $cordovaFile.readAsDataURL(images[keysImages[i]].PathFileSystem, images[keysImages[i]].NameFileSystem)
							.then(function (success) {
						        // success
						        $rootScope.Content=success;
						        console.log(success);
						    }, function (error) {
						        console.log(error);
						    });
						    images[keysImages[i]].Content=$rootScope.Content;
							this.Photos.push(images[keysImages[i]]);
						};
					}

			}
			console.log(this.Photos);
			
		},
		getPhotos:function(){
			return this.Photos;
		}

	};


}]);