<?php
// Connection to MySQL in order to remove user
if (!isset($_GET["PatientId"]))
{
	exit();
}
// Connect to MySQL and remove the patient with the specific PatientID
include 'config.php';
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);

if ($conn->connect_error)
{
	die("Connection Failed : " . $conn->connect_error );
}
$sql="
	DELETE FROM Patient WHERE PatientId=" . $_GET["PatientId"];
$deleteResult= $conn->query($sql);
if ($deleteResult)
{
 echo "Patient was successfully removed.";
}else
{
echo  "There was a problem with server. Please try again later!";
}
$conn->close();
?>
