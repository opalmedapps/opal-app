<?php
if ( isset($_GET["Username"]) && isset($_GET["Password"]) && isset($_GET["FirstName"]) && isset($_GET["LastName"]))
{
  // Create DB connection
  include 'config.php';
  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
  // Check connection
  if ($conn->connect_error) {
      die("<br>Connection failed: " . $conn->connect_error);
  }
  $fullName=$_GET["LastName"]  ;
  $firstSQL="
  INSERT INTO resource (ResourceSerNum,ResourceAriaSer,ResourceName,LastUpdated) VALUES ( NULL ,0 , ".$fullName.",CURRENT_TIMESTAMP)";
  $secondSQL="
  SELECT resource.ResourceSerNum FROM resource WHERE  resource.ResourceName LIKE ".$_GET["LastName"];

  $firstResult = $conn->query($firstSQL);
  // If patientId doesn't already exist , Register the patient
  if (!$firstResult)
  {
  	if ($conn->connect_error) {
  	    die("<br>Connection failed: " . $conn->query_error);
  	}
  } else
  {
      // We need Resource ARIASER if the admins are going to have one in ARIA too ?!
      $secondResult=$conn->query($secondSQL);
      $json = array();
      if (!$secondResult)
      {
      	if ($conn->connect_error) {
      	    die("<br>Connection failed: " . $conn->query_error);
      	}
      } else
      {
        if ($secondResult->num_rows===0) { echo 'NoResourceFound';}
        else
        {
          while($row = $secondResult->fetch_assoc())
            {
                $json[] = $row;
            }
            $objectResult=json_decode(json_encode($json));
            $LastSerNum= $objectResult['0']->ResourceSerNum;
            $thirdSQL="
            INSERT INTO admin (AdminSerNum,ResourceSerNum,FirstName,LastName,Username,Password) VALUES ( NULL ,".$LastSerNum." , ".$_GET["FirstName"].",".$_GET["LastName"].",".$_GET["Username"].",".$_GET["Password"].")";
            $thirdResult = $conn->query($thirdSQL);
            if (!$thirdResult)
            {
            	if ($conn->connect_error) {
            	    die("<br>Connection failed: " . $conn->query_error);
            	}
            } else
            {
             echo 'AdminCreated';
            }
        }
      }


  }
  $conn->close();
}
else
{
	exit();
}
?>
