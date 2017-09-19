<?php
$query="SELECT * FROM PatientMH WHERE PatientRevSerNum+1=(SELECT PatientRevSerNum FROM PatientMH WHERE SessionId='"+$_POST['SessionId']+"') OR SessionId='"+$_POST['SessionId']+"';";
echo $query;
?>