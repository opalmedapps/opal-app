var myApp=angular.module('adminPanelApp');
myApp.controller('FeedbackController',function($timeout,$scope,FeedbackService){
	console.log('App Feedback');
	$scope.optionsFilterAppFeedback = ['All','Last Week', 'Last Month'];
	$scope.filterOption = 'All';

	FeedbackService.getAppFeedbackFromServer(new Date(-1)).then(function(result){
		console.log(result);
		$scope.feedbackArray = result;
	});
	FeedbackService.getEducationalMaterialFeedbackFromServer().then(function(result)
	{	
		console.log(result);
		$scope.educationalFeedbackArray = result;
		$scope.goToGraph(0, result[0]);

	});
	$scope.applyFilter = function(filter)
	{
		var filterDate = getFilterDate(filter);
		FeedbackService.getAppFeedbackFromServer(filterDate).then(function(result){
		console.log(result);
		$scope.feedbackArray = result;
	});
	};
	function getFilterDate(filter)
	{
		var today = new Date();
		switch(filter){
			case 'All':
				return new Date(-1);
			case 'Last Week':
				
				today.setDate(today.getDate()-7);	
				return today;
			case 'Last Month':
				today.setMonth(today.getMonth()-1);	
				return today;
		}
	}
	$scope.goToLink = function(material)
	{
		if(material.ShareURL_EN)
		{
			window.open(material.ShareURL_EN);
		}else{
			window.open(material.URL_EN);
		}
		
	};
	$scope.goToGraph =function(index, material)
	{	
		FeedbackService.getEducationalMaterialRatingFromServer(material.EducationalMaterialControlSerNum).then(function(result){
			$scope.selectedIndex = index;
			graphPlot(material, FeedbackService.processRatings(result));
		});
		

	};
	function graphPlot(material, series)
	{
		console.log('boom material');
		$('#containerGraphFeedback').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: material.EducationalMaterialName + ' - Total Number Of Ratings:' + material.TotalNumber
        },
        xAxis: {
            categories: ['1', '2', '3', '4', '5']
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Rating Frequency'
            }
        },
        legend: {
            align: 'right',
            x: -30,
            verticalAlign: 'top',
            y: 25,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false
        },
        tooltip: {
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                    style: {
                        textShadow: '0 0 3px black'
                    }
                }
            }
        },
        series: [{
            name: 'Rating',
            data: series
        }]
    });
	}


});