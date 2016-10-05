<?php
	if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);
	if ( isset($_POST["SessionId"]))
	{	
		include '../config.php';
		$con = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);  // Check connection
		if ($con->connect_error) {
		      die("<br>Connection failed: " . $conn->connect_error);
		}else{
			
			//MessagesMH query
			$query="SELECT * FROM MessagesMH WHERE ( MessageRevSerNum +1 IN ( SELECT MessageRevSerNum FROM MessagesMH WHERE SessionId = '".$_POST['SessionId']."' ) AND MessageSerNum IN ( SELECT MessageSerNum FROM MessagesMH WHERE SessionId = '".$_POST['SessionId']."' ) ) OR SessionId = '".$_POST['SessionId']."';";
			//$query="SELECT `MessageSerNum`, `MessagesRevSerNum`, `SessionId`, `SenderRole`, `ReceiverRole`, `SenderSerNum`, `ReceiverSerNum`, `MessageContent`, `ReadStatus`, `Attachment`, `MessageDate`, `LastUpdated` FROM `MessagesMH` WHERE `SessionId` ='".$_POST['SessionId']."';";
			$query.= "SELECT * FROM Feedback WHERE SessionId ='".$_POST["SessionId"]."';";			
			//DocumentMH query
			$query.="SELECT * FROM DocumentMH WHERE DocumentRevSerNum+1=(SELECT DocumentRevSerNum FROM DocumentMH WHERE SessionId='".$_POST['SessionId']."') OR SessionId='".$_POST['SessionId']."';";
			//$query.="SELECT * FROM  `PatientMH` AS user LEFT JOIN PatientMH AS parent ON ((user.PatientRevSerNum-1!=0) AND (user.PatientRevSerNum -1) = parent.PatientRevSerNum AND user.PatientSerNum = parent.PatientSerNum ) WHERE user.SessionId = '".$_POST['SessionId']."';";
			$query.="SELECT * FROM PatientMH WHERE (PatientRevSerNum+1 IN (SELECT PatientRevSerNum FROM PatientMH WHERE SessionId='".$_POST['SessionId']."') AND PatientSerNum IN (SELECT PatientSerNum FROM PatientMH WHERE SessionId='".$_POST['SessionId']."'))OR SessionId='".$_POST['SessionId']."';";
			$query.="SELECT * FROM UsersMH WHERE (UserRevSerNum+1=(SELECT UserRevSerNum FROM UsersMH WHERE SessionId='".$_POST['SessionId']."') AND UserTypeSerNum IN (SELECT UserTypeSerNum FROM UsersMH WHERE SessionId='".$_POST['SessionId']."' ))OR SessionId='".$_POST['SessionId']."';";
			$query.="SELECT * FROM AppointmentMH WHERE (AppointmentRevSerNum+1=(SELECT AppointmentRevSerNum FROM AppointmentMH WHERE SessionId='".$_POST['SessionId']."') AND AppointmentSerNum IN (SELECT AppointmentSerNum FROM AppointmentMH WHERE SessionId='".$_POST['SessionId']."')) OR SessionId='".$_POST['SessionId']."';";
			$fieldsArray=array('MessagesMH','Feedback','DocumentMH','PatientMH','UsersMH','AppointmentMH');
	 		$index=0;
	 		
			$patientDataArray=array();
			if (mysqli_multi_query($con,$query))
			{
			  do
			    {
			    // Store first result set
			    if ($result=mysqli_store_result($con)) {
			      // Fetch one and one row
			    	$json=array();
			      while ($row=mysqli_fetch_assoc($result))
			        {
			       		$json[]=$row;
			        }
			        $patientDataArray[$fieldsArray[$index]]=$json;

			        //Checking for the  last table query to spit the data.
			        if($fieldsArray[$index]=='AppointmentMH')
			       	{
						echo json_encode($patientDataArray);
			       	}
			       $index++;
			      // Free result set
			      mysqli_free_result($result);
			      }
			    }
			  while (mysqli_next_result($con));
			}else{
				echo 'error';
			}
		}
	}else{
		
		exit();
	}


	


	


?>