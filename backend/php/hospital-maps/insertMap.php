<?php
	include('../lib/phpqrcode/qrlib.php'); 
	if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);
	$array=array();
	if ( isset($_POST["MapAliasName"]) && isset($_POST["MapName_EN"])&&isset($_POST["MapName_FR"])&&isset($_POST["MapDescription_EN"])&&isset($_POST["MapDescription_FR"])&&isset($_POST["MapUrl"]))
	{
		//$path to save image
		$path = 'qrCodes/'.$_POST['MapAliasName'].'.png';
		
		if(!file_exists($path))
		{
			QRcode::png($_POST['MapAliasName'],'qrCodes/'.$_POST["MapAliasName"].'.png');
			$type = pathinfo($path, PATHINFO_EXTENSION);
			$data = file_get_contents($path);
			$base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);

			$array['QRCode']=$base64;
		  	include '../config.php';
		  	$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);  // Check connection
		  	if ($conn->connect_error) {
		      die("<br>Connection failed: " . $conn->connect_error);
		  	}
		  	$query="INSERT INTO `HospitalMap`(`HospitalMapSerNum`, `MapUrl`, `QRMapAlias` , `QRImageFileName`,`MapName_EN`, `MapDescription_EN`, `MapName_FR`, `MapDescription_FR`, `LastUpdated`) VALUES (NULL,'".$_POST["MapUrl"]."','".$_POST['MapAliasName']."','".$path."','".$_POST["MapName_EN"]."','".$_POST["MapDescription_EN"]."','".$_POST["MapName_FR"]."','".$_POST["MapDescription_FR"]."',NULL)";
		  	$result=$conn->query($query);
		  	if($result)
		  	{
		  		$array['response']='Success';
		  		$array['responseObject']='Entry successfully created!';
		  	}else{
		  		$array['response']='Failure';
		  		$array['responseObject']='Query failed!';
		  	}
		  	echo json_encode($array);
		  	$conn->close();
		}else{
			$array['response']='Failure';
			$array['responseObject']='File name already exists!';
			
			echo json_encode($array);
		}
		
	}else{
		$array['response']='Failure';
		$array['responseObject']='Incomplete Form';
		echo json_encode($array);
		exit();
	}


?>