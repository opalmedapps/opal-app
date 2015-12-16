<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);
if ( isset($_POST["PatientSerNum"])) {
	$SearchCondition="diagnosis.PatientSerNum = " . $_POST["PatientSerNum"];
}
else
{
	exit();
}

// Create DB connection
include 'config.php';
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
// Check connection
if ($conn->connect_error) {
    die("<br>Connection failed: " . $conn->connect_error);
}

$sqlLookup="
SELECT
Diagnosis.DiagnosisAriaSer,
Diagnosis.Description_EN,
Diagnosis.CreationDate
FROM
Diagnosis
WHERE ".$SearchCondition;

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
	if ($lookupResult->num_rows===0) { echo 'No diagnoses found!';}
	else
	{
		while($row = $lookupResult->fetch_assoc())
			{
				echo var_dump($row);
					$json[] = $row;
			}
			echo json_encode($json);
	}
}
$conn->close();
?>
