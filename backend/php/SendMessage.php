<?php
include 'config.php';
if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);
if ( isset($_POST["SenderSerNum"]) && isset($_POST["ReceiverSerNum"]) && isset($_POST["MessageContent"])&& isset($_POST["SenderRole"]))
{
  // Create DB connection

  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
  // Check connection
  if ($conn->connect_error) {
      die("<br>Connection failed: " . $conn->connect_error);
  }
  $sqlLookup="
  INSERT INTO Messages (MessageSerNum,SenderRole,ReceiverRole,SenderSerNum,ReceiverSerNum,MessageContent,Attachment,ReadStatus,MessageDate,LastUpdated)
  VALUES  (NULL,'".$_POST["SenderRole"]."','Patient','".$_POST["SenderSerNum"]."','".$_POST["ReceiverSerNum"]."','".$_POST["MessageContent"]."','No','0',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ";
  $lookupResult = $conn->query($sqlLookup);
  // If patientId doesn't already exist , Register the patient
  if (!$lookupResult)
  {
  	if ($conn->connect_error) {
  	    die("<br>Connection failed: " . $conn->query_error);
  	}
  } else
  {
      echo "MessageSent";
  }
  $conn->close();
}
else
{
	exit();
}
?>
