<?php
//==================================================================================== 
// getCheckins.php - php code to query the Aria database and extract the list of patients
// who are currently checked in for open appointments today
//==================================================================================== 
include_once("credentials.php");

$link = mssql_connect(ARIA_DB, ARIA_USERNAME, ARIA_PASSWORD);


if (!$link) {
    die('Something went wrong while connecting to MSSQL');
}

$apptAriaSer = $_GET['AppointmentAriaSer'];
$sql = "
    use variansystem;
    SELECT DISTINCT
        pl.CheckedInFlag
    FROM
        PatientLocation pl
    WHERE
        pl.ScheduledActivitySer = $apptAriaSer
";

# Need to be sure that appointments are open*****

$query = mssql_query($sql);


/* Process results */
$json = array();

while($row = mssql_fetch_array($query)){
     $json[] = $row;
}

/* Run the tabular results through json_encode() */
/* And ensure numbers don't get cast to trings */
#echo json_encode($json,<code> JSON_NUMERIC_CHECK</code>);
echo json_encode($json);

/* Free statement and connection resources. */

if (!$query) {
    die('Query failed.');
}

// Free the query result
mssql_free_result($query);

?>


