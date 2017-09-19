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
    Messages.MessageSerNum,
    Messages.SenderRole,
    Messages.ReceiverRole,
    Messages.SenderSerNum,
    Messages.ReceiverSerNum,
    Messages.MessageContent,
    Messages.Attachment,
    Messages.ReadStatus,
    Messages.MessageDate
    FROM
    Messages
    WHERE
      (Messages.SenderRole='Doctor' AND Messages.SenderSerNum=" . ($_GET["DoctorSerNum"]).") OR (Messages.ReceiverRole='Doctor' AND Messages.ReceiverSerNum=" . ($_GET["DoctorSerNum"]).")";


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
    Messages.MessageSerNum,
    Messages.SenderRole,
    Messages.ReceiverRole,
    Messages.SenderSerNum,
    Messages.ReceiverSerNum,
    Messages.MessageContent,
    Messages.Attachment,
    Messages.ReadStatus,
    Messages.MessageDate
    FROM
    Messages
    WHERE
      (Messages.SenderRole='Admin' AND Messages.SenderSerNum=" . ($_GET["AdminSerNum"]).") OR (Messages.ReceiverRole='Admin' AND Messages.ReceiverSerNum=" . ($_GET["AdminSerNum"]).")";

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
