var app=angular.module('adminPanelApp');

app.service('User',function(URLs, $q,api,$http,$rootScope){
  return{
    getNumberOfPatientsForUserFromServer:function(){
      var r=$q.defer();

      if(this.UserRole=='Doctor')
      {
        console.log(this.UserRole);
        var DoctorSerNum=this.UserTypeSerNum;
        r.resolve( api.getFieldFromServer(URLs.getCountOfPatientsUrl(), {'DoctorSerNum':DoctorSerNum}));
      }else{
        r.resolve(api.getFieldFromServer(URLs.getCountOfPatientsUrl(), {'AdminSerNum':this.UserTypeSerNum}));
      }
      return r.promise;

    },
    setCredentials:function(username,password)
    {
      this.Username=username;
    },
    setNumberOfDoctorPatients:function(data)
    {
      this.NumberOfDoctorPatients=data;
    },
    getNumberOfDoctorPatients:function()
    {
      return this.NumberOfDoctorPatients;
    },
    setUserRole:function(role){
      this.UserRole=role;
    },
    getUserRole:function(){
      return this.UserRole;
    },
    setUserTypeSerNum:function(serNum){
      this.UserTypeSerNum=serNum;
    },
    getUserTypeSerNum:function()
    {
      return this.UserTypeSerNum;
    },
    setUserEmail:function(email)
    {
      this.AccountObject.Email=email;
      this.UserFields.Email=email;
      this.Email=email;
    },
    setUserFirstName:function(username)
    {
      this.AccountObject.FirstName=username;
      this.UserFields.FirstName=username;
      this.FirstName=username;
    },
    getUserFirstName:function(){
      return this.FirstName;
    },
    setUserLastName:function(lastname){
      this.AccountObject.LastName=lastname;
      this.UserFields.LastName=lastname;
      this.LastName=lastname;
    },
    setUserTelNum:function(telNum)
    {
      this.AccountObject.Phone=telNum;
      this.UserFields.Phone=telNum;
      this.Phone=telNum;
    },
    setUserImage:function(image)
    {
      this.Image=URLs.getBasicUrl()+image;
      this.UserFields.Image=URLs.getBasicUrl()+image;
      this.AccountObject.Image=URLs.getBasicUrl()+image;
    },
    updateUserField:function(field, newValue)
    {
       if(field=='Username')
      {
        this[field]=newValue;
        this.UserFields[field]=newValue;
        $rootScope.currentUser.Username=newValue;
      }else{
        console.log(field);
        this[field]=newValue;
        this.UserFields[field]=newValue;
      }


    },
    getUserLastName:function(){
      return this.LastName;
    },
    getUserFromServer:function()
    {
      var r=$q.defer();

      r.resolve( api.getFieldFromServer(URLs.getUserUrl(), {'Username':this.Username}));

      return r.promise;
    },
    setUserSerNum:function(userSerNum)
    {
      console.log(userSerNum['UserSerNum']);
      this.UserSerNum=userSerNum['UserSerNum'];
    },
    getUserFields:function()
    {
      if(this.UserRole=='Doctor')
      {
        return {
          FirstName:this.FirstName,
          LastName:this.LastName,
          Email:this.Email,
          Image:this.Image,
          Phone:this.Phone,
          Username:this.Username,
          Password:'',
          DoctorAriaSer:this.DoctorAriaSer,
          UserTypeSerNum:this.UserTypeSerNum,
          Role:this.UserRole
        };
      }else if(this.UserRole=='Admin')
        {
          return {
            FirstName:this.FirstName,
            LastName:this.LastName,
            Email:this.Email,
            Phone:this.Phone,
            Username:this.Username,
            Password:'',
            UserTypeSerNum:this.UserTypeSerNum,
            Role:this.UserRole
          };
        }else if(this.UserRole=='Staff')
        {
          return {
            FirstName:this.FirstName,
            LastName:this.LastName,
            Username:this.Username,
            Password:'', 
            StaffID:this.staffID,
            Role:this.UserRole,
            UserTypeSerNum:this.UserTypeSerNum,
          }
        }
    },
    setUserFields:function(fields,username,userSerNum){
      this.UserSerNum=userSerNum;
      this.UserFields={};
      this.FirstName=fields.FirstName;
      this.LastName=fields.LastName;
      this.Email=fields.Email;
      this.Username=username
      var serNum;
      if(fields.DoctorSerNum){
        serNum=fields.DoctorSerNum;
        this.UserTypeSerNum=fields.DoctorSerNum;
        this.DoctorAriaSer=fields.DoctorAriaSer;
        this.UserRole='Doctor';
        this.UserFields.UserRole='Doctor';
        this.UserFields.UserTypeSerNum=fields.DoctorSerNum;
        this.Image=fields.ProfileImage;
        this.Phone=fields.Phone;
        this.UserFields.Phone=fields.Phone;
        this.UserFields.Email=fields.Email;
        this.UserFields.DoctorAriaSer=fields.DoctorAriaSer;

      }else if(fields.AdminSerNum){
        serNum=fields.AdminSerNum;
        this.UserTypeSerNum=fields.AdminSerNum;
        this.UserFields.UserTypeSerNum=fields.AdminSerNum;
        this.UserRole='Admin';
        this.UserFields.UserRole='Admin';
        this.UserFields.Phone=fields.Phone;
        this.UserFields.Email=fields.Email;


      }else if(fields.StaffSerNum)
      {
        this.staffID=fields.StaffID;
        this.UserRole='Staff';
        serNum=fields.StaffSerNum;
        this.UserFields.UserRole='Staff';
        this.UserTypeSerNum=fields.StaffSerNum;
      }
      
      this.UserFields={
        UserTypeSerNum:serNum,
        FirstName:fields.FirstName,
        LastName:fields.LastName,
        Username:username,
        UserSerNum:userSerNum
      };
    },
    getAccountFields:function(){
      return this.AccountObject;
    },
    getUsername:function(){
      return this.Username;
    },
    getUserPassword:function(){
      return this.AccountPassword;
    },
    updateFieldInServer:function(field,newValue)
    {
      var r=$q.defer();
      objectToSend={};
      objectToSend.field=field;
      objectToSend.newValue=newValue;
      console.log(objectToSend);
      if(field=='Password'||field=='Username')
      {
        objectToSend.UserSerNum=this.UserSerNum;
      }else if(this.UserRole=='Doctor'){
        objectToSend.DoctorSerNum=this.UserTypeSerNum;
      }else if(this.UserRole=='Admin'){
        objectToSend.AdminSerNum=this.UserTypeSerNum;
      }else if(this.UserRole=='Staff')
      {
        objectToSend.StaffSerNum=this.UserTypeSerNum;
      }
      console.log(objectToSend);

      var url=URLs.getUpdateFieldUrl();
      api.getFieldFromServer(url,objectToSend).then(function(data){
        console.log(data);
        r.resolve(data);
      },function(error){
        r.reject(error);
      });

      return r.promise;


    }
  };
});
 