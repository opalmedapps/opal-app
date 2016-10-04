<?php
//AngularJS trick to obtain post request data, does not affect another method is $_POST is already populated.
if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);
// Create DB connection
include '../config.php';
$con = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
// Check connection
if (!mysqli_set_charset($con, "utf8")) {
    printf("Error loading character set utf8: %s\n", mysqli_error($link));
    exit();
}
if ($con->connect_error) {
    die("<br>Connection failed: " . $conn->connect_error);
}
$userID=$_POST["Username"];
//The multi-query statements starts in line 194



//Obtaining Lab results query,
$sql="SELECT ComponentName, FacComponentName, AbnormalFlag, MaxNorm, MinNorm, ".
  "TestValue, TestValueString, UnitDescription, CAST(TestDate AS char(30)) as `TestDate`".
  " FROM TestResult, Users, Patient ".
  'WHERE TestResult.PatientSerNum=Patient.PatientSerNum AND Users.UserTypeSerNum=Patient.PatientSerNum AND '.
  'Users.Username Like '."'". $userID."';";

//Obtaining Tasks query.
 $sql.='SELECT '.
             'Alias.AliasName_EN AS TaskName_EN, '.
             'Alias.AliasName_FR AS TaskName_FR, '.
             'Alias.AliasDescription_EN AS TaskDescription_EN, '.
             'Alias.AliasDescription_FR AS TaskDescription_FR, '.
             'Task.DueDateTime '.
           'From '.
             'Task, '.
             'Alias, '.
             'AliasExpression, '.
             'Patient, '.
             'Users '.
           'WHERE '.
             'Patient.PatientSerNum = Task.PatientSerNum AND ' .
             'AliasExpression.AliasExpressionSerNum =Task.AliasExpressionSerNum AND '.
             'AliasExpression.AliasSerNum = Alias.AliasSerNum AND '.
             'Users.UserTypeSerNum=Patient.PatientSerNum AND '.
             'Users.Username Like '."'". $userID."';";


//Obtaining Notifications query

$sql.='SELECT '.
                      'Notifications.NotificationSerNum, '.
                      'Notifications.Type, '.
                      'Notifications.TypeSerNum, '.
                      'Notifications.AliasSerNum, '.
                      'Notifications.ReadStatus, '.
                      'Notifications.DateAdded, '.
                      'Alias.AliasName_FR, '.
                      'Alias.AliasDescription_EN, '.
                      'Alias.AliasName_EN, '.
                      'Alias.AliasDescription_FR '.
                    'From '.
                      'Notifications, '.
                      'Patient, '.
                      'Users, ' .
                      'Alias ' .
                    'WHERE '.
                      'Alias.AliasSerNum = Notifications.AliasSerNum AND '.
                      'Patient.PatientSerNum = Notifications.PatientSerNum AND '.
                      'Users.UserTypeSerNum=Patient.PatientSerNum AND '.
                      'Users.Username Like '."'". $userID."';";

//Obtaining Documents query

$sql.='SELECT '.
                      'Document.FinalFileName, '.
                      'Alias.AliasName_EN, ' .
                      'Alias.AliasName_FR, '.
                      'Alias.AliasDescription_EN, '.
                      'Alias.AliasDescription_FR, '.
                      'Document.DocumentSerNum, ' .
                      'Document.DateAdded ' .
                    'From '.
                      'Document,'.
                      'Patient, '.
                      'Alias, '.
                      'AliasExpression, ' .
                      'Users ' .

                    'WHERE '.
                      'Document.AliasExpressionSerNum = AliasExpression.AliasExpressionSerNum AND '.
                      "Document.ValidEntry = 'Y' AND " .
                      'AliasExpression.AliasSerNum = Alias.AliasSerNum AND '.
                      'Patient.PatientSerNum = Document.PatientSerNum AND '.
                      'Users.UserTypeSerNum=Patient.PatientSerNum AND '.
                      'Users.Username Like '."'". $userID."';";

//Obtaining appointments query

 $sql.='SELECT '.
                      'Alias.AliasName_EN AS AppointmentType_EN, '.
                      'Alias.AliasName_FR AS AppointmentType_FR, '.
                      'Alias.AliasDescription_EN AS AppointmentDescription_EN, '.
                      'Alias.AliasDescription_FR AS AppointmentDescription_FR, '.
                      'Appointment.ScheduledStartTime, '.
                      'Appointment.AppointmentSerNum, '.
                      'Appointment.ScheduledEndTime, '.
                      'Appointment.Location, '.
                      'Appointment.Checkin, '.
                      'Appointment.ChangeRequest, '.
                      'Resource.ResourceName '.
                    'From '.
                      'Appointment, '.
                      'AliasExpression, '.
                      'Alias, ' .
                      'Resource, '.
                      'Patient, '.
                      'Users ' .
                    'WHERE '.
                      'Resource.ResourceSerNum = Appointment.ResourceSerNum AND '.
                      'Patient.PatientSerNum = Appointment.PatientSerNum AND '.
                      'AliasExpression.AliasExpressionSerNum=Appointment.AliasExpressionSerNum AND '.
                      'AliasExpression.AliasSerNum=Alias.AliasSerNum AND '.
                      'Users.UserTypeSerNum=Patient.PatientSerNum AND '.
                      'Users.Username Like '."'". $userID."';";
//Obtaining Messages query
$sql.='SELECT '.
                      'Messages.MessageSerNum, '.
                      'Messages.SenderRole, '.
                      'Messages.ReceiverRole, '.
                      'Messages.SenderSerNum, '.
                      'Messages.ReceiverSerNum, '.
                      'Messages.MessageContent, '.
                      'Messages.ReadStatus, '.
                      'Messages.MessageDate '.
                      'FROM '.
                        'Messages, '.
                        'Patient, '.
                        'Users ' .
                      'WHERE '.
                        '(Users.Username Like '. "'" . $userID ."' )" .
                       ' AND '.
                       'Patient.PatientSerNum=Users.UserTypeSerNum AND' .
                        "( (Messages.ReceiverRole='Patient' AND Patient.PatientSerNum = Messages.ReceiverSerNum) OR (Messages.SenderRole='Patient' AND Patient.PatientSerNum = Messages.SenderSerNum) );";

//Obtaining Diagnoses query
$sql.='SELECT '.
                      'Diagnosis.Description_EN, '.
                      'Diagnosis.Description_FR '.
                      'FROM '.
                        'Diagnosis, '.
                        'Patient, '.
                        'Users ' .
                      'WHERE '.
                        'Users.Username Like '. "'" . $userID ."'" .
                       ' AND '.
                       'Users.UserTypeSerNum=Patient.PatientSerNum AND '.
                        'Diagnosis.PatientSerNum = Patient.PatientSerNum;';
//Obtaining doctors query
$sql.='SELECT '.
                      'Doctor.FirstName, '.
                      'Doctor.LastName, '.
                      'Doctor.DoctorSerNum, '.
                      'PatientDoctor.PrimaryFlag, '.
                      'PatientDoctor.OncologistFlag, '.
                      'Doctor.Email, '.
                      'Doctor.Phone, '.
                      'Doctor.ProfileImage, ' .
                      'Doctor.Address '.
                      'FROM '.
                        'Doctor, '.
                        'PatientDoctor, '.
                        'Patient, '.
                        'Users ' .
                      'WHERE '.
                        'Users.Username Like '. "'" . $userID ."'" .
                       ' AND '.
                       'Patient.PatientSerNum=Users.UserTypeSerNum AND '.
                        'PatientDoctor.PatientSerNum = Patient.PatientSerNum AND '.
                        'Doctor.DoctorSerNum = PatientDoctor.DoctorSerNum;';
//Obtaing patient information query
$sql.='SELECT ' .
                      'Patient.PatientSerNum,' .
                      'Patient.FirstName, ' .
                      'Patient.LastName,' .
                      'Patient.TelNum,' .
                      'Patient.Email,' .
                      'Patient.Alias, '.
                      'Patient.Language,' .
                      'Patient.EnableSMS,' .
                      'Patient.ProfileImage, ' .
                      'Patient.SSN '.
                    'From ' .
                      'Patient, '.
                      'Users ' .
                    'WHERE '.
                      "Users.Username LIKE '". $userID."'AND Users.UserTypeSerNum = Patient.PatientSerNum;";

// Execute multi query

//Defining name of database tables to simulate Firebase structure.
 $fieldsArray=array('LabTests','Tasks','Notifications','Documents','Appointments','Messages','Diagnoses','Doctors','Patient');
 $index=0;
 $patientDataArray=array();
if (mysqli_multi_query($con,$sql))
{
  do
    {
    // Store first result set
    if ($result=mysqli_store_result($con)) {
      // Fetch one and one row
    	$json=array();
      while ($row=mysqli_fetch_assoc($result))
        {
       	$json[]=$row;
        }
        $patientDataArray[$fieldsArray[$index]]=$json;

        //Checking for the  last table query to spit the data.
        if($fieldsArray[$index]=='Patient')
       	{
			echo json_encode($patientDataArray);
       	}

       $index++;
      // Free result set
      mysqli_free_result($result);
      }
    }
  while (mysqli_next_result($con));

}else{
	echo 'error';
}

mysqli_close($con);
?>
