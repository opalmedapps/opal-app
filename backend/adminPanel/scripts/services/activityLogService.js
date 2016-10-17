var app=angular.module('adminPanelApp');

app.service('ActivityLogService',['api','URLs','$q','$filter',function(api, URLs,$q,$filter){
	var activityLogObject={};
	var activityLogArray=[];
	var tableMH = {'MessagesMH':true, 'Feedback':false,'AppointmentMH':true,'PatientMH':true, 'UsersMH':true};
	
	var tablePrimaryIndexMappings={'MessagesMH':['MessageSerNum','MessageRevSerNum'],'Feedback':['FeedbackSerNum'],	'DocumentMH':['DocumentSerNum', 'DocumentRevSerNum'],
	'AppointmentMH':['AppointmentSerNum','AppointmentRevSerNum'],'PatientMH':['PatientSerNum','PatientRevSerNum'],'UsersMH':['UserSerNum', 'UserRevSerNum']};
	var tableOfUpdatesSession=[];
	var tableOfInsertsSession=[];
	

	//Determines whether t
	function setDeviceLabel(deviceId)
	{
		var upperCaseDevice = deviceId;
		if(deviceId == 'browser') return 'browser';

		if(deviceId.toUpperCase() == deviceId)
		{
			return 'IPhone/'+deviceId;
		}else{
			return 'Android/'+deviceId;
		}
	}
	function getChangeValues(table, row1,row2)
	{
								//code for update!
		
		var arrayChanges=[];
		var time=row2.LastUpdated;						
		for (var key in row1) {
			
			if(row1[key]!==row2[key]&&key!==tablePrimaryIndexMappings[table][1]&&key!=='LastUpdated'&&key!=='SessionId')
			{
				var objectChange={};
				objectChange['field']=key;
				objectChange['table']=table;
				objectChange['time']=new Date(time);
				objectChange['oldValue']=row1[key];
				objectChange['newValue']=row2[key];
				arrayChanges.push(objectChange);
			}
		};
		return arrayChanges;
	}
	return{
		getPatientActivityLogFromServer:function(filter)
		{	
			var r=$q.defer();
			var param={};
			if(typeof filter !=='undefined') param=filter;
			api.getFieldFromServer(URLs.getPatientActivityUrl(),param).then(function(result){
				console.log(result);
				r.resolve(result);
			});
			return r.promise;
		},
		setPatientActivityLogTable:function(log,type)
		{
			activityLogArray=[];
			activityLogObject={};
			for (var i = log.length - 1; i >= 0; i--) {
				log[i].DateTime=new Date(log[i].DateTime);
				if(typeof activityLogObject[log[i].SessionId]==='undefined')
				{
					activityLogObject[log[i].SessionId]=[];
					activityLogObject[log[i].SessionId].push(log[i]);
				}else{
					activityLogObject[log[i].SessionId].push(log[i]);
				}
				
			};
			for(var key in activityLogObject)
			{
				activityLogObject[key]=$filter('orderBy')(activityLogObject[key],'DateTime',false);
				var objectToLogArray={};
				for (var i = 0; i < activityLogObject[key].length; i++) {
					if(i==0)
					{
						objectToLogArray.Email=activityLogObject[key][i].Email;
						objectToLogArray.SSN=activityLogObject[key][i].SSN;
						objectToLogArray.PatientAriaSer=activityLogObject[key][i].PatientAriaSer;
						objectToLogArray.FirstName=activityLogObject[key][i].FirstName;
						objectToLogArray.LastName=activityLogObject[key][i].LastName;
						objectToLogArray.PatientId=activityLogObject[key][i].PatientId;
						objectToLogArray.SessionId=activityLogObject[key][i].SessionId;

						objectToLogArray.DeviceId=setDeviceLabel(activityLogObject[key][i].DeviceId);


					}
					if(activityLogObject[key][i].Request=='Login')
					{	
						objectToLogArray.LoginTime=activityLogObject[key][i].DateTime;
					}else if(activityLogObject[key][i].Request=='Logout')
					{
						objectToLogArray.LogoutTime=activityLogObject[key][i].DateTime;
					}
				}
				activityLogArray.push(objectToLogArray);

			}



			
			

		},
		getPatientSessionActivityFromServer:function(sessionId)
		{
			var r=$q.defer();
			var objectToSend={};
			objectToSend.SessionId=sessionId;
			api.getFieldFromServer(URLs.getPatientSessionActivityUrl(),objectToSend).then(function(result){
				console.log(result);
				r.resolve(result);
			});
			return r.promise;
		},
		setPatientSessionObject:function(sessionObject)
		{	
			tableOfUpdatesSession=[];
			tableOfInsertsSession=[];
			for (var key in sessionObject){
				sessionObject[key]=$filter('orderBy')(sessionObject[key],tablePrimaryIndexMappings[key], false);
				for (var i = 0;i<sessionObject[key].length;i++) {
					if(tableMH[key])
					{
						var flag=false;
						var serNum=tablePrimaryIndexMappings[key][0];
						var revCount=tablePrimaryIndexMappings[key][1];
						if(sessionObject[key][i][revCount]=='1')
						{
							sessionObject[key][i].LastUpdated=new Date(sessionObject[key][i].LastUpdated);
							tableOfInsertsSession.push(sessionObject[key][i]);	
						}
						if(i<sessionObject[key].length-1&&sessionObject[key][i][serNum]==sessionObject[key][i+1][serNum])
						{
							//On update
							var arrayChanges=getChangeValues(key, sessionObject[key][i],sessionObject[key][i+1]);
							tableOfUpdatesSession=tableOfUpdatesSession.concat(arrayChanges);

						}
					}else{
						tableOfInsertsSession.push(sessionObject[key][i]);	
					}
					
				};

			};
			tableOfUpdatesSession=$filter('orderBy')(tableOfUpdatesSession,'time',false);
			tableOfInsertsSession=$filter('orderBy')(tableOfInsertsSession,'time',false)
			console.log(tableOfInsertsSession);
			console.log(tableOfUpdatesSession);
		},
		getPatientActivityObject:function()
		{
			return activityLogObject;
		},
		getPatientActivityArray:function()
		{
			return activityLogArray;
		},
		getTableOfUpdatesSession:function()
		{
			return tableOfUpdatesSession;
		},
		getTableOfInsertsSession:function()
		{
			return tableOfInsertsSession;
		}
	};



}]);