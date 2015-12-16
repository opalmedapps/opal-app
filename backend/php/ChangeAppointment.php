<?php
if ( isset($_GET["AppointmentSerNum"]))
{
  // Create DB connection
  include 'config.php';
  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
  // Check connection
  if ($conn->connect_error) {
      die("<br>Connection failed: " . $conn->connect_error);
  }
  $sqlLookup="
   UPDATE appointment SET appointment.ScheduledStartTime=" . $_GET["newStartTime"] . " ,appointment.ScheduledEndTime=" . $_GET["newEndTime"] . " WHERE appointment.AppointmentSerNum= " . $_GET["AppointmentSerNum"];
echo $sqlLookup;
  $lookupResult = $conn->query($sqlLookup);
  // If patientId doesn't already exist , Register the patient
  if (!$lookupResult)
  {
  	if ($conn->connect_error) {
  	    die("<br>Connection failed: " . $conn->query_error);
  	}
  } else
  {
      echo "AppointmentChanged";
  }
  $conn->close();
}
else
{
	exit();
}
?>
