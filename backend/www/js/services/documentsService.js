var myApp=angular.module('MUHCApp');
myApp.service('Documents',['UserPreferences','$cordovaFileTransfer','$cordovaFile', '$cordovaDevice','$cordovaNetwork', 'UserAuthorizationInfo','$q','$rootScope', '$filter',function(UserPreferences,$cordovaFileTransfer,$cordovaFile,$cordovaDevice,$cordovaNetwork,UserAuthorizationInfo,$q,$rootScope,$filter){
	return{
		setDocuments:function(documents, mode){
			console.log(documents);
			this.Photos=[];
			if(!documents) return;
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
					imageToPhotoObject.AliasName_EN=documents[keysDocuments[i]].AliasName_EN;
					imageToPhotoObject.AliasName_FR=documents[keysDocuments[i]].AliasName_FR;
					imageToPhotoObject.DateAdded=$filter('formatDate')(documents[keysDocuments[i]].DateAdded);
					imageToPhotoObject.AliasDescription_EN=documents[keysDocuments[i]].AliasDescription_EN;
					imageToPhotoObject.AliasDescription_FR=documents[keysDocuments[i]].AliasDescription_FR;
					imageToPhotoObject.DocumentSerNum=documents[keysDocuments[i]].DocumentSerNum;
					imageToPhotoObject.PathFileSystem=documents[keysDocuments[i]].PathFileSystem;
					imageToPhotoObject.NameFileSystem=documents[keysDocuments[i]].NameFileSystem;
					imageToPhotoObject.Content=documents[keysDocuments[i]].Content;
					documents[keysDocuments[i]].Content=null;
          documents[keysDocuments[i]].PathLocation=null;
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
		getDocuments:function(){
			return this.Photos;
		},
		getDocumentBySerNum:function(serNum)
		{
			for (var i = 0; i < this.Photos.length; i++) {
				if(this.Photos[i].DocumentSerNum==serNum){
					return this.Photos[i];
				}
			};
		}

	};


}]);
