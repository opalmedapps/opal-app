var myApp=angular.module('MUHCApp');
myApp.service('Documents',['UserPreferences', '$cordovaDevice','$cordovaNetwork', 'UserAuthorizationInfo','$q', '$filter','FileManagerService','RequestToServer','LocalStorage',function(UserPreferences,$cordovaDevice,$cordovaNetwork,UserAuthorizationInfo,$q,$filter,FileManagerService,RequestToServer,LocalStorage){
	//Array documentsArray contains all the documents for the patient
	var documentsArray=[];
	//Check document, if its an update delete it from documentsArray
	function searchDocumentsAndDelete(documents)
	{
		var tmp=[];
		for (var i = 0; i < documents.length; i++) {
			for (var j = 0; j < documentsArray.length; j++) {
				if(documentsArray[j].DocumentSerNum==documents[i].DocumentSerNum)
				{
					documentsArray.splice(j,1);
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
		var user=UserAuthorizationInfo.getUsername();
		var key=user+Documents;

	}
	function addDocumentsToService(documents)
	{
		if(!documents) return;
		for (var i = 0; i < documents.length; i++) {
			documents[i].DateAdded = $filter('formatDate')(documents[i].DateAdded);
			delete documents[i].Content;
			documentsArray.push(documents[i]);
		}
		documentsArray = $filter('orderBy')(documentsArray,'DateAdded');
		LocalStorage.WriteToLocalStorage('Documents',documentsArray);
		return documents;
	}
	return{
		setDocuments:function(documents){
			documentsArray=[];
			return addDocumentsToService(documents);
		},
		updateDocuments:function(documents)
		{
			if(documents) searchDocumentsAndDelete(documents);
			return addDocumentsToService(documents);
		},
		getDocuments:function(){
			return documentsArray;
		},
		getUnreadDocuments:function()
		{
			var array=[];
			for (var i = 0; i < documentsArray.length; i++) {
				if(documentsArray[i].ReadStatus=='0'){
					array.push(documentsArray[i]);
				}
			}
			array=$filter('orderBy')(array,'DateAdded');
			return array;
		},
		//Get number of unread news
		getNumberUnreadDocuments:function()
		{
			var number = 0;
			for (var i = 0; i < documentsArray.length; i++) {
				if(documentsArray[i].ReadStatus == '0')
				{
					number++;
				}
			}
			return number;
		},
		readDocument:function(serNum)
		{
			for (var i = 0; i < documentsArray.length; i++) {
				if(documentsArray[i].DocumentSerNum==serNum){
					documentsArray[i].ReadStatus='1';
					LocalStorage.WriteToLocalStorage('Documents', documentsArray);
					RequestToServer.sendRequest('Read',{'Field':'Documents', Id:serNum});
				}
			}
		},
		getDocumentNames:function(serNum)
		{
			for (var i = 0; i < documentsArray.length; i++) {
				if(documentsArray[i].DocumentSerNum==serNum){
					return {NameEN: documentsArray[i].AliasName_EN, NameFR:documentsArray[i].AliasName_FR};
				}
			}
		},
		getDocumentBySerNum:function(serNum)
		{
			for (var i = 0; i < documentsArray.length; i++) {
				if(documentsArray[i].DocumentSerNum==serNum){
					return documentsArray[i];
				}
			}
		},
		getDocumentUrl:function(serNum)
		{
			return './views/personal/my-chart/individual-document.html';
		},
		downloadDocumentFromServer:function(serNum)
		{
			var r = $q.defer();
			RequestToServer.sendRequestWithResponse('DocumentContent',[serNum]).then(function(response)
			{
				if(response.Code ==='3'&& response.Data!=='DocumentNotFound')
				{
					r.resolve(response.Data);
				}else{
					r.reject(response);
				}
				
			}).catch(function(error)
			{
				r.reject(error);
			});
			return r.promise;
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
		},
		clearDocuments:function()
		{
			documentsArray=[];
		}

	};


}]);
