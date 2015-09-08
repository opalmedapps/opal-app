<?php
if ( isset($_GET["Username"]) && isset($_GET["Password"]))
{
  include 'config.php';
  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
  // Check connection
  if ($conn->connect_error) {
      die("<br>Connection failed: " . $conn->connect_error);
  }
  $json=array();
  $sqlLookup="
   SELECT
   AdminSerNum,
   FirstName,
   LastName,
   Password
   FROM
   Admin
   WHERE Username=" . ($_GET["Username"]) ;
  $lookupResult = $conn->query($sqlLookup);
  // If patientId doesn't already exist , Register the patient
  if (!$lookupResult)
  {
   if ($conn->connect_error)
   {
       die("<br>Connection failed: " . $conn->query_error);
   }
  } else
  {
   if ($lookupResult->num_rows===0) { echo 'UserNotFound';}
   else
   {
     while($row = $lookupResult->fetch_assoc())
       {
           $json[] = $row;
       }
       $objectResult=json_decode(json_encode($json));
       $Password= $objectResult['0']->Password;
       if ($Password == $_GET["Password"] )
       {
         echo json_encode($objectResult['0']);
       }
       else
       {
         echo "InvalidCredentials";
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
