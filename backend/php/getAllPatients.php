<?php
include 'config.php';

if ( isset($_GET["DoctorSerNum"])||isset($_GET["AdminSerNum"]))
{
	$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB); 
	  // Check connection
	  if ($conn->connect_error) {
	      die("<br>Connection failed: " . $conn->connect_error);
	  }


	if(isset($_GET["DoctorSerNum"]))
	{
		$json=array();
	  $sqlLookup="
	   SELECT
		Patient.PatientId,
		Patient.PatientSerNum,
		Patient.PatientAriaSer,
		Patient.FirstName,
		Patient.LastName,
		Patient.Email,
		Patient.SSN,
		Patient.ProfileImage
		FROM
		Patient,
		PatientDoctor
		WHERE
	    PatientDoctor.DoctorSerNum=" . ($_GET["DoctorSerNum"])." AND PatientDoctor.PatientSerNum=Patient.PatientSerNum";
	    $lookupResult = $conn->query($sqlLookup);
	    if (!$lookupResult)
		{
			if ($conn->connect_error) {
	    		die("<br>Connection failed: " . $conn->query_error);
			}
		}else if($lookupResult ->num_rows===0){
              echo 'No Users!';
      	}else{
      	   while($row = $lookupResult ->fetch_assoc())
           {
               $json[] = $row;
           }
           echo json_encode($json);



      	}
	}else if(isset($_GET["AdminSerNum"]))
	{
		$json=array();
		$sqlLookup="
	   SELECT
		*
		FROM
		Patient";

		$lookupResult = $conn->query($sqlLookup);

	    if (!$lookupResult)
		{

			if ($conn->connect_error) {
	    		die("<br>Connection failed: " . $conn->query_error);
			}
		}else if($lookupResult ->num_rows===0){
              echo 'No Users!';
      	}else{
      	   while($row = $lookupResult ->fetch_assoc())
           {
               $json[] = $row;
           }
           echo json_encode($json);
      	}
	}
	$conn->close();
}else{

	echo "No parameters set!";
}
?>
