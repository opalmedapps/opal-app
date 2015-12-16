<?php
if ( isset($_GET["MessageSerNum"]))
{
  // Create DB connection
  include 'config.php';
  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
    // Check connection
  if ($conn->connect_error) {
      die("<br>Connection failed: " . $conn->connect_error);
  }
  $sqlLookup="
  UPDATE messages SET ReceiverReadStatus=1 WHERE messages.MessageSerNum= " . $_GET["MessageSerNum"];
  $lookupResult = $conn->query($sqlLookup);
  if (!$lookupResult)
  {
  	if ($conn->connect_error) {
  	    die("<br>Connection failed: " . $conn->query_error);
  	}
  } else
  {
      echo "MessageRead";
  }
  $conn->close();
}
else
{
	exit();
}
?>
