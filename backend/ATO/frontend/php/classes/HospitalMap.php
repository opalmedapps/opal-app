<?php
include(ABS_PATH.'php/lib/phpqrcode/qrlib.php');

/**
 * HospitalMap class
 *
 */
class HospitalMap {

    /**
     *
     * Generates a QRCode
     *
     * @param string $qrid : the string to QR-ify
     * @param string $oldqrid : the previous string that was QR'ed
     * @return array : qrcode with path
     */    
    public function generateQRCode($qrid, $oldqrid) {

        if($oldqrid) {
            $oldQRPath = DAVID_PATH.'hospital-maps/qrCodes/'.$oldqrid.'.png';
            if(file_exists($oldQRPath)) {
                unlink($oldQRPath);
            }
        }
        $qrPath = DAVID_PATH.'hospital-maps/qrCodes/'.$qrid.'.png';
        $qrCode = '';

        if(!file_exists($qrPath)) {
            QRcode::png($qrid,$qrPath);
        }
        $type = pathinfo($qrPath, PATHINFO_EXTENSION);
        $data = file_get_contents($qrPath);
        $qrCode = 'data:image/'.$type.';base64,'.base64_encode($data);

        $qrArray = array(
            'qrcode'    => $qrCode,
            'qrpath'    => $qrPath
        );
        return $qrArray;
    }

    /**
     *
     * Inserts hospital map info
     *
     * @param array $hosMapArray : the hospital map details
     */
    public function insertHospitalMap ($hosMapArray) {

        $name_EN            = $hosMapArray['name_EN'];
        $name_FR            = $hosMapArray['name_FR'];
        $description_EN     = $hosMapArray['description_EN'];
        $description_FR     = $hosMapArray['description_FR'];
        $url                = $hosMapArray['url'];
        $qrid               = $hosMapArray['qrid'];

		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $qrPath = 'qrCodes/'.$qrid.'.png';
            $sql = "
                INSERT INTO
                    HospitalMap (
                        MapUrl,
                        QRMapAlias,
                        QRImageFileName,
                        MapName_EN,
                        MapDescription_EN,
                        MapName_FR,
                        MapDescription_FR
                    )
                VALUES (
                    \"$url\",
                    \"$qrid\",
                    \"$qrPath\",
                    \"$name_EN\",
                    \"$description_EN\",
                    \"$name_FR\",
                    \"$description_FR\"
                )
            ";
		    $query = $connect->prepare( $sql );
			$query->execute();
        } catch( PDOException $e) {
			return $e->getMessage();
		}

    }

    /**
     *
     * Gets a list of existing hospital maps
     *
     * @return array
     */
    public function getHospitalMaps() {
        $hosMapList = array();
 		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $sql = "
                SELECT DISTINCT
                    hm.HospitalMapSerNum,
                    hm.MapUrl,
                    hm.QRMapAlias,
                    hm.MapName_EN,
                    hm.MapDescription_EN,
                    hm.MapName_FR,
                    hm.MapDescription_FR
                FROM
                    HospitalMap hm
            ";
			$query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {
            
                $serial             = $data[0];
                $url                = $data[1];
                $qrid               = $data[2];
                $name_EN            = $data[3];
                $description_EN     = $data[4];
                $name_FR            = $data[5];
                $description_FR     = $data[6];
                $qr = HospitalMap::generateQRCode($qrid, null);
                $qrcode = $qr['qrcode'];
                $qrpath = $qr['qrpath'];
                
                $hosMapArray = array(
                    'name_EN'           => $name_EN,
                    'name_FR'           => $name_FR,
                    'description_EN'    => $description_EN,
                    'description_FR'    => $description_FR,
                    'url'               => $url,
                    'qrid'              => $qrid,
                    'qrcode'            => $qrcode,
                    'qrpath'            => $qrpath,
                    'serial'            => $serial
                );

                array_push($hosMapList, $hosMapArray);
            }

            return $hosMapList;
	    } catch (PDOException $e) {
			echo $e->getMessage();
			return $hosMapList;
		}
	}

    /**
     *
     * Gets details on a particular hospital map 
     *
     * @param integer $serial : the hospital map serial number
     * @return array
     */    
    public function getHospitalMapDetails ($serial) {

        $hosMapDetails = array();

	    try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $sql = "
                SELECT DISTINCT
                    hm.MapUrl,
                    hm.QRMapAlias,
                    hm.MapName_EN,
                    hm.MapDescription_EN,
                    hm.MapName_FR,
                    hm.MapDescription_FR
                FROM 
                    HospitalMap hm
                WHERE
                    hm.HospitalMapSerNum = $serial
            ";
                    
		    $query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			$data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT);
            
            $url                = $data[0];
            $qrid               = $data[1];
            $name_EN            = $data[2];
            $description_EN     = $data[3];
            $name_FR            = $data[4];
            $description_FR     = $data[5];
            $qr = HospitalMap::generateQRCode($qrid, null);
            $qrcode = $qr['qrcode'];
            $qrpath = $qr['qrpath'];

            $hosMapDetails = array(
                    'name_EN'           => $name_EN,
                    'name_FR'           => $name_FR,
                    'description_EN'    => $description_EN,
                    'description_FR'    => $description_FR,
                    'url'               => $url,
                    'qrid'              => $qrid,
                    'qrcode'            => $qrcode,
                    'qrpath'            => $qrpath,
                    'serial'            => $serial
            );

            return $hosMapDetails;
        } catch (PDOException $e) {
			echo $e->getMessage();
			return $hosMapDetails;
		}
	}

    /**
     *
     * Updates hospital map's details
     *
     * @param array $hosMapArray : the hospital map details
     */
    public function updateHospitalMap ($hosMapArray) {

        $name_EN            = $hosMapArray['name_EN'];
        $name_FR            = $hosMapArray['name_FR'];
        $description_EN     = $hosMapArray['description_EN'];
        $description_FR     = $hosMapArray['description_FR'];
        $url                = $hosMapArray['url'];
        $qrid               = $hosMapArray['qrid'];
        $serial             = $hosMapArray['serial'];

		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $qrPath = 'qrCodes/'.$qrid.'.png';
            $sql = "
                UPDATE
                    HospitalMap
                SET
                    HospitalMap.MapUrl              = \"$url\",
                    HospitalMap.QRMapAlias          = \"$qrid\",
                    HospitalMap.QRImageFileName     = \"$qrPath\",
                    HospitalMap.MapName_EN          = \"$name_EN\",
                    HospitalMap.MapDescription_EN   = \"$description_EN\",
                    HospitalMap.MapName_FR          = \"$name_FR\",
                    HospitalMap.MapDescription_FR   = \"$description_FR\"
                WHERE   
                    HospitalMap.HospitalMapSerNum   = $serial
            ";

	        $query = $connect->prepare( $sql );
            $query->execute();

	    } catch( PDOException $e) {
			return $e->getMessage();
		}
	}

    /**
     *
     * Removes a hospital map from the database
     *
     * @param integer $serial : the hospital map serial number
     */    
    public function removeHospitalMap ($serial) {
        try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
			$connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $sql = "
                DELETE FROM
                    HospitalMap
                WHERE
                    HospitalMap.HospitalMapSerNum = $serial
            ";

	        $query = $connect->prepare( $sql );
            $query->execute();

        } catch( PDOException $e) {
			return $e->getMessage();
		}
	}
}

?>
