    <?php

// Parse the Parameters
//$Data=file_get_contents("php://input");
//$request=json_decode($Data);
include "config.php";
if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);
$PatientSSN=$_POST["PatientSSN"];
//echo "$_POST[patientId]";
//Extract the exact data needed for the query

$link = mssql_connect(ARIA_DB, ARIA_USERNAME, ARIA_PASSWORD);

if (!$link) {
    die('Unable to connect or select database!');
}
// Query the appointments associated with the specific patient.
$sql ="SELECT Patient.PatientSer, Patient.LastName AS PatientLastName, Patient.FirstName AS PatientFirstName, Photo.Picture, Patient.SSN, Patient.PatientId FROM variansystem.dbo.Patient Patient LEFT JOIN variansystem.dbo.Photo Photo ON  Photo.PatientSer = Patient.PatientSer WHERE Patient.SSN LIKE '%".$PatientSSN."%';";

// SELECT DISTINCT 
//      Patient.PatientSer, 
//  	 Patient.LastName AS PatientLastName, 
// 	 Patient.FirstName AS PatientFirstName, 
// 	 Doctor.FirstName AS DoctorFirstName, 
// 	 Doctor.LastName AS DoctorLastName, 
// 	 PatientDoctor.PrimaryFlag, 
// 	 PatientDoctor.OncologistFlag, 
//      Photo.Picture, 
// 	 Patient.SSN, 
// 	 Patient.PatientId, 
// 	 Diagnosis.Description 
// 	 FROM 
// 	 variansystem.dbo.Patient Patient, 
//      variansystem.dbo.Photo Photo, 
// 	 variansystem.dbo.Diagnosis Diagnosis, 
// 	 variansystem.dbo.PatientActuals PatientActuals, 
// 	 variansystem.dbo.PatientDoctor PatientDoctor, 
// 	 variansystem.dbo.Doctor Doctor
// 	 WHERE 
// 	 Patient.SSN LIKE '%".$PatientSSN."%' 
//      AND Photo.PatientSer = Patient.PatientSer 
// 	 AND Patient.SSN=PatientActuals.SSN 
// 	 AND PatientActuals.PatientSer=Diagnosis.PatientSer 
// 	 AND PatientActuals.PatientSer=PatientDoctor.PatientSer 
// 	 AND Doctor.ResourceSer=PatientDoctor.ResourceSer 
// ";
if (isset($PatientSSN) ){

    $all = MSSQL_Query($sql);
}
// put all the rows acquired in a json array and send them back
//if isset($PatientSSN) { $query=mssql_query($sql); }
if (mssql_num_rows($all)==0) { echo "PatientNotFound"; }
else {
    $json= array();
    while ($row=mssql_fetch_array($all,MSSQL_ASSOC))
    {
        $row["Picture"] = base64_encode($row["Picture"]);
    	$json[]=$row;
        
    }
    //Prepare JSON output and extract PatientId for lookup in mySQL
    $PatientId=$json[0]["PatientId"]; 
    //echo json_encode(utf8_encode($json[0]["Picture"]));
    $patientData= json_encode($json);
    // Query mySQL to see if the patient is already registered
    $conn=new mysqli("localhost","root","service","QPlusApp");
    if ($conn->connect_error)
    {
    	die("Connection Failed : " . $conn->connect_error );
    }
    $sqllookup="
    	SELECT *  FROM Patient WHERE PatientId='".$PatientId."' LIMIT 1
     ";

    $lookupresult= $conn->query($sqllookup);
    if ( $lookupresult->num_rows===1) {
        $row=$lookupresult->fetch_assoc();
        $row['response']="PatientAlreadyRegistered";
        echo json_encode($row);

    }
    else {echo $patientData;}
}
if (!$all)
{
die('Query Failed!');
}
// Clean up
mssql_free_result($all);
function utf8ize($d) {
    if (is_array($d)) {
        foreach ($d as $k => $v) {
            $d[$k] = utf8ize($v);
        }
    } else if (is_string ($d)) {
        return utf8_encode($d);
    }
    return $d;
}
?>
