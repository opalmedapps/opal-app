<?php
// Create DB connection
include 'config.php';
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
// Check connection
if ($conn->connect_error) {
    die("<br>Connection failed: " . $conn->connect_error);
}
$sqlLookup="
	SELECT
  patient.FirstName,
  patient.LastName,
  aliasexpression.ExpressionName AS AppointmentType,
  appointment.ScheduledStartTime,
  appointment.AppointmentSerNum,
  appointmentchangerequests.PreferredStartDate,
  appointmentchangerequests.PreferredEndDate,
  appointmentchangerequests.TimeOfDay,
  appointmentchangerequests.RequestSerNum
	FROM
  appointmentchangerequests,
  appointment,
  patient,
  aliasexpression
  WHERE
  appointmentchangerequests.AppointmentSerNum=appointment.AppointmentSerNum
  AND appointmentchangerequests.IsProcessed=0
  AND appointment.AliasExpressionSerNum=aliasexpression.AliasExpressionSerNum
  AND patient.PatientSerNum=appointmentchangerequests.PatientSerNum
";

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
	if ($lookupResult->num_rows===0) { echo 'NoChangeRequests';}
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
