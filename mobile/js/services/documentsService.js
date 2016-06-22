var myApp=angular.module('MUHCApp');
myApp.service('Documents',['UserPreferences', '$cordovaDevice','$cordovaNetwork', 'UserAuthorizationInfo','$q','$rootScope', '$filter','FileManagerService','RequestToServer','LocalStorage',function(UserPreferences,$cordovaDevice,$cordovaNetwork,UserAuthorizationInfo,$q,$rootScope,$filter,FileManagerService,RequestToServer,LocalStorage){
	//Array photos contains all the documents for the patient
	var photos=[];
	var documentsNoFiles=[];
	//Check document, if its an update delete it from photos
	function searchDocumentsAndDelete(documents)
	{
		var tmp=[];
		for (var i = 0; i < documents.length; i++) {
			for (var j = 0; j < photos.length; j++) {
				if(photos[j].DocumentSerNum==documents[i].DocumentSerNum)
				{
					console.log(photos[j]);
					photos.splice(j,1);
					break;
				}
			}
		}
	}
	function copyObject(object)
	{
		var newObject={};
		for (var key in object)
		{
			newObject[key]=object[key];
		}
		return newObject;
	}
	//Checks to see if a documents
	function isDocumentStored(serNum){
		var user=UserAuthorizationInfo.getUserName();
		var key=user+Documents;

	}
	function addDocumentsToService(documents)
	{
		var r=$q.defer();
		$rootScope.unreadDocuments=0;
		if(!documents) return;
			var promises=[];
			console.log(documents);
			console.log(documents.length);
			for (var i = 0; i < documents.length; i++) {
				//Get document type to build base64 string
				if(documents[i].DocumentType=='pdf')
				{
					documents[i].Content='data:application/pdf;base64,'+documents[i].Content;
				}else{
					documents[i].Content='data:image/'+documents[i].DocumentType+';base64,'+documents[i].Content;
				}
				//If app check to save in filesystem.
				var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
				if(app){
						var platform=$cordovaDevice.getPlatform();
						var targetPath='';
						if(platform==='Android'){
								targetPath = cordova.file.externalRootDirectory+'Documents/docMUHC'+documents[i].DocumentSerNum+"."+documents[i].DocumentType;
								documents[i].NameFileSystem='docMUHC'+documents[i].DocumentSerNum+"."+documents[i].DocumentType;
								console.log(documents[i].NameFileSystem);
								documents[i].CDVfilePath=" cdvfile://localhost/sdcard/Documents/"+documents[i].NameFileSystem;
						}else if(platform==='iOS'){
							targetPath = cordova.file.documentsDirectory+ 'Documents/docMUHC'+documents[i].DocumentSerNum+"."+documents[i].DocumentType;
							console.log('IOS', targetPath);
							documents[i].NameFileSystem='docMUHC'+documents[i].DocumentSerNum+"."+documents[i].DocumentType;
							console.log(documents[i].NameFileSystem);
							documents[i].CDVfilePath="cdvfile://localhost/persistent/Documents/"+documents[i].NameFileSystem;
							//no sync, no icloud storage
							//targetPath = cordova.file.dataDirectory+ 'Documents/docMUHC'+documents[keysDocuments[i]].DocumentSerNum+"."+documents[keysDocuments[i]].DocumentType;
						}
						var url = documents[i].Content;
							var trustHosts = true
							var options = {};
							documentsNoFiles.push(documents[i]);
							documents[i].PathFileSystem=targetPath;
							promises.push(FileManagerService.downloadFileIntoStorage(url, targetPath));
				}else{
					//Add to localStorage array
					documentsNoFiles.push(documents[i]);
				}
				var imageToPhotoObject={};
				var url = documents[i].Content;
				imageToPhotoObject=copyObject(documents[i]);
				delete documents[i].Content;
				delete documents[i].PathLocation;
				imageToPhotoObject.Content=url;
				imageToPhotoObject.DateAdded=$filter('formatDate')(imageToPhotoObject.DateAdded);
				console.log('boom');
				photos.push(imageToPhotoObject);
				photos=$filter('orderBy')(photos,'DateAdded',false);
			};
			console.log(photos);
			LocalStorage.WriteToLocalStorage('Documents',documentsNoFiles);
			$q.all(promises).then(function(results){
				console.log(documents);
				r.resolve(documents);
			});
			return r.promise;
	}
	return{
		setDocumentsOnline:function(documents){
			var r=$q.defer();
			photos=[];
			documentsNoFiles=[];
			console.log(documents);
			return addDocumentsToService(documents);
		},
		updateDocuments:function(documents)
		{
			var r=$q.defer();
			console.log(documents);
			searchDocumentsAndDelete(documents);
			return addDocumentsToService(documents);
		},
		setDocumentsOffline:function(documents)
		{
			console.log(documents);
			var r=$q.defer();
			photos=[];
			documentsNoFiles = [];
			if(!documents) return;
			//var promises=[];
			for (var i = 0; i < documents.length; i++) {
				var temp = angular.copy(documents);
				documentsNoFiles.push(temp);
				var imageToPhotoObject={};
				documents[i].DateAdded=$filter('formatDate')(documents[i].DateAdded);
				//promises.push(FileManagerService.getFileUrl(documents[i].PathFileSystem));
				documents[i].Content=documents[i].CDVfilePath;
				photos.push(documents[i]);
			}
			console.log(photos);
			console.log(photos);
			console.log(documents);
			r.resolve(documents);

			/*$q.all(promises).then(function(results){
				console.log(results);
				for (var i = 0; i < results.length; i++) {
					documents[i].Content=results[i];
				}
				r.resolve(documents);
			},function(error){
				console.log(error);
				r.resolve(documents);
			});*/
			 return r.promise;
		},
		getDocuments:function(){
			return photos;
		},
		getUnreadDocuments:function()
		{
			var array=[];
			for (var i = 0; i < photos.length; i++) {
				console.log(photos[i]);
				if(photos[i].ReadStatus=='0'){
					array.push(photos[i]);
				}
			}
			console.log(array);
			array=$filter('orderBy')(array,'DateAdded');
			return array;
		},
		//Get number of unread news
		getNumberUnreadDocuments:function()
		{
			var number = 0;
			for (var i = 0; i < photos.length; i++) {
				if(photos[i].ReadStatus == '0')
				{
					number++;
				}
			}
			return number;
		},
		readDocument:function(serNum)
		{
			for (var i = 0; i < photos.length; i++) {
				if(photos[i].DocumentSerNum==serNum){
					photos[i].ReadStatus='1';
					documentsNoFiles[i].ReadStatus = '1';
					LocalStorage.WriteToLocalStorage('Documents', documentsNoFiles);
					RequestToServer.sendRequest('Read',{'Field':'Documents', Id:serNum});
				}
			}
		},
		getDocumentNames:function(serNum)
		{
			for (var i = 0; i < photos.length; i++) {
				if(photos[i].DocumentSerNum==serNum){
					return {NameEN: photos[i].AliasName_EN, NameFR:photos[i].AliasName_FR};
				}
			};
		},
		getDocumentBySerNum:function(serNum)
		{
			for (var i = 0; i < photos.length; i++) {
				if(photos[i].DocumentSerNum==serNum){
					return photos[i];
				}
			};
		},
		getDocumentUrl:function(serNum)
		{
			return './views/personal/my-chart/individual-document.html';
		},
		//array can be string or array
		setDocumentsLanguage:function(array)
		{
			//Get language
			var language = UserPreferences.getLanguage();

			//Check if array
			if (Object.prototype.toString.call( array ) === '[object Array]') {
				for (var i = 0; i < array.length; i++) {
					//set language
						array[i].Title = (language=='EN')? array[i].AliasName_EN : array[i].AliasName_FR;
						array[i].Description = (language == 'EN')? array[i].AliasDescription_EN : array[i].AliasDescription_FR;
				}
			}else{
				//set language if string
				array.Description = (language == 'EN')? array.AliasDescription_EN : array.AliasDescription_FR;
				array.Title = (language=='EN')? array.AliasName_EN : array.AliasName_FR;
			}
			return array;
		}

	};


}]);
