<?php

  // Create DB connection
  include '../config.php';
  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);  // Check connection
  if ($conn->connect_error) {
      die("<br>Connection failed: " . $conn->connect_error);
  }
   mysqli_set_charset($conn,"utf8");
  $sqlLookup="SELECT EducationalMaterialControl.EducationalMaterialControlSerNum, EducationalMaterialControl.EducationalMaterialType_EN, EducationalMaterialControl.Name_EN as EducationalMaterialName, EducationalMaterialControl.ShareURL_EN, EducationalMaterialControl.URL_EN, EducationalMaterialControl.PhaseInTreatmentSerNum, PhaseInTreatment.Name_EN as PhaseName, AVG( EducationalMaterialRating.RatingValue ) as AverageRating, COUNT(*) as TotalNumber 
	FROM EducationalMaterialRating, EducationalMaterialControl, PhaseInTreatment
	WHERE PhaseInTreatment.PhaseInTreatmentSerNum = EducationalMaterialControl.PhaseInTreatmentSerNum
	AND EducationalMaterialControl.EducationalMaterialControlSerNum = EducationalMaterialRating.EducationalMaterialControlSerNum
GROUP BY EducationalMaterialControlSerNum";
  $lookupResult = $conn->query($sqlLookup);
  // If patientId doesn't already exist , Register the patient
  $json = array();
  if (!$lookupResult)
  {
  	if ($conn->connect_error) {
  	    die("<br>Connection failed: " . $conn->query_error);
  	}
  } else
  {
    if ($lookupResult->num_rows===0) { echo 'NoEducationalFeedbackFound';}
    else
    {
      while($row = $lookupResult->fetch_assoc())
        {
            $json[] = $row;
        }
        echo json_encode($json);
    }
  }
  $conn->close();
