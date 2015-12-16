var app=angular.module('adminPanelApp');
app.filter('dateEmail',function($filter){
  return function(date){
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




  };
});
app.filter('formatTelNum',function(){
  return function(str){

    var cap=new RegExp("^[0-9]{1,10}$");
    if(cap.test(str)){
      return "("+str.substring(0,3)+") "+str.substring(3,6)+"-"+str.substring(6,10);
    }else{
      return str;
    }

  };
});

app.filter('formatFieldsAccount',function(){
  return function(str)
  {
    if(str=='FirstName'){
      return 'First Name';
    } else if(str=='LastName') {
      return 'Last Name';
    }else{
      return str;
    }
  }
})
