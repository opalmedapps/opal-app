<?php
$FirstName='David';
$LastName="Herrera";
$PatientSerNum=2;
$PatientId=4123;
$TelNumForSMS=1212312;
$EnableSMS=1;
$Email="da@gmail.com";
$Language='EN';
$loginID="asdajlk-asdasf-as";
$SSN=asdasdasdasda;
$sqlInsert="INSERT INTO `Patient`(`PatientSerNum`, `PatientAriaSer`, `PatientId`, `FirstName`, `LastName`, `ProfileImage`, `TelNum`, `EnableSMS`, `Email`, `Language`, `SSN`, `LastUpdated`) VALUES (NULL,".$PatientSerNum.",".$PatientId.","."'".$FirstName."','".$LastName."',NULL,".$TelNumForSMS.",".$EnableSMS.",'".$Email."','".$Language."','".$SSN."', NULL)";
echo $sqlInsert;
$UserSerNum=55;
$sqlGetUserSerNum="SELECT LAST_INSERT_ID();";
$sql="INSERT INTO `Users` (`UserSerNum`, `UserType`, `UserTypeSerNum`, `Username`, `Password`) VALUES (NULL,'Patient',".$UserSerNum.",'".$loginID."',NULL)";
echo $sql;
 ?>
