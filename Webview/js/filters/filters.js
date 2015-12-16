var myApp=angular.module('MUHCApp');
	myApp.filter('notifications',function(){
		return function(input){
			if(input==='DoctorNote'){
				return 'Doctor Note';
			}else if(input==='DocumentReady'){
				return 'Document Ready';
			}else if(input==='AppointmentChange'){
				return 'Appointment Change';
			}

		}



	});

	myApp.filter('formatDateAppointmentTask',['$filter', function($filter){
		return function(dateApp)
		{
			var today=new Date();

			if(typeof dateApp!=='undefined'){
				if(dateApp.getFullYear()==today.getFullYear())
				{
					return $filter('date')(dateApp,"EEEE MMM d 'at' h:mm a");
				}else{
					return $filter('date')(dateApp,"EEEE MMM d yyyy");
				}
			}else{
				return '';
			}

		}


	}]);
  myApp.filter('formatDateToFirebaseString',function(){
    return function(date){
      var month=date.getMonth()+1;
      var year=date.getFullYear();
      var day=date.getDate();
      var minutes=date.getMinutes();
      var seconds=date.getSeconds();
      var hours=date.getHours();
      var string= year+'-'+month+'-'+day+'T'+hours+':'+ minutes +':'+seconds+'.000'+'Z';
      return string;




    }

  });


	myApp.filter('formatDate',function(){
		return function(str) {
        if(typeof str==='string'){
          var a = str.split(/[^0-9]/);
          //for (i=0;i<a.length;i++) { alert(a[i]); }
          var d=new Date (a[0],a[1]-1,a[2],a[3],a[4],a[5] );
        return d;
        }
      }
	});
	myApp.filter('dateEmail',function($filter){
	  return function(date){
			if(Object.prototype.toString.call(date) === '[object Date]')
			{
				var day=date.getDate();
				var month=date.getMonth();
				var year=date.getFullYear();
				var newDate=new Date();
				if(newDate.getMonth()==month&&newDate.getFullYear()==year)
				{
					if(day==newDate.getDate())
					{
						return $filter('date')(date, 'h:mma');
					}else if(day-newDate.getDate()==1){
						return 'Yesterday';
					}else{
						return $filter('date')(date, 'dd/MM/yyyy');
					}
				}else{
					return $filter('date')(date, 'dd/MM/yyyy');
				}
			}else{
				return date;
			}
	  };
	});
myApp.filter('phoneFilter',function(){
	return function(string)
	{
		return '+('+string.substring(0,3)+") "+string.substring(3,6)+'-'+string.substring(6,10);
	}
});
myApp.filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  }

});
