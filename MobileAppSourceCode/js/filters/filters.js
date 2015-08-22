var myApp=angular.module('MUHCApp.filters',[]);
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
            str=str.replace('T',' ');
            str=str.replace('Z','');
            return new Date(str);
            /*var res = str.split("  ");
           var res1=res[1].split(" ");
            var res2 = (res[0]).split("-");
            //console.log(res2);
            var res3 = (res[1]).split(":");
            var res4 = (res3[2]).split("0");
            
            var year1 = res2[0];
            var month1 = res2[1];
            var day1 = res2[2];

            var hours1 = res3[0];
            var minutes1 = res3[1];
            
            if (res1[1] === 'PM') {

                hours1 = parseInt(hours1) + 12;
                
                if (hours1 === 24) {
                    hours1 -= 12;
                }
                
            }else{
              if(hours1==='12'){
                
                hours1=parseInt(hours1)-12;
              }
            }
            var d = new Date(parseInt(year1), parseInt(month1) - 1, parseInt(day1), parseInt(hours1), parseInt(minutes1));
            return d;
        }else{ return new Date();}*/
        }
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