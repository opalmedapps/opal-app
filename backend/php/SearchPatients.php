<?php
if ( isset($_GET["PatientId"]) && isset($_GET["LastName"])) {
  $SearchCondition="PatientId = " . $_GET["PatientId"] ." AND LastName = " . $_GET["LastName"];
}
 else if ( isset($_GET["PatientId"]) &&  !isset($_GET["LastName"]) ) {
  $SearchCondition="PatientId = ". $_GET["PatientId"] ;
}
 else if ( !isset($_GET["PatientId"]) &&  isset($_GET["LastName"]) ) {
  $SearchCondition="LastName = " . $_GET["LastName"] ;
}
else {
  exit();
}
// Create DB connection
include 'config.php';
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
if ($conn->connect_error) {
    die("<br>Connection failed: " . $conn->connect_error);
}
$sqlLookup="
  SELECT
  *
  FROM
  Patient
  WHERE " . $SearchCondition ;
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
  if ($lookupResult->num_rows===0) { echo 'PatientNotFound';}
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