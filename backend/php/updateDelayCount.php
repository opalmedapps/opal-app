<?php
/**
 * Created by Wen Quan Li, wenquan97@gmail.com
 * Utility: To update the delay table daily on OpalDB
 * Date: 2017-06-30
 * Time: 12:19 PM
 * Utility: This script extracts data from hospital's database (Table medivisitappointmentlist and patientlocationmh)
 * and compute delay count by category. It then puts the result into OpalDB (Table appointmentdelay).
 */
// Create DB connection, it needs to be linked to hospital database (MYSQL_DB) and OpalDB (MYSQL_DB2) here.
include 'config.php';
//This is to check if the server has mysqli at least, can be removed
if (!function_exists('mysqli_init') && !extension_loaded('mysqli')) {
    echo 'We don\'t have mysqli!!!';
} else {
    echo 'Phew we have mysqli! ';
}

//Establish connection
$conn = new mysqli("localhost", ARIA_USERNAME, ARIA_PASSWORD, ARIA_DB);
$conn2 = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);
// Check connection
if ($conn->connect_error) {
    die("<br>Connection failed with HospitalDB: " . $conn->connect_error);
}
if ($conn2->connect_error) {
    die("<br>Connection failed with OpalDB: " . $conn2->connect_error);
}
$status = 'Started';

//Cron Log table to record history of updates
$sqlLogTable="
CREATE TABLE IF NOT EXISTS`CronDelayLog` (
  `Date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `Status` varchar(30) NOT NULL,
  `ID` int(10) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1;
";
$cronTableResult = $conn2->query($sqlLogTable);
$sqlDelayLog="
INSERT INTO `CronDelayLog` (`Status`) VALUES
('$status')
";
$updateLogResult = $conn2->query($sqlDelayLog);
if(!$cronTableResult or !$updateLogResult){
    echo 'Problem with Updating Cron Table'. $conn2->error;
}

//Get all the types of appointment that exist up to now (can be changed to all types in the past 100 days)
$sqlType="
SELECT `AppointmentCode` FROM medivisitappointmentlist GROUP BY `AppointmentCode`
";
$result=$conn->query($sqlType);
if (!$result) {
    die('Cannot extract treatment types: ' . $conn->error);
}
$index = 0;
$yourArray = array();
while($row = mysqli_fetch_row($result)){ // loop to store the data in an array.
    $yourArray[$index] = $row[0];
    $index++;
}

//drop existing table and create the new table with updated types and data
$sqlDrop="DROP TABLE IF EXISTS `appointmentdelay`;";
$dropResult = $conn2->query($sqlDrop);
$sqlLookup="
CREATE TABLE `appointmentdelay` (
  `Type` varchar(30) NOT NULL,
  `Hour` int(2) NOT NULL,
  `Weekday` int(1) NOT NULL,
  `Count0` int(8) NOT NULL,
  `Count15` int(8) NOT NULL,
  `Count30` int(8) NOT NULL,
  `Count45` int(8) NOT NULL,
  `ID` int(5) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1;
";
$lookupResult = $conn2->query($sqlLookup);
if (!$lookupResult){die('Failing to create table: '. $conn->error);}

//Fill the table with good data
for ($type = 0; $type < $index ; $type++) {
    for ($hour = 0; $hour <= 4; $hour++) {
        switch ($hour) {
            case 0:
                $hour1 = 8;
                $hour2 = 9;
                break;
            case 1:
                $hour1 = 10;
                $hour2 = 11;
                break;
            case 2:
                $hour1 = 12;
                $hour2 = 13;
                break;
            case 3:
                $hour1 = 14;
                $hour2 = 15;
                break;
            case 4:
                $hour1 = 15;
                $hour2 = 16;
            break;
        }
        for ($day = 0; $day <=4; $day++) {
            $sqlCompute="
SELECT
COUNT(CASE WHEN b.delay<= '900' THEN b.delay ELSE NULL END) as count0,
COUNT(CASE WHEN b.delay<= '1800' AND b.delay> '900' THEN b.delay ELSE NULL END) as count15,
COUNT(CASE WHEN b.delay<= '2700' AND b.delay> '1800' THEN b.delay ELSE NULL END) as count30,
COUNT(CASE WHEN b.delay> '2700' THEN b.delay ELSE NULL END) as count45
FROM
(SELECT (CASE WHEN time_to_sec(timediff(a.ArrivalDateTime, a.ScheduledDateTime))>0 THEN time_to_sec(timediff(a.TreatmentTime, a.ArrivalDateTime)) ELSE time_to_sec(timediff(a.TreatmentTime, a.ScheduledDateTime)) END) as delay
FROM
(SELECT DISTINCT d.PatientSerNum, d.ScheduledDateTime, d.ArrivalDateTime, MIN(d.TreatmentTime) AS TreatmentTime, d.AppointmentSerNum
FROM 
(SELECT DISTINCT c.PatientSerNum, c.ScheduledDateTime, MIN(c.ArrivalDateTime) AS ArrivalDateTime, c.TreatmentTime, c.AppointmentSerNum
FROM
(SELECT Z.ScheduledDateTime, patientlocationmh.ArrivalDateTime AS ArrivalDateTime, t.ArrivalDateTime AS TreatmentTime, z.PatientSerNum, z.AppointmentSerNum
FROM
(SELECT *
FROM medivisitappointmentlist
WHERE medivisitappointmentlist.AppointmentCode='$yourArray[$type]' 
AND medivisitappointmentlist.Status='Completed'
AND TIMESTAMPDIFF(DAY, ScheduledDateTime, NOW())<100
AND weekday(medivisitappointmentlist.ScheduledDateTime)=$day
AND (hour(medivisitappointmentlist.ScheduledDateTime)=$hour1 or hour(medivisitappointmentlist.ScheduledDateTime)=$hour2) ) as z
INNER JOIN patientlocationmh
ON patientlocationmh.CheckinVenueName LIKE '%waiting%'
AND  patientlocationmh.AppointmentSerNum = z.AppointmentSerNum
INNER JOIN patientlocationmh t
ON (t.CheckinVenueName LIKE 'TX%' OR t.CheckinVenueName LIKE '%EXAM ROOM')
AND t.AppointmentSerNum = patientlocationmh.AppointmentSerNum)as c
GROUP BY PatientSerNum, ScheduledDateTime, TreatmentTime, AppointmentSerNum) as d
GROUP BY PatientSernum, ScheduledDateTime, ArrivalDateTime, AppointmentSerNum) as a) AS b
            ";
            $computeResult = $conn->query($sqlCompute);
            if (!$computeResult) {
                die('Failed to compute count: ' . $conn->error);
            }
            $row = mysqli_fetch_row($computeResult); // loop to store the data in an array.
            $sqlInsert="
INSERT INTO `appointmentdelay` (`Type`, `Hour`, `Weekday`, `Count0`, `Count15`, `Count30`, `Count45`) VALUES
('$yourArray[$type]','$hour','$day','$row[0]','$row[1]','$row[2]','$row[3]')
";
            $insertResult = $conn2->query($sqlInsert);
            if (!$insertResult) {
                die('Failed to insert data: ' . $conn2->error);
            }
        }
    }
}

//check if problems occurred
if (!$lookupResult or !$insertResult or !$result or !$dropResult)
{
    if ($conn->connect_error) {
        die("<br>Connection failed with HospitalDB: " . $conn->error);
    }
    elseif ($con2->connect_error) {
        die("<br>Connection failed with OpalDB: " . $conn2->error);
    }
    else{
        echo 'Problem with Update : HospitalDB'. $conn->error;
        echo 'Problem with Update : OpalDB'. $conn2->error;
    }
} else
{
    $status="Completed";
    echo 'Update Complete';
}

$sqlDelayLog="
INSERT INTO `CronDelayLog` (`Status`) VALUES('$status')";
$updateLogResult = $conn2->query($sqlDelayLog);
if(!$updateLogResult){
    echo 'Problem with Updating Cron Table'. $conn2->error;
}

$conn->close();
$conn2->close();
?>