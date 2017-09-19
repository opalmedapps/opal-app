<?php
require('./password_compat/lib/password.php');
if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);
if ( isset($_POST["DoctorSerNum"])) {
	$SearchCondition="PatientDoctor.DoctorSerNum = " . $_POST["DoctorSerNum"];
  $fieldToChange=$_POST["field"];
  $sqlLookup="
    UPDATE Doctor
    SET Doctor." . $fieldToChange . "=" ."'". $_POST["newValue"]."'". " WHERE Doctor.DoctorSerNum=" . $_POST["DoctorSerNum"].";";
}else if ( isset($_POST["AdminSerNum"])) {
  $fieldToChange=$_POST["field"];
  $sqlLookup="
    UPDATE Admin
    SET Admin." . $fieldToChange . "=" . "'".$_POST["newValue"]."'"." WHERE Admin.AdminSerNum=" . $_POST["AdminSerNum"].";";
}else if(isset($_POST["StaffSerNum"]))
{
 $fieldToChange=$_POST["field"];
 $sqlLookup="
    UPDATE Staff
    SET Staff." . $fieldToChange . "=" ."'". $_POST["newValue"]."'". " WHERE Staff.StaffSerNum=" . $_POST["StaffSerNum"].";";
}else if(isset($_POST["UserSerNum"]))
{
	if($_POST["field"]=='Password')
	{
		$fieldToChange=$_POST["field"];
		$sqlLookup="
			UPDATE Users
			SET Users." . $fieldToChange . "='" . password_hash($_POST["newValue"],PASSWORD_DEFAULT)."'". " WHERE Users.UserSerNum=" . $_POST["UserSerNum"].";";
	}else{
		$fieldToChange=$_POST["field"];
		$sqlLookup="
			UPDATE Users
			SET Users." . $fieldToChange . "='" . $_POST["newValue"]."'". " WHERE Users.UserSerNum=" . $_POST["UserSerNum"].";";
	}

}
if(isset($sqlLookup))
{
	// Create DB connection
	include 'config.php';
	$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
	// Check connection
	if ($conn->connect_error) {
	    die("<br>Connection failed: " . $conn->connect_error);
	}

	$lookupResult = $conn->query($sqlLookup);
	// If patientId doesn't already exist , Register the patient
	if (!$lookupResult)
	{
		if ($conn->connect_error) {
		    die("<br>Connection failed: " . $conn->query_error);
		}
	} else
	{
		echo 'Update Complete';
	}
	$conn->close();
}


?>
