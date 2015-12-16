<?php

if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);

$PatientId=$_POST["PatientId"];
$FirstName=$_POST["PatientFirstName"];
$LastName=$_POST["PatientLastName"];
$TelNumForSMS=$_POST["TelNumForSMS"];
$Email=$_POST["Email"];
$loginID=$_POST["LoginId"];
$Language=$_POST["Language"];
$PatientSSN=$_POST["PatientSSN"];
$PatientSerNum=$_POST["PatientSer"];
$Password=$_POST["Password"];
$EnableSMS=$_POST["EnableSMS"];
$var=$_POST;
$SSN=$_POST["SSN"];
$Alias=$_POST['Alias'];
$Password=$_POST['Password'];
$Question1=$_POST['Question1'];
$Question2=$_POST['Question2'];
$Question3=$_POST['Question3'];
$Answer1=$_POST['Answer1'];
$Answer2=$_POST['Answer2'];
$Answer3=$_POST['Answer3'];
// Create DB connection
include 'config.php';
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);

// Check connection
if ($conn->connect_error) {
    die("<br>Connection failed: " . $conn->connect_error);
}
$sqlLookup="
	SELECT *
	FROM
	Patient
	WHERE
	PatientId='".$PatientId."' LIMIT 1";
$lookupResult = $conn->query($sqlLookup);
// If patientId doesn't already exist , Register the patient
$response= array();
if ($lookupResult->num_rows===0) {

if(!isset($TelNumForSMS)&&!isset($Alias)){
    $sqlInsert="INSERT INTO `Patient`(`PatientSerNum`, `PatientAriaSer`, `PatientId`, `FirstName`, `LastName`, `Alias`,`ProfileImage`, `TelNum`, `EnableSMS`, `Email`, `Language`, `SSN`, `LastUpdated`) VALUES (NULL,".$PatientSerNum.",'".$PatientId."',"."'".$FirstName."','".$LastName."',NULL,'',NULL,".$EnableSMS.",'".$Email."','".$Language."','".$SSN."', NULL)";

  }else if(isset($TelNumForSMS)&&!isset($Alias)){
    $sqlInsert="INSERT INTO `Patient`(`PatientSerNum`, `PatientAriaSer`, `PatientId`, `FirstName`, `LastName`, `ProfileImage`, `TelNum`, `EnableSMS`, `Email`, `Language`, `SSN`, `LastUpdated`) VALUES (NULL,".$PatientSerNum.",'".$PatientId."',"."'".$FirstName."','".$LastName."',NULL,'',".$TelNumForSMS.",".$EnableSMS.",'".$Email."','".$Language."','".$SSN."', NULL)";
  }else if(!isset($TelNumForSMS)&&isset($Alias)){
    $sqlInsert="INSERT INTO `Patient`(`PatientSerNum`, `PatientAriaSer`, `PatientId`, `FirstName`, `LastName`, `Alias`,`ProfileImage`, `TelNum`, `EnableSMS`, `Email`, `Language`, `SSN`, `LastUpdated`) VALUES (NULL,".$PatientSerNum.",'".$PatientId."',"."'".$FirstName."','".$LastName."','".$Alias."','',NULL,".$EnableSMS.",'".$Email."','".$Language."','".$SSN."', NULL)";
  }else{
    $sqlInsert="INSERT INTO `Patient`(`PatientSerNum`, `PatientAriaSer`, `PatientId`, `FirstName`, `LastName`, `Alias`,`ProfileImage`, `TelNum`, `EnableSMS`, `Email`, `Language`, `SSN`, `LastUpdated`) VALUES (NULL,".$PatientSerNum.",'".$PatientId."',"."'".$FirstName."','".$LastName."','".$Alias."','',".$TelNumForSMS.",".$EnableSMS.",'".$Email."','".$Language."','".$SSN."', NULL)";

  }
  if ($conn->query($sqlInsert) === TRUE)
  {
    $query="SELECT PatientSerNum FROM Patient WHERE PatientId='".$PatientId."'";
    //echo $query;
    $serNum = $conn->query($query);
    $row=$serNum->fetch_assoc();
    $PatientSerNum=$row['PatientSerNum'];
    $sql="INSERT INTO `Users` (`UserSerNum`, `UserType`, `UserTypeSerNum`, `Username`, `Password`,`LastUpdated`) VALUES (NULL,'Patient',".$row['PatientSerNum'].",'".$loginID."','".$Password."',NULL)";

    if($conn->query($sql) === TRUE)
    {

      $queryQuestions="INSERT INTO SecurityQuestion ( `SecurityQuestionSerNum`, `PatientSerNum`,`Question`,`Answer`,`LastUpdated` ) VALUES
                      ( NULL,".$PatientSerNum.",'".$Question1."','".$Answer1."', NULL ), ( NULL,".$PatientSerNum.",'".$Question2."','".$Answer2."', NULL ),( NULL,".$PatientSerNum.",'".$Question3."','".$Answer3."', NULL );";
      if($conn->query($queryQuestions)==TRUE)
      {

        $queryPatientControl="INSERT INTO `PatientControl` (`PatientSerNum`,`PatientUpdate`,`LastUpdated`)VALUES (".$PatientSerNum.", 1,NOW())";
        if($conn->query($queryPatientControl)==TRUE)
        {
          $response['Type']='success';
          $response['Response']="Patient has been registered succesfully!";
          echo json_encode($response);
        }else{
          $response['Type']='danger';
          $response['Response']="Error adding to patient control table!";
          echo json_encode($response);
        }
      }else{
        $response['Type']='danger';
        $response['Response']="Server problem, security questions could not be added to our records!";
        echo json_encode($response);
      }
    }else{
      //echo 'boom';
      $response['Type']='danger';
      $response['Response']="Server problem, missing fields in request!";
      echo json_encode($response);
    }

  } else
  {
      echo 'boom';
      $response['Type']='danger';
      $response['Response']="Server problem, missing fields in request!";
      echo json_encode($response);
  }
}else
{
      $response['Type']='warning';
      $response['Response']="Patient has already been registered!";
      echo json_encode($response);
}

$conn->close();

?>
