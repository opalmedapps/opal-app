<?php
if ( isset($_GET["RequestSerNum"]))
{
  // Create DB connection
  include 'config.php';
  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
    // Check connection
  if ($conn->connect_error) {
      die("<br>Connection failed: " . $conn->connect_error);
  }
  $sqlLookup="
   UPDATE  appointmentchangerequests SET appointmentchangerequests.IsProcessed=1 WHERE appointmentchangerequests.RequestSerNum= " . $_GET["RequestSerNum"];

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
      echo "RequestRemoved";
  	}
  }
  $conn->close();
}
else
{
	exit();
}
?>
