<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);
include 'config.php';
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);  // Check connection
if ($conn->connect_error) {
  die("<br>Connection failed: " . $conn->connect_error);
}
if($_POST['UserType']=='Admin')
{
	$searchQuery="AdminSerNum= ".$_POST['UserTypeSerNum'];
	$searchTable="Admin";
}
else if($_POST['UserType']=='Doctor')
{
$searchQuery="DoctorSerNum= ".$_POST['UserTypeSerNum'];
$searchTable="Doctor";
}else{
$searchQuery="StaffSerNum= ".$_POST['UserTypeSerNum'];
$searchTable="Staff";
}

$sqlQuery="
SELECT
*
FROM ".$searchTable."
WHERE ".$searchQuery;
$lookupInfoUser=$conn->query($sqlQuery);

if(!$lookupInfoUser){

	if ($conn->connect_error)
	{
   		die("<br>Connection failed: " . $conn->query_error);
	}
}else{
while($row = $lookupInfoUser->fetch_assoc())
{
 $json[] = $row;
}
echo json_encode($json[0]);

}
