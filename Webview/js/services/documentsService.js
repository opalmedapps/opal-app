var myApp=angular.module('MUHCApp');
myApp.service('Documents',['UserPreferences', 'UserAuthorizationInfo','$q','$rootScope', '$filter',function(UserPreferences,UserAuthorizationInfo,$q,$rootScope,$filter){
	return{
		setDocuments:function(documents, mode){
			console.log(documents);
			this.Photos=[];
			if(!documents) return;
			if(mode==='Online'){
				var keysDocuments=Object.keys(documents);
				for (var i = 0; i < keysDocuments.length; i++) {
					documents[keysDocuments[i]].Content='data:image/png;base64,'+documents[keysDocuments[i]].Content;
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
