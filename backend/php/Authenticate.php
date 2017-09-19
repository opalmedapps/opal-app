<?php
require('./password_compat/lib/password.php');

if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);


if ( isset($_POST["Username"]) && isset($_POST["Password"]))
{

  include 'config.php';
  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);  // Check connection
  if ($conn->connect_error) {
      die("<br>Connection failed: " . $conn->connect_error);
  }

  $sqlFindUser="SELECT * FROM Users WHERE Username='".($_POST["Username"])."'";


  $json=array();

  $lookupUser = $conn->query($sqlFindUser);
  // If patientId doesn't already exist , Register the patient
  if (!$lookupUser)
  {
    
   if ($conn->connect_error)
   {
       die("<br>Connection failed: " . $conn->query_error);
   }
  } else
  {

       if ($lookupUser->num_rows===0) {
         echo "User not found";
       }else{
         $row = $lookupUser->fetch_assoc();
         if (!password_verify($_POST["Password"] ,$row['Password']))
         {
           echo 'Invalid Password';
           exit();
         }else{
           if($row['UserType']=='Admin')
           {

             $searchQuery="AdminSerNum= ".$row['UserTypeSerNum'];
             $searchTable="Admin";
           }
           else if($row['UserType']=='Doctor')
           {
             $searchQuery="DoctorSerNum= ".$row['UserTypeSerNum'];
             $searchTable="Doctor";
           }else{
              $searchQuery="StaffSerNum= ".$row['UserTypeSerNum'];
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
