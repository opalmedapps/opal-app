var myApp=angular.module('MUHCApp');
myApp.service('Documents',['UserPreferences', '$cordovaDevice','$cordovaNetwork', 'UserAuthorizationInfo','$q','$rootScope', '$filter','FileManagerService',function(UserPreferences,$cordovaDevice,$cordovaNetwork,UserAuthorizationInfo,$q,$rootScope,$filter,FileManagerService){
	var photos=[];
	function isDocumentStored(serNum){
		var user=UserAuthorizationInfo.getUserName();
		var key=user+Documents;

	}
	return{
		setDocumentsOnline:function(documents, mode){
			var r=$q.defer();
			photos=[];
			console.log(documents);
			this.Photos=[];
			if(!documents) return;
				var keysDocuments=Object.keys(documents);
				var promises=[];
				for (var i = 0; i < keysDocuments.length; i++) {
					if(documents[keysDocuments[i]].DocumentType=='pdf')
					{
						documents[keysDocuments[i]].Content='data:application/pdf;base64,'+documents[keysDocuments[i]].Content;
					}else{
						documents[keysDocuments[i]].Content='data:image/'+documents[keysDocuments[i]].DocumentType+';base64,'+documents[keysDocuments[i]].Content;
					}
					var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
	        if(app){
							var platform=$cordovaDevice.getPlatform();
							var targetPath='';
							if(platform==='Android'){
						    	targetPath = cordova.file.externalRootDirectory+'Documents/docMUHC'+documents[keysDocuments[i]].DocumentSerNum+"."+documents[keysDocuments[i]].DocumentType;
							}else if(platform==='iOS'){
								targetPath = cordova.file.documentsDirectory+ 'Documents/docMUHC'+documents[keysDocuments[i]].DocumentSerNum+"."+documents[keysDocuments[i]].DocumentType;
							}
							var url = documents[keysDocuments[i]].Content;
						    var trustHosts = true
						    var options = {};
						    documents[keysDocuments[i]].NameFileSystem='docMUHC'+documents[keysDocuments[i]].DocumentSerNum+"."+documents[keysDocuments[i]].DocumentType;
						    documents[keysDocuments[i]].PathFileSystem=targetPath;
								promises.push(FileManagerService.downloadFileIntoStorage(url, targetPath));
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
					imageToPhotoObject.DocumentType=documents[keysDocuments[i]].DocumentType;
					imageToPhotoObject.Content=documents[keysDocuments[i]].Content;
					delete documents[keysDocuments[i]].Content;
          delete documents[keysDocuments[i]].PathLocation;
					photos.push(imageToPhotoObject);
					this.Photos.push(imageToPhotoObject);
				};
				$q.all(promises).then(function(results){
					console.log(documents);
					r.resolve(documents);
				});
				return r.promise;
			console.log(this.Photos);

		},
		setDocumentsOffline:function(documents)
		{
			var r=$q.defer();
			this.Photos=[];
			photos=[];
			if(!documents) return;
			var keysDocuments=Object.keys(documents);
			var promises=[];
			for (var i = 0; i < keysDocuments.length; i++) {
				var imageToPhotoObject={};
				documents[keysDocuments[i]].DateAdded=$filter('formatDate')(documents[keysDocuments[i]].DateAdded);
				promises.push(FileManagerService.getFileUrl(documents[keysDocuments[i]].PathFileSystem));
				photos.push(documents[keysDocuments[i]]);
				this.Photos.push(imageToPhotoObject);
			}
			console.log(documents);
			$q.all(promises).then(function(results){
				console.log(results);
				for (var i = 0; i < results.length; i++) {
					documents[i].Content=results[i];
				}
				r.resolve(documents);
			},function(error){
				console.log(error);
				r.resolve(documents);
			});
			this.Photos=photos;
			 return r.promise;
		},
		getDocuments:function(){
			return photos;
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
