var app=angular.module('adminPanelApp');
app.controller('ActivityController',function($scope, $timeout,$filter, ActivityLogService){
	$scope.session={};
	$scope.session.inserts=[];
	$scope.session.updates=[];
	$scope.dateFilter="all";
	init();
	$scope.$watch('dateFilter',function()
	{
		
		$scope.dateChooser=true;
		console.log($scope.dateFilter);
		if($scope.dateFilter=='all')
		{
			$timeout(function()
			{
				init();
			});
			
		}
	});
	$scope.checkDates=function()
	{
		if(typeof $scope.startDateFilter!=='undefined'&&typeof $scope.endDateFilter!=='undefined'&&$scope.endDateFilter.getTime()-$scope.startDateFilter.getTime()>0)
		{
			return false;
		}else{
			return true;
		}
	}
	$scope.applyDateFilter=function()
	{
		console.log($scope.startDateFilter);
		console.log($scope.endDateFilter);
		var prepareObject={};
		prepareObject.StartDate=$filter('date')($scope.startDateFilter,'yyyy-MM-dd hh:mm:ss');
		prepareObject.EndDate=$filter('date')($scope.endDateFilter,'yyyy-MM-dd hh:mm:ss');
		console.log(prepareObject);
		init(prepareObject);
		
	}
	function init(param)
	{
		ActivityLogService.getPatientActivityLogFromServer(param).then(function(result){
			if(result!=='No activity found')
			{
				ActivityLogService.setPatientActivityLogTable(result);
				$scope.activityLogObject=ActivityLogService.getPatientActivityObject();
				$scope.activityLogArray=ActivityLogService.getPatientActivityArray();
				console.log($scope.activityLogArray);
			}else{
				$scope.noActivity = true;
				$scope.activityLogObject = {};
				$scope.activityLogArray = [];

			}
			
		});	
	}
	
	function closeAllOtherSessions(session)
	{
		
		for (var i = $scope.activityLogArray.length - 1; i >= 0; i--) {
		 	if(session!==$scope.activityLogArray[i].SessionId)
			{
				$scope.activityLogArray[i].expanded=false;	
			}
		 }; 
			
			
	
	}
	$scope.searchActivity=function(session)
	{
		$scope.loading = true;
		$scope.session.inserts = [];
		$scope.session.updates = [];
		closeAllOtherSessions(session.SessionId);
		if(session.expanded)
	   	{
	   		session.expanded=false;
	   	}else{
	   		session.expanded=true;
	   	}
	   	
		if(typeof session!=='undefined')
		{
			$scope.session.inserts=[];
			$scope.session.updates=[];
			ActivityLogService.getPatientSessionActivityFromServer(session.SessionId).then(function(result){
				ActivityLogService.setPatientSessionObject(result);
				$scope.session.inserts=ActivityLogService.getTableOfInsertsSession();
				$scope.session.updates=ActivityLogService.getTableOfUpdatesSession();
				$scope.loading = false;
				$timeout(function(){
					
					
				},200);
				
			});
		}
	}
});