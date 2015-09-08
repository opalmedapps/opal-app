<?php
if ( isset($_GET["SenderSerNum"]) && isset($_GET["ReceiverSerNum"]) && isset($_GET["MessageContent"]))
{
  // Create DB connection
  include 'config.php';
  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
  // Check connection
  if ($conn->connect_error) {
      die("<br>Connection failed: " . $conn->connect_error);
  }
  $sqlLookup="
  INSERT INTO messages (MessageSerNum,SenderRole,ReceiverRole,SenderSerNum,ReceiverSerNum,MessageContent,Attachment,ReceiverReadStatus,MessageDate,LastUpdated)
  VALUES  (NULL,'Admin','Patient','".$_GET["SenderSerNum"]."','".$_GET["ReceiverSerNum"]."','".$_GET["MessageContent"]."','No','0',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ";
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
