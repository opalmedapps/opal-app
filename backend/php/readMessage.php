<?php
	if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);
if ( isset($_POST["MessageSerNum"]))
{

  include 'config.php';
  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);  // Check connection
  if ($conn->connect_error) {
      die("<br>Connection failed: " . $conn->connect_error);
  }

  $sqlFindUser="UPDATE `Messages` SET `ReadStatus`= 1 WHERE `MessageSerNum`=".$_POST['MessageSerNum'].";";
  $lookupUser = $conn->query($sqlFindUser);
  if(!$lookupUser)
  {
  	echo -1;
  }else{
  	echo 1;
  }
}

?>