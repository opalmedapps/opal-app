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
	        $aria_link = new PDO( ARIA_DB , ARIA_USERNAME, ARIA_PASSWORD );
            $aria_link->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
        
            $sql = "
                SELECT DISTINCT
                    vva.Expression1
                FROM   
                    variansystem.dbo.vv_ActivityLng vva
                ORDER BY
                    vva.Expression1
            ";
            $query = $aria_link->prepare( $sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL) );
            $query->execute();
            while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {
         
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
                SELECT DISTINCT
                    Doctor.ResourceSer,
                    Doctor.LastName
                FROM
                    variansystem.dbo.Doctor Doctor,
                    variansystem.dbo.PatientDoctor PatientDoctor
                WHERE 
                    PatientDoctor.PrimaryFlag       = 1
                AND PatientDoctor.OncologistFlag    = 1
                AND Doctor.OncologistFlag           = 1
                AND PatientDoctor.ResourceSer       = Doctor.ResourceSer

                ORDER BY
                    Doctor.LastName
            ";
            $query = $aria_link->prepare( $sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL) );
            $query->execute();
            while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {
                $doctorArray = array(
                    'name'  => $data[1],
                    'id'    => $data[0],
                    'type'  => 'Doctor',
                    'added' => 0
                );
                array_push($filters['doctors'], $doctorArray);
            }

            $sql = "
                SELECT DISTINCT
                    vr.ResourceSer,
                    vr.ResourceName
                FROM    
                    variansystem.dbo.vv_ResourceName vr
                WHERE
                    vr.ResourceName     LIKE 'STX%'
                OR  vr.ResourceName     LIKE 'TB%'

                ORDER BY 
                    vr.ResourceName
            ";
            $query = $aria_link->prepare( $sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL) );
            $query->execute();
            while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {
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
            



            
