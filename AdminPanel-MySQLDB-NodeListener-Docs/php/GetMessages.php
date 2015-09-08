<?php
if ( isset($_GET["Username"]) )
{
  // Create DB connection
  include 'config.php';
  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB); 
  if ($conn->connect_error) {
      die("<br>Connection failed: " . $conn->connect_error);
  }
  $sqlLookup="
  	SELECT
      messages.MessageSerNum,
      messages.SenderRole,
      messages.ReceiverRole,
      messages.SenderSerNum,
      messages.ReceiverSerNum,
      messages.MessageContent,
      messages.Attachment,
      messages.ReceiverReadStatus AS ReadStatus,
      messages.MessageDate
    FROM
      messages,
      admin
    WHERE
      (admin.Username=" . $_GET["Username"] . ") AND
        ( ( messages.ReceiverRole='Admin' AND admin.AdminSerNum = messages.ReceiverSerNum) OR (messages.SenderRole='Admin' AND admin.AdminSerNum = messages.SenderSerNum) )";
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
  	if ($lookupResult->num_rows===0) { echo 'NoMessageFound';}
  	else
  	{
  		while($row = $lookupResult->fetch_assoc())
  			{
            if ($row["ReceiverRole"] == 'Patient')
            {
              $PatientNameQuery="
              SELECT
              FirstName,
              LastName
              From patient
              WHERE patient.PatientSerNum=" . $row["ReceiverSerNum"];
            }else
            {
              $PatientNameQuery="
              SELECT
              FirstName,
              LastName
              From patient
              WHERE patient.PatientSerNum=" . $row["SenderSerNum"];
            }
            $NameResult = $conn->query($PatientNameQuery);
            if (!$NameResult)
            {
            	if ($conn->connect_error) {
            	    die("<br>Connection failed: " . $conn->query_error);
            	}
            } else
            {
              while ( $nameRow = $NameResult->fetch_assoc())
              {
                $row["PatientFirstName"]=$nameRow["FirstName"];
                $row["PatientLastName"]=$nameRow["LastName"];
              }
            }
  					$json[] = $row;
  			}
  		  echo json_encode($json);
  	}
  }
  $conn->close();
}
else
{
	exit();
}
?>
