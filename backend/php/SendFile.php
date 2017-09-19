<?php
 //var_dump($_FILES);
if(isset($_FILES['file']))
{
    $message = $_POST['message'];
    $SenderSerNum=$message[0];
    $ReceiverSerNum=$message[1];
    $MessageContent=$message[2];
    $errors= array();
    $file_name = $_FILES['file']['name'];
    $file_size =$_FILES['file']['size'];
    $file_tmp =$_FILES['file']['tmp_name'];
    $file_type=$_FILES['file']['type'];
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    $extensions = array("jpeg","jpg","png","pdf");
    if(in_array($file_ext,$extensions )=== false){
         $errors[]="image extension not allowed, please choose a JPEG or PNG file.";
    }
    if($file_size > 2097152){
        $errors[]='File size cannot exceed 2 MB';
    }
    if(empty($errors)==true)
    {
        $destination="PatientFiles/". $ReceiverSerNum. "/" . "Attachments/" .$file_name;
        move_uploaded_file($file_tmp,$destination);
        include 'config.php';
        $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
        // Check connection
        if ($conn->connect_error)
        {
            die("<br>Connection failed: " . $conn->connect_error);
        }
        $sqlLookup="
        INSERT INTO messages (MessageSerNum,SenderRole,ReceiverRole,SenderSerNum,ReceiverSerNum,MessageContent,Attachment,ReceiverReadStatus,MessageDate,LastUpdated)
        VALUES  (NULL,'Admin','Patient','".$SenderSerNum."','".$ReceiverSerNum."','".$MessageContent."','".$destination."','0',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)";
        //echo $sqlLookup;
        $lookupResult = $conn->query($sqlLookup);
        if (!$lookupResult)
        {
        	if ($conn->connect_error)
            {
        	    die("<br>Connection failed: " . $conn->query_error);
        	   }
        } else
        {
            echo "MessageSent";
        }
        $conn->close();

        echo " uploaded file: " . "images/" . $file_name;
    }else
    {
        print_r($errors);
    }
}
else{
    $errors= array();
    $errors[]="No image found";
    print_r($errors);
}
?>
