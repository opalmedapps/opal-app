<?php
include 'config.php';
if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);
if ( isset($_POST["Username"]))
{
  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
    // Check connection
  if ($conn->connect_error) {
      die("<br>Connection failed: " . $conn->connect_error);
  }
  $sqlLookup="
  SELECT * FROM Users WHERE Username LIKE '".$_POST["Username"]."'";
  $lookupResult = $conn->query($sqlLookup);
  if (!$lookupResult)
  {
  	if ($conn->connect_error) {
  	    die("<br>Connection failed: " . $conn->query_error);
  	}
  } else
  {
    while($row = $lookupResult->fetch_assoc())
      {
          $json[] = $row;
      }
      echo json_encode($json[0]);
  }
  $conn->close();
}
else
{
	exit();
}
?>
