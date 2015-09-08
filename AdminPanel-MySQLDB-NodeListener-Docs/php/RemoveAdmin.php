<?php
if ( isset($_GET["AdminSerNum"]))
{
  // Create DB connection
  include 'config.php';
  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
    // Check connection
  if ($conn->connect_error) {
      die("<br>Connection failed: " . $conn->connect_error);
  }
  $sqlLookup="
  REMOVE from admin WHERE admin.AdminSerNum= " . $_GET["AdminSerNum"];
  $lookupResult = $conn->query($sqlLookup);
  // If patientId doesn't already exist , Register the patient
  if (!$lookupResult)
  {
  	if ($conn->connect_error) {
  	    die("<br>Connection failed: " . $conn->query_error);
  	}
  } else
  {
      echo "AdminRemoved";
  }
  $conn->close();
}
else
{
	exit();
}
?>
