<?php

/**
 * Filter class
 *
 */
class Filter {

    /**
     *
     * Gets a list of possible filters 
     *
     * @return array
     */
    public function getFilters () {
        $filters = array(
            'expressions'   => array(),
            'dx'            => array(),
            'doctors'       => array(),
            'resources'     => array()
        );
        try {
            $aria_link = mssql_connect(ARIA_DB, ARIA_USERNAME, ARIA_PASSWORD);

			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
        
            $sql = "
                use variansystem;
                SELECT DISTINCT
                    vva.Expression1
                FROM   
                    vv_ActivityLng vva
                ORDER BY
                    vva.Expression1
            ";
            $query = mssql_query($sql);
            while ($data = mssql_fetch_array($query)) {
                $expressionArray = array(
                    'name'  => $data[0],
                    'id'    => $data[0],
                    'type'  => 'Expression',
                    'added' => 0
                );
                array_push($filters['expressions'], $expressionArray);
            }

            $dxTranslations = array();
            $sql = "
                SELECT DISTINCT
                    dt.AliasName
                FROM
                    DiagnosisTranslation dt
            ";
	        $query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

            while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {
                $dxArray = array(
                    'name'  => $data[0],
                    'id'    => $data[0],
                    'type'  => 'Diagnosis',
                    'added' => 0
                );

                array_push($filters['dx'], $dxArray);
            }

            $sql = "
                use variansystem;
                SELECT DISTINCT
                    Doctor.ResourceSer,
                    Doctor.LastName
                FROM
                    Doctor,
                    PatientDoctor
                WHERE 
                    PatientDoctor.PrimaryFlag       = 1
                AND PatientDoctor.OncologistFlag    = 1
                AND Doctor.OncologistFlag           = 1
                AND PatientDoctor.ResourceSer       = Doctor.ResourceSer

                ORDER BY
                    Doctor.LastName
            ";
            $query = mssql_query($sql);
            while ($data = mssql_fetch_array($query)) {
                $doctorArray = array(
                    'name'  => $data[1],
                    'id'    => $data[0],
                    'type'  => 'Doctor',
                    'added' => 0
                );
                array_push($filters['doctors'], $doctorArray);
            }

            $sql = "
                use variansystem;
                SELECT DISTINCT
                    vr.ResourceSer,
                    vr.ResourceName
                FROM    
                    vv_ResourceName vr
                WHERE
                    vr.ResourceName     LIKE 'STX%'
                OR  vr.ResourceName     LIKE 'TB%'

                ORDER BY 
                    vr.ResourceName
            ";
            $query = mssql_query($sql);
            while ($data = mssql_fetch_array($query)) {
                $resourceArray = array(
                    'name'  => $data[1],
                    'id'    => $data[0],
                    'type'  => 'Resource',
                    'added' => 0
                );
                array_push($filters['resources'], $resourceArray);
            }

            return $filters;
        	} catch (PDOException $e) {
			echo $e->getMessage();
			return $filters;
		}
    }

}
            



            
