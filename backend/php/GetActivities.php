<?php
if ( isset($_GET["PatientId"]) && isset($_GET["LastName"])) {
	$SearchCondition="Patient.PatientId = " . $_GET["PatientId"] ." AND Patient.LastName = " . $_GET["LastName"];
}
 else if ( isset($_GET["PatientId"]) &&  !isset($_GET["LastName"]) ) {
   //echo "only patientid?";
 	$SearchCondition="Patient.PatientId = ". $_GET["PatientId"] ;
}
 else if ( !isset($_GET["PatientId"]) &&  isset($_GET["LastName"]) ) {
 	$SearchCondition="Patient.LastName = " . $_GET["LastName"] ;
}
else
{
	exit();
}
// Create DB connection
include 'config.php';
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
// Check connection
if ($conn->connect_error) {
    die("<br>Connection failed: " . $conn->connect_error);
}
$sqlLookup="
	SELECT
	patientactivitylog.ActivityType,
  patientactivitylog.ActivityDescription,
  patientactivitylog.ActivityDateTime
	FROM
	Patient,
  patientactivitylog
	WHERE " . $SearchCondition .
 ' AND Patient.PatientSerNum = patientactivitylog.PatientSerNum';

$json = array();
$lookupResult = $conn->query($sqlLookup);
// If patientId doesn't already exist , Register the patient
if (!$lookupResult)
{
	if ($conn->connect_error) {
	    die("<br>Connection failed: " . $conn->query_error);
	}
} else
{
	if ($lookupResult->num_rows===0) { echo 'ActivityNotFound';}
	else
	{
		while($row = $lookupResult->fetch_assoc())
			{
					$json[] = $row;
			}
			echo json_encode($json);
	}
}
$conn->close();
?>
