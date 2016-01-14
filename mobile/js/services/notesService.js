angular.module('MUHCApp')
	.service('Notes',['$filter','RequestToServer','$timeout', function($filter,RequestToServer,$timeout){
		return{
			setNotes:function(notes){
				this.Notes=[];
				if(notes==null||typeof notes=='undefined'){
					return;
				}
				var notesKeys=Object.keys(notes);
				for (var i = 0; i < notesKeys.length; i++) {
					notes[notesKeys[i]].DateAdded=$filter('formatDate')(notes[notesKeys[i]].DateAdded);
					this.Notes.push(notes[notesKeys[i]]);
				};
				this.Notes=$filter('orderBy')(this.Notes,'DateAdded',true);
				console.log(this.Notes);

			},
			getNotes:function(){
				return this.Notes;
			},
			getNoteBySerNum:function(serNum){
				for (var i = 0; i < this.Notes.length; i++) {
					if(this.Notes[i].NoteSerNum==serNum){
						return this.Notes[i];
					}
				};

			},
			addNewNote:function(note){
				this.Notes.push(note);
				this.Notes=$filter('orderBy')(this.Notes,'DateAdded',true);
				objectToBackEnd={};
				objectToBackEnd.Title=note.Title;
				objectToBackEnd.Content=note.Content;
				objectToBackEnd.DateAdded=$filter('formatDateToFirebaseString')(note.DateAdded);
				RequestToServer.sendRequest('NewNote',objectToBackEnd);
				RequestToServer.sendRequest('Refresh');
				console.log(this.Notes);


			},
			editNote:function(newNote){
				console.log(newNote);
				for (var i = 0; i < this.Notes.length; i++) {
					if(this.Notes[i].NoteSerNum==newNote.NoteSerNum){
						this.Notes[i]=newNote;
						objectToBackEnd={};
						objectToBackEnd.Title=newNote.Title;
						objectToBackEnd.Content=newNote.Content;
						objectToBackEnd.NoteSerNum=newNote.NoteSerNum;
						objectToBackEnd.DateAdded=$filter('formatDateToFirebaseString')(newNote.DateAdded);
						RequestToServer.sendRequest('EditNote',objectToBackEnd);
						return;
					}
				};
			},
			deleteNote:function(note){
				var copyNotes=[];
				var j=0;
				for (var i = 0; i < this.Notes.length; i++) {
					if(this.Notes[i].NoteSerNum!=note.NoteSerNum){
						copyNotes[j]=this.Notes[i];
						j++;
					}
				};
				objectToBackEnd={};
				objectToBackEnd.NoteSerNum=note.NoteSerNum;
				RequestToServer.sendRequest('DeleteNote',objectToBackEnd);
				this.Notes=copyNotes;
			}


		};

	}]);