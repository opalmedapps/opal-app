<?php
  if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);

  // Create DB connection
  include '../config.php';
  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);  // Check connection
  if ($conn->connect_error) {
      die("<br>Connection failed: " . $conn->connect_error);
  }
   mysqli_set_charset($conn,"utf8");
  $sqlLookup="
   SELECT
   patient.FirstName,
   patient.LastName,
   patient.PatientId,
   feedback.FeedbackContent,
   feedback.AppRating,
   feedback.DateAdded 
    FROM
    Feedback as feedback,
    Patient as patient
    WHERE
    feedback.PatientSerNum=patient.PatientSerNum AND feedback.DateAdded > '".$_POST["filter"]."';";
  $lookupResult = $conn->query($sqlLookup);
  // If patientId doesn't already exist , Register the patient
  $json = array();
  if (!$lookupResult)
  {
  	if ($conn->connect_error) {
  	    die("<br>Connection failed: " . $conn->query_error);
  	}
  } else
  {
    if ($lookupResult->num_rows===0) { echo 'NoFeedbackFound';}
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