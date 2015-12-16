<?php

if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);
include 'config.php';
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);

// Check connection
if ($conn->connect_error) {
    die("<br>Connection failed: " . $conn->connect_error);
}
echo($_POST['Alias']);
if(isset($_POST['Alias']))
{	
	$sqlLookupAlias="
	SELECT *
	FROM
	Patient
	WHERE
	Alias='".$_POST['Alias']."' LIMIT 1
";
 $lookupResultAlias = $conn->query($sqlLookupAlias);
if ($lookupResultAlias->num_rows!==0) {
    echo 'true';
   }else{
   	echo 'false';
   }
}else{
	echo 'false';
}
$conn->close();
exit();
?>