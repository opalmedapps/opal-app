var myApp=angular.module('MUHCApp')
/*
*@ngdocs controller
*@name MUHCApp.controller:NotesController
*@requires Notes
*@requires UserPreferences
*@description Sets up the notes for the user.
*/
myApp.controller('NotesController',['Notes','UserPreferences','$scope', '$timeout', function(Notes, UserPreferences,$scope,$timeout){
	initNotes();
	myNavigator.on('postpop',function(){
		$timeout(function(){
			$scope.Notes=Notes.getNotes();
		});

	});
	$scope.doSomething=function(index){
		console.log('adasds'+ index);



	}
	
	/*
	*@ngdocs method
	*@name MUHCApp.NotesController.initNotes
	*@param { } null
	*@description Sets up all the variables for the scope
	*/
	function initNotes(){
		//Retrive notes from service
		$scope.Notes=Notes.getNotes();
		$timeout(function(){
			$scope.Notes=Notes.getNotes();
		})
		
		console.log($scope.Notes);
		//Retrieve Language
	}

	//Go to specific page for note

	/*
	*@ngdocs method
	*@name MUHCApp.NotesController.goToNote
	*@param {note } Object Object that contains the note to pass to the single-note page
	*@description Goes to the individual note
	*/
	$scope.goToNote=function(note){
		myNavigator.pushPage('templates/notes/single-note.html',{param:note});
	}


}]);

myApp.controller('SingleNoteController',['Notes', '$scope', '$timeout', function(Notes,$scope,$timeout){
	initSingleNote();
	
	$scope.deleteNoteAlert=false;
	/*
	*@ngdocs method
	*@name MUHCApp.NotesController.initSingleNote
	*@param { } null
	*@description Sets up all the variables for the scope
	*/
	function initSingleNote(){
		//Get the parameter from the navigator
		var page=myNavigator.getCurrentPage();
		var param=page.options.param;
		console.log(param);
		//Set the note fields
		$scope.Note=param;
		console.log($scope.Note.NoteSerNum);
		
	}

	$scope.deleteNote=function(){
		Notes.deleteNote($scope.Note);
		$scope.deleteNoteAlert=false;
// Called when finishing transition animation
		myNavigator.popPage();
		
	};
}]);

myApp.controller('EditNoteController',['Notes', '$scope','UserPreferences', '$q','UpdateUI','$timeout', function(Notes,$scope,UserPreferences,$q, UpdateUI,$timeout){
	var parameter=myNavigator.getCurrentPage().options.param;
	console.log(parameter);
	if(parameter.Type=='create'){
		$scope.Type='Create';
		$scope.fieldsFilled=false;
		$scope.showWaiting=false;
		$scope.NoteTitle='';
		$scope.NoteContent='';
		$scope.$watchGroup(['NoteTitle','NoteContent'],function(){
			if($scope.NoteTitle==''||$scope.NoteContent==''){
				$scope.fieldsFilled=false;
			}else{
				$scope.fieldsFilled=true;
			}
		});
		
	}else{
		$scope.Type='Edit';
		$scope.note=parameter.Note;
		console.log(parameter.Note);
		$scope.fieldsFilled=true;
		$scope.NoteTitle=$scope.note.Title;
		$scope.NoteContent=$scope.note.Content;
		$scope.$watchGroup(['NoteTitle','NoteContent'],function(){
			if($scope.NoteTitle==''||$scope.NoteContent==''){
				$scope.fieldsFilled=false;
			}else{
				$scope.fieldsFilled=true;
			}
		});

	}

	$scope.editNote=function(){
		if(parameter.Type=='create'){
			$scope.showWaiting=true;
			objectToAdd={};
			objectToAdd.Title=$scope.NoteTitle;
			objectToAdd.Content=$scope.NoteContent;
			objectToAdd.DateAdded=new Date();
			Notes.addNewNote(objectToAdd);
			$timeout(function(){
				UpdateUI.UpdateUserFields().then(function(){
					$scope.showWaiting=false;
					myNavigator.popPage();
				});
			},3000);
			
			$scope.fieldsFilled=true;
			
		}else{
			console.log($scope.note);
			$scope.note.Title=$scope.NoteTitle;
			$scope.note.Content=$scope.NoteContent;
			Notes.editNote($scope.note);
			myNavigator.popPage();
		}
	}
	
	
}]);
