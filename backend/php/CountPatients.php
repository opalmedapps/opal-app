<?php

if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);
$sqlLookup="";
if ( isset($_POST["DoctorSerNum"])) {
	$SearchCondition="PatientDoctor.DoctorSerNum = " . $_POST["DoctorSerNum"];
  $sqlLookup="
  	SELECT
  	count(*) as TotalNumberOfDoctorPatients
  	FROM
    PatientDoctor
  	WHERE " . $SearchCondition;
    $flagDoctor=true;

}else{
  $flagDoctor=false;
}
  $sqlLookupAll="
    SELECT
      count(*) as TotalNumberOfPatients
    FROM
      Patient";


// Create DB connection
include 'config.php';
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
// Check connection
if ($conn->connect_error) {
    die("<br>Connection failed: " . $conn->connect_error);
}


$json = array();
$lookupResult = $conn->query($sqlLookup);
$lookupResultAll=$conn->query($sqlLookupAll);

if (!$lookupResultAll)
{
	if ($conn->connect_error) {
	    die("<br>Connection failed: " . $conn->query_error);
	}
} else
{
	if ($lookupResultAll->num_rows===0) { $json[]='No specific patients using the App';}
	else
	{
		/*while($row = $lookupResult->fetch_assoc())
			{
					$json[] = $row;
			}*/
      while($row = $lookupResultAll->fetch_assoc())
  			{
  					$json[] = $row;
  			}
        if(!$flagDoctor)
        {
          echo json_encode($json);
        }
	}
}
if (!$lookupResult)
{
	if ($conn->connect_error) {
	    die("<br>Connection failed: " . $conn->query_error);
	}
} else
{
	if ($lookupResult->num_rows===0) { $json[]='No specific patients using the App';}
	else
	{
		/*while($row = $lookupResult->fetch_assoc())
			{
					$json[] = $row;
			}*/
      while($row = $lookupResult->fetch_assoc())
  			{
  					$json[] = $row;
  			}
        echo json_encode($json);
	}
}
$conn->close();
?>
