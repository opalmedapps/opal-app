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
    function previousStages(stage,tracker)
    {
        var prevStages=planStages.slice(0,tracker);
        console.log(prevStages);
        var state=$filter('filter')(prevStages, stage.Name);
        if(state.length==0)
        {
          return false;
        }else{
          return true;
        }

    }
    function lookForNextCtSim(plan,index)
    {
      for (var i = index; i < plan.length; i++) {
        if(plan[i].Name=='CT for Radiotherapy Planning')
        {
          return i;
        }
      }
      return -1;
    }
    var planStages=['CT for Radiotherapy Planning','Physician Plan Preparation','Calculation of Dose','Quality Control','Scheduling','First Radiotherapy Treatment Session'];
    var treatmentPlan=[];
    var futureStages=[];
    var pastStages=[];
    var treatmentPlansArray=[];
    this.TasksAndAppointmentsArray=[];
    this.FutureStages=[];
    this.PastStages=[];
    this.CurrentTaskOrAppointmentIndex=-1;

    function fillStagesLeft(tracker, planSoFar)
    {
      for (var i = tracker; i < planStages.length; i++) {
        var objectStage={};
        objectStage.Name=planStages[i];
        objectStage.Status='Future';
        objectStage.Description='';
        planSoFar[i]=objectStage;
      }
    }
    function stageDate(array)
    {
      
    }
    function cleanDuplicates(array)
    {
      
    }
    function setCorrectOrder(array)
    {
      
    }
    function determineLastCompletedTask(array)
    {
      
    }





    return{
        setTreatmentPlanNew:function(tasks,appointments)
        {
          var steps = [];
          //Get interested appointments, tasks, appointments.
          steps = tasks.concat(appointments);
          //Clean duplicates
          
          //Set correct order
          
          //Determine the last completed task.
          
        },
        /**
        *@ngdoc method
        *@name setUserPlanWorkflow
        *@methodOf MUHCApp.services:UserPlanWorkflow
        *@param {Object} tasksAndAppointments Object contains user's plan workflow.
        *@description Obtains plan workflow object from Firebase through the {@link MUHCApp.services:UpdateUI UpdateUI} service. Defines the TasksAndAppointmentsArray
        *by organizing the stages chronologically. Sets the current stage by finding the min time between today and the available stages, and setting CurrentTaskOrAppointmentIndex.
        **/
        setTreatmentPlan:function(tasks, appointments)
        {
          /*var plan={
              '1':{'Name':'CT for Radiotherapy Planning','Date':'2015-10-19T09:00:00Z','Description':'stage1','Type': 'Appointment'},
              '2':{'Name':'Physician Plan Preparation','Date':'2015-10-21T09:15:00Z','Description':'stage2','Type':'Task'},
              '3':{'Name':'Calculation of Dose & Physician Review','Date':'2015-10-23T09:15:00Z','Description':'stage3','Type':'Task'},
              '4':{'Name':'Quality Control','Date':'2015-10-28T10:15:00Z','Description':'stage5','Type':'Task'},
              '5':{'Name':'Scheduling','Date':'2015-10-30T09:15:00Z','Description':'stage6','Type':'Task'},
              '6':{'Name':'First Treatment','Date':'2015-11-02T09:15:00Z','Description':'stage6','Type':'Task'}
          };*/


          console.log(tasks);
          console.log(appointments);
          var today=new Date();
          if(typeof appointments!=='undefined')
          {
            for (var i = 0; i < appointments.length; i++) {
              appointments[i].Date=$filter('formatDate')( appointments[i].ScheduledStartTime);
              appointments[i].Name=appointments[i].AppointmentType_EN;
              appointments[i].Type='Appointment';
            }
            if(typeof tasks !=='undefined')
            {
              for (var i = 0; i < tasks.length; i++) {

                tasks[i].Date=$filter('formatDate')( tasks[i].DueDateTime);
                tasks[i].Name=tasks[i].TaskName_EN;
                tasks[i].Type='Task';
              }
              var stages=appointments.concat(tasks);
              var ctsim=$filter('filter')(stages, 'CT for Radiotherapy Planning');
              var planPrep=$filter('filter')(stages,'Physician Plan Preparation');
              var calcDoseAndPhysReview=$filter('filter')(stages,'Calculation of Dose');
              var qualityControl=$filter('filter')(stages,'Quality Control');
              var scheduling=$filter('filter')(stages,'Scheduling');
              var firstTreatment=$filter('filter')(stages,'First Radiotherapy Treatment Session');
              var lastTreatment=$filter('filter')(stages,"Final Radiotherapy Treatment Session");
              var plan=ctsim.concat(planPrep,calcDoseAndPhysReview,qualityControl,scheduling,firstTreatment,lastTreatment);
              plan=$filter('date')(plan,'DueDateTime');
              console.log(plan);
              var tracker=0;
              var treatmentPlanBuild=[];
              //Plan contains the stages for appointments and tasks that are contained within the plan stages in chrono order
              for (var i = 0; i < plan.length; i++) {
                if(tracker!==0&&previousStages(plan[i],tracker))
                {
                  var nextIndex=lookForNextCtSim(plan,i);
                  if(nextIndex==-1)
                  {
                    return;
                  }else{
                    tracker=0;
                    treatmentPlanBuild=[];
                    i=nextIndex;
                    continue;
                  }
                }
                if(tracker==planStages.length-1)
                {
                  treatmentPlansArray.push(treatmentPlanBuild);
                  console.log(treatmentPlansArray);
                }
                if(plan[i].Name==planStages[tracker])
                {
                  console.log(plan[i].Name);
                  console.log(tracker);
                  if(plan[i].Date<today)
                  {
                    plan[i].Status='Past';
                  }else{
                    plan[i].Status='Future';
                  }
                  treatmentPlanBuild[tracker]=plan[i];
                }else if(plan[i].Name==planStages[tracker+1])
                {
                  tracker++;
                  console.log(plan[i].Name);
                  console.log(tracker);
                  if(plan[i].Date<today)
                  {
                    plan[i].Status='Past';
                  }else{
                    plan[i].Status='Future';
                  }
                  treatmentPlanBuild[tracker]=plan[i];
                }

              }
              console.log(plan);

              var physicianPlanPrep=$filter('filter')(tasks, 'Physician Plan Preparation');
              if(physicianPlanPrep.length!==0)
              {
                console.log(physicianPlanPrep);

              }else{
                return;
              }




            }
          }
        },
        getTreatmentPlansArray:function()
        {
          return treatmentPlansArray;
        },
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
            return -1;
        }
        },
        getNextStageIndex:function(){
            return this.CurrentTaskOrAppointmentIndex;
        },
        getNextStage:function(){
          if(this.FutureStages.length==0)
          {
            return -1;
          }else{
            return this.FutureStages[0];
          }
        },
        getFutureStages:function(){
            return this.FutureStages;
        },
        getPastStages:function(){
            return this.PastStages;
        },
        getTreatmentPlans:function()
        {
          return treatmentPlansArray;
        },
        isEmpty:function()
        {
          if(this.TasksAndAppointmentsArray.length==0)
          {
            return true;
          }else{
            return false;
          }
        },
        getCompletionDate:function()
        {
          //Fix when estimated time is actually gathered
          return this.TasksAndAppointmentsArray[0].Date;
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
