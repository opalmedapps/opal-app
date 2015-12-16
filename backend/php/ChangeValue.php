<?php
if ( isset($_GET["fieldToChange"]) && isset($_GET["newValue"]) && isset($_GET["PatientSerNum"]))
{
  include 'config.php';
  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
  // Check connection
  if ($conn->connect_error) {
      die("<br>Connection failed: " . $conn->connect_error);
  }
  $fieldToChange=$FileName = str_replace("'", "", $_GET["fieldToChange"]);
  $sqlLookup="
  	UPDATE patient
  	SET patient." . $fieldToChange . "=" . $_GET["newValue"] . " WHERE patient.PatientSerNum=" . $_GET["PatientSerNum"];
  $json = array();
  $lookupResult = $conn->query($sqlLookup);
  // If patientId doesn't already exist , Register the patient
  if (!$lookupResult)
  {
  	if ($conn->connect_error)
    {
  	    die("<br>Connection failed: " . $conn->query_error);
  	}
  } else
  {
			echo "Success";
  }
  $conn->close();
}
else
{
	exit();
}
?>
