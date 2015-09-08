<?php



$PatientId=$_GET["PatientId"];
$FirstName=$_GET["FirstName"];
$LastName=$_GET["LastName"];
$TelNumForSMS=$_GET["TelNumForSMS"];
$Email=$_GET["Email"];
$loginID=$_GET["loginID"];
$Language=$_GET["Language"];
$Diagnosis=$_GET["Diagnosis"];
$Oncologist=$_GET["Oncologist"];
$Physician=$_GET["Physician"];
$PatientSSN=$_GET["PatientSSN"];
$PatientSerNum=$_GET["PatientSerNum"];
$Alias=$_GET["Alias"];
$Password=$_GET["Password"];
$EnableSMS=$_GET["EnableSMS"];





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
	PatientId='".$PatientId."' LIMIT 1
";
$lookupResult = $conn->query($sqlLookup);
// If patientId doesn't already exist , Register the patient
if ($lookupResult->num_rows===0) {
$sqlInsert ="
	INSERT INTO Patient
		(PatientSerNum,PatientAriaSer,PatientId,FirstName,LastName,Alias,TelNumForSMS,Email,Language,LoginID,Password,SSN,LastUpdated,EnableSMS)
	VALUES (NULL,'".$PatientSerNum."','".$PatientId."','".$FirstName."','".$LastName."','".$Alias."','".$TelNumForSMS."','".$Email."','".$Language."','".$loginID."','".$Password."','".$PatientSSN."',CURRENT_TIMESTAMP,'".$EnableSMS."') ";
  if ($conn->query($sqlInsert) === TRUE)
  {
    echo "Registration was successful. A confirmation email was sent to you.";
    $PatientControlInsert="
    SELECT PatientSerNum INTO patientcontrol WHERE patient.PatientAriaSer=". $PatientSerNum ;
  } else
  {
     echo "Insertion Query Failed!"; }
  }
else
{
	echo "Patient is already registered!";
}

$conn->close();

?>
