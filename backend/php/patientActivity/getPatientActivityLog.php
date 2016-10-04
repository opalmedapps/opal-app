<?php
	if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);
	include '../config.php';
	  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);  // Check connection
	  if ($conn->connect_error) {
	      die("<br>Connection failed: " . $conn->connect_error);
	  }
	  mysqli_set_charset($conn,"utf8");
	$filter=1;
	$username=1;

	if ( isset($_POST["StartDate"])&&isset($_POST["EndDate"]))
	{	
		$filter="DateTime BETWEEN '".$_POST["StartDate"]."' AND '".$_POST["EndDate"]."'";	
	}
	if(isset($_POST["Username"]))
	{
		$username="Username LIKE '".$_POST["Username"]."'";
	}

	
	$query="SELECT Patient.PatientId,Patient.SSN, Patient.PatientAriaSer, Patient.Email, PatientActivityLog.SessionId, PatientActivityLog.DateTime, PatientActivityLog.Request, PatientActivityLog.DeviceId, Patient.FirstName, Patient.LastName FROM PatientActivityLog, Users,  Patient WHERE ".$filter." AND ".$username." AND PatientActivityLog.Username LIKE Users.Username AND Patient.PatientSerNum=Users.UserTypeSerNum AND Users.UserType='Patient' ORDER BY DateTime ASC;";
	$queryResults = $conn->query($query);
	if($queryResults->num_rows===0)
	{

		echo 'No activity found';
	}else{
		$json=array();
		while($row = $queryResults->fetch_assoc())
	    {
	        $json[] = $row;
	    }
	    echo json_encode($json);   
	}





?>