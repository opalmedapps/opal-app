var myApp=angular.module('MUHCApp');
/**
*@ngdoc service
*@name MUHCApp.services:UserPlanWorkflow
*@requires $filter
*@description Organizes task and appointments for the plan workflow and sets properties ready for usage in the
*Treatment Plan view.
**/
myApp.service('UserPlanWorkflow',['$filter',function($filter){
    /**
    *@ngdoc property
    *@name TasksAndAppointmentsArray
    *@propertyOf MUHCApp.services:UserPlanWorkflow
    *@description Contains stages of the plan workflow organized choronologically
    */
    /**
    *@ngdoc property
    *@name CurrentTaskOrAppointmentIndex
    *@propertyOf MUHCApp.services:UserPlanWorkflow
    *@description Contains index of current stage in the TasksAndAppointmentsArray
    */
    function setTimeBetweenStages(array){
        if(array.length==0) return;
        var flag=0;
        array[0].StageLength=-1;
        for (var i = 0; i < array.length; i++) {
            if(i>0){
                var dateDiffStage=(array[i].Date - array[i-1].Date)/(1000*60*60*24);
                array[i].StageLength=dateDiffStage;
            }
        };
    }


    return{
        /**
        *@ngdoc method
        *@name setUserPlanWorkflow
        *@methodOf MUHCApp.services:UserPlanWorkflow
        *@param {Object} tasksAndAppointments Object contains user's plan workflow.
        *@description Obtains plan workflow object from Firebase through the {@link MUHCApp.services:UpdateUI UpdateUI} service. Defines the TasksAndAppointmentsArray
        *by organizing the stages chronologically. Sets the current stage by finding the min time between today and the available stages, and setting CurrentTaskOrAppointmentIndex.
        **/
        setUserPlanWorkflow:function(tasksAndAppointments){
            this.TasksAndAppointmentsArray=[];
            this.FutureStages=[];
            this.PastStages=[];
            this.CurrentTaskOrAppointmentIndex=-1;
            if(typeof tasksAndAppointments!=='undefined'&&tasksAndAppointments){
              var keysArray=Object.keys(tasksAndAppointments);
              var min=Infinity;
              var index=-1;
              var today=new Date();
              for (var i=0;i<keysArray.length;i++) {

                  //console.log(tasksAndAppointments[keysArray[i]]);
                  var date=$filter('formatDate')(tasksAndAppointments[keysArray[i]].Date);
                  console.log(date);
                  tasksAndAppointments[keysArray[i]].Date=date;
                  //console.log(date.getDate());
                  var sta=null;
                  if(date>today){
                      sta='Future';
                      tasksAndAppointments[keysArray[i]].Status=sta;
                      this.FutureStages.push(tasksAndAppointments[keysArray[i]]);
                      var tmp=min;
                      min=Math.min(min,date-today);
                      if(tmp!==min){
                          index=i;
                      }
                  }else{
                      sta='Past';
                      tasksAndAppointments[keysArray[i]].Status=sta;
                      this.PastStages.push(tasksAndAppointments[keysArray[i]]);
                  }
                  (this.TasksAndAppointmentsArray).push(tasksAndAppointments[keysArray[i]]);
              };

              this.TasksAndAppointmentsArray=$filter('orderBy')(this.TasksAndAppointmentsArray,'Date');
              this.FutureStages=$filter('orderBy')(this.FutureStages,'Date');
              this.PastStages=$filter('orderBy')(this.PastStages,'Date');

              setTimeBetweenStages(this.FutureStages);
              setTimeBetweenStages(this.PastStages);

              var flag=0;
              this.TasksAndAppointmentsArray[0].StageLength=-1;
              for (var i = 0; i < this.TasksAndAppointmentsArray.length; i++) {
                  if(i>0){
                      var dateDiffStage=(this.TasksAndAppointmentsArray[i].Date - this.TasksAndAppointmentsArray[i-1].Date)/(1000*60*60*24);
                      this.TasksAndAppointmentsArray[i].StageLength=dateDiffStage;
                  }
                  if(index!==-1&&flag==0){
                      var diff=this.TasksAndAppointmentsArray[i].Date-today;
                      if(diff>0&&diff===min){
                          this.TasksAndAppointmentsArray[i].Status='Next';
                          this.CurrentTaskOrAppointmentIndex=i+1;
                          flag=1;
                      }
                  }

              };
              if(index==-1) this.CurrentTaskOrAppointmentIndex=keysArray.length;
            }else{
              this.CurrentTaskOrAppointmentIndex=0;
            }


        },
        /**
        *@ngdoc method
        *@name setUserPlanWorkflow
        *@methodOf MUHCApp.services:UserPlanWorkflow
        *@returns {Array} Returns the TasksAndAppointmentsArray property.
        **/
        getPlanWorkflow:function(){
            return this.TasksAndAppointmentsArray;
        },
        /**
        *@ngdoc property
        *@name timeDiff
        *@propertyOf MUHCApp.services:UserPlanWorkflow
        *@description An array that contains the time difference between two events, structure dateDiff[i]={Stages: nameStage[i+1]-nameStage[i], timeDiffInDays:date}
        */
        /**
        *@ngdoc method
        *@name getTimeBetweenEvents
        *@methodOf MUHCApp.services:UserPlanWorkflow
        *@returns {Object} Returns the timeDiff object property properly initialized.
        **/
        getTimeBetweenEvents:function(timeFrame){
            //if(this.TasksAndAppointmentsArray[1].Date instanceof Date) console.log(this.TasksAndAppointmentsArray);
            this.timeDiff=[];
            if(this.TasksAndAppointmentsArray){
                for (var i = 0;i<this.TasksAndAppointmentsArray.length-1;i++) {

                    if(timeFrame==='Day'){
                        var dateDiff=(this.TasksAndAppointmentsArray[i+1].Date - this.TasksAndAppointmentsArray[i].Date)/(1000*60*60*24);
                        this.timeDiff[i]={Stages: this.TasksAndAppointmentsArray[i].Name +'-'+ this.TasksAndAppointmentsArray[i+1].Name, TimeDiffInDays:dateDiff};
                    }else if(timeFrame==='Hour'){
                         var dateDiff=(this.TasksAndAppointmentsArray[i+1].Date - this.TasksAndAppointmentsArray[i].Date)/(1000*60*60);
                        this.timeDiff[i]={Stages: this.TasksAndAppointmentsArray[i].Name +'-'+ this.TasksAndAppointmentsArray[i+1].Name, TimeDiffInDays:dateDiff};
                    }
                };

                return this.timeDiff;
        }

       },
       /**
        *@ngdoc method
        *@name getCurrentTaskOrAppointment
        *@methodOf MUHCApp.services:UserPlanWorkflow
        *@returns {Array} Returns array with the tasks and appointments for the plan workflow organized chronologically
        **/
       getCurrentTaskOrAppointment:function(){
        if(this.TasksAndAppointmentsArray){
            return this.TasksAndAppointmentsArray[this.CurrentTaskOrAppointmentIndex];
        }else{
            return {Name:"boom", Date:new Date()};
        }
        },
        getNextStageIndex:function(){
            return this.CurrentTaskOrAppointmentIndex;
        },
        getNextStage:function(){
            return this.TasksAndAppointmentsArray[this.CurrentTaskOrAppointmentIndex];
        },
        getFutureStages:function(){
            return this.FutureStages;
        },
        getPastStages:function(){
            return this.PastStages;
        },
        isEmpty:function()
        {
          if(this.TasksAndAppointmentsArray.length==0)
          {
            return false;
          }else{
            return true;
          }
        },
        isCompleted:function()
        {
          if(this.FutureStages.length==0)
          {
            return true;
          }else{
            return false;
          }
        }
    };



}]);
