<?php

/**
 * Patient class
 *
 */
class Patient {

    /**
     *
     * Updates the patient transfer flags in the database
     *
     * @param array $patientList : a list of patients
     */
    public function updatePatientTransferFlags( $patientList ) {

		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
			$connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
			foreach ($patientList as $patient) {
				$patientTransfer = $patient['transfer'];
				$patientSer = $patient['serial'];
				$sql = "
					UPDATE 
						PatientControl 	
					SET 
						PatientControl.PatientUpdate = $patientTransfer 
					WHERE 
						PatientControl.PatientSerNum = $patientSer
				";

				$query = $connect->prepare( $sql );
				$query->execute();
			}
		} catch( PDOException $e) {
			return $e->getMessage();
		}
    }

    /**
     *
     * Gets a list of existing patients in the database
     *
     * @return array
     */    
    public function getExistingPatients() {
        $patientList = array();
        try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
			$connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
			$sql = "
                SELECT DISTINCT
                    pc.PatientSerNum,
                    pc.PatientUpdate,
                    pt.FirstName,
                    pt.LastName,
                    pt.PatientId,
                    pc.LastTransferred
                FROM 
                    PatientControl pc,
                    Patient pt
                WHERE
                    pt.PatientSerNum = pc.PatientSerNum
            ";
			$query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {

                $patientArray = array(
                    'serial'            => $data[0],
                    'transfer'          => $data[1],
                    'name'              => "$data[2] $data[3]",
                    'patientid'         => $data[4],
                    'lasttransferred'   => $data[5]
                );

                array_push($patientList, $patientArray);
            }

            return $patientList;
		} catch (PDOException $e) {
			echo $e->getMessage();
			return $patientList;
		}
	}

}

?>


