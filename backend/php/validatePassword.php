<?php
require('./password_compat/lib/password.php');

if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);
if ( isset($_POST["Username"]) && isset($_POST["Password"])) {
// Create DB connection
include 'config.php';
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
if ($conn->connect_error) {
    die("<br>Connection failed: " . $conn->connect_error);
}

$query="SELECT Password FROM Users WHERE Username LIKE '".$_POST["Username"]."'";
	$result=$conn->query($query);
if (!$result)
 {
  	if ($conn->connect_error) {
  	    die("<br>Connection failed: " . $conn->query_error);
  	}
}else{
	if ($result->num_rows===0) { 
		echo 'UserNotFound';
	}else{
		$row = $result->fetch_assoc();
		if(!password_verify($_POST["Password"] ,$row['Password']))
		{
			echo 'Incorrect Password';
		}else{
			echo 'Valid Password';
		}
	}
	$conn->close();
} 

}else{
	exit();
}


