<?php
//==================================================================================== 
// checkInPatient.php - php code to check a patient into Aria 
//==================================================================================== 
include_once("config_screens.php");

$link = mssql_connect(ARIA_DB, ARIA_USERNAME, ARIA_PASSWORD);

// Extract the webpage parameters
$CheckinVenue = $_GET["CheckinVenue"];
$ScheduledActivitySer= $_GET["ScheduledActivitySer"];
$location= $_GET["location"];

if (!$link) {
    die('Something went wrong while connecting to MSSQL');
}

$sql = "
declare @var INT

SET @var = (SELECT 
Venue.ResourceSer AS ResourceSer
FROM
variansystem.dbo.Venue Venue
WHERE 
Venue.VenueId='$CheckinVenue')

exec variansystem.dbo.vp_CheckInPatient @nVenueLocationSer = @var, @nScheduledActivitySer = $ScheduledActivitySer, @strComment = null, @strHstryUserName=N'DS1_1' 

";

#echo "SQL: $sql<br>";

$query = mssql_query($sql);
echo $sql;
exit();
/* Process results */
$row = mssql_fetch_array($query);
echo json_encode($row);

if (!$query) {
    die('Query failed.');
}

// Free the query result
mssql_free_result($query);

?>


