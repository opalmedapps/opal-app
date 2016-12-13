<?php

/**
 * Alias class
 *
 */
class Alias {

    /**
     *
     * Gets a list of expressions from a source database
     *
     * @param int $sourceDBSer : the serial number of the source database
     * @param string $expressionType : the type of expressions to look out for
     * @return array
     */
	public function getExpressions ($sourceDBSer, $expressionType) {
        $expressionList = array();
        try {
            // ARIA 
            if ($sourceDBSer == 1) {

	            $aria_link = new PDO( ARIA_DB , ARIA_USERNAME, ARIA_PASSWORD );
            	$aria_link->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

                if ($expressionType != "Document") {
                    $sql = "
                        SELECT DISTINCT
			    	        vv_ActivityLng.Expression1
    			        FROM  
	    			        variansystem.dbo.vv_ActivityLng vv_ActivityLng 
                        ORDER BY 
                        vv_ActivityLng.Expression1
                    ";
    
                    $query = $aria_link->prepare( $sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL) );
                   	$query->execute();
                    while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {


                        $termName = $data[0];
                        $termArray = array(
				           	'name' => $termName,
			        	    'added'=> 'false'
		    	        );

                        array_push($expressionList, $termArray);

                    }

                } else {

                    $sql = "
                        SELECT DISTINCT
                            note_typ.note_typ_desc
                        FROM 
                            varianenm.dbo.note_typ note_typ
                        ORDER BY
                            note_typ.note_typ_desc
                    ";
    
                    $query = $aria_link->prepare( $sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL) );
                   	$query->execute();
                    while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {


                        $termName = $data[0];
                            
                        $termArray = array(
				           	'name' => $termName,
			            	'added'=> 'false'
    			        );
    
                        array_push($expressionList, $termArray);
                    }
                }

            }

            // WaitRoomManagement
            if ($sourceDBSer == 2) {
                
	    		$wrm_connect = new PDO( WRM_DSN, WRM_USERNAME, WRM_PASSWORD );
                $wrm_connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

                $sql = "
                    SELECT DISTINCT 
                        mval.AppointmentCode
                    FROM
                        MediVisitAppointmentList mval
                    ORDER BY
                        mval.AppointmentCode
                ";

                $query = $wrm_connect->prepare( $sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL) );
                $query->execute();

                while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {
                
                    $termName   = $data[0];

                    $termArray = array(
				       	'name' => $termName,
			        	'added'=> 'false'
			        );

                    array_push($expressionList, $termArray);
                }
            }           

			return $expressionList;
		} catch (PDOException $e) {
			echo $e->getMessage();
			return $expressionList;
		}
	}

    /**
     *
     * Updates AliasUpdate flag in MySQL
     *
     * @param array $aliasList : a list of aliases
     * @return array : response
     */
    public function updateAliasControls( $aliasList ) {

        // Initialize a response array
        $response = array(
            'value'     => 0,
            'message'   => ''
        );
		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

            foreach ($aliasList as $alias) {

				$aliasUpdate    = $alias['update'];
                $aliasSer       = $alias['serial'];

				$sql = "
					UPDATE 
						Alias 	
					SET 
						Alias.AliasUpdate = $aliasUpdate 
					WHERE 
						Alias.AliasSerNum = $aliasSer
				";

				$query = $connect->prepare( $sql );
				$query->execute();
            }

            $response['value'] = 1; // Success
            return $response;

		} catch( PDOException $e) {
			$response['message'] = $e->getMessage();
			return $response; // Fail
		}
	}

    /**
     *
     * Gets a list of existing aliases
     *
     * @return array
     */
	public function getExistingAliases() {
		$aliasList = array();
		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

			$sql = "
				SELECT DISTINCT 
					Alias.AliasSerNum, 
					Alias.AliasType, 
					Alias.AliasName_FR,
					Alias.AliasName_EN,
					Alias.AliasDescription_FR,
                    Alias.AliasDescription_EN,
                    Alias.AliasUpdate,
                    Alias.EducationalMaterialControlSerNum,
                    Alias.SourceDatabaseSerNum,
                    SourceDatabase.SourceDatabaseName
				FROM 
                    Alias,
                    SourceDatabase
                WHERE   
                    Alias.SourceDatabaseSerNum = SourceDatabase.SourceDatabaseSerNum
			";

			$query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {

				$aliasSer 	    = $data[0];
				$aliasType	    = $data[1];
				$aliasName_FR	= $data[2];
				$aliasName_EN	= $data[3];
				$aliasDesc_FR	= $data[4];
                $aliasDesc_EN	= $data[5];
                $aliasUpdate    = $data[6];
                $aliasEduMatSer = $data[7];
                $sourceDatabase = array(
                    'serial'    => $data[8],
                    'name'      => $data[9]
                );
                $aliasTerms	    = array();
                $aliasEduMat    = "";

				$sql = "
					SELECT DISTINCT 
						AliasExpression.ExpressionName 
					FROM 
						Alias, 
						AliasExpression 
					WHERE 
						Alias.AliasSerNum 		        = $aliasSer 
					AND AliasExpression.AliasSerNum 	= Alias.AliasSerNum
				";

				$secondQuery = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
				$secondQuery->execute();

				while ($secondData = $secondQuery->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {

					$termName = $secondData[0];
					$termArray = array(
						'name' => $termName,
						'added'=> 'true'
					);

					array_push($aliasTerms, $termArray);
				}

                if ($aliasEduMatSer != 0) {
                    $eduMatObj = new EduMaterial();
                    $aliasEduMat = $eduMatObj->getEducationalMaterialDetails($aliasEduMatSer);
                }
                            
				$aliasArray = array(
					'name_FR' 		    => $aliasName_FR, 
					'name_EN' 		    => $aliasName_EN, 
					'serial' 		    => $aliasSer, 
                    'type'			    => $aliasType, 
                    'update'            => $aliasUpdate,
                    'eduMat'            => $aliasEduMat,
					'description_EN' 	=> $aliasDesc_EN, 
                    'description_FR' 	=> $aliasDesc_FR,
                    'source_db'         => $sourceDatabase, 
					'count' 		    => count($aliasTerms), 
					'terms' 		    => $aliasTerms
				);

				array_push($aliasList, $aliasArray);
            }
            return $aliasList;

		} catch (PDOException $e) {
			echo $e->getMessage();
			return $aliasList;
		}
	}

    /**
     *
     * Gets details for one particular alias
     *
     * @param integer $ser : the alias serial number
     * @return array
     */			
    public function getAliasDetails ($ser) { 

		$aliasDetails = array();
		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

			$sql = "
				SELECT DISTINCT 
					Alias.AliasType, 
					Alias.AliasName_FR,
					Alias.AliasName_EN,
					Alias.AliasDescription_FR,
                    Alias.AliasDescription_EN,
                    Alias.AliasUpdate,
                    Alias.EducationalMaterialControlSerNum,
                    Alias.SourceDatabaseSerNum,
                    SourceDatabase.SourceDatabaseName 
				FROM 
                    Alias, 
                    SourceDatabase
				WHERE 
                    Alias.AliasSerNum                       = $ser
                AND SourceDatabase.SourceDatabaseSerNum     = Alias.SourceDatabaseSerNum

			";

			$query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			$data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT);

			$aliasType	    = $data[0];
			$aliasName_FR	= $data[1];
			$aliasName_EN	= $data[2];
			$aliasDesc_FR	= $data[3];
            $aliasDesc_EN	= $data[4];
            $aliasUpdate    = $data[5];
            $aliasEduMatSer = $data[6];
            $sourceDatabase = array(
                'serial'    => $data[7],
                'name'      => $data[8]
            );
            $aliasEduMat    = "";
			$aliasTerms	    = array();

			$sql = "
				SELECT DISTINCT 
					AliasExpression.ExpressionName 
				FROM 	
					AliasExpression 
				WHERE 
					AliasExpression.AliasSerNum = $ser
			";

			$query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {

					$termName = $data[0];
					$termArray = array(
						'name' => $termName,
						'added'=> 'true'
					);

					array_push($aliasTerms, $termArray);
			}

            if ($aliasEduMatSer != 0) {
                $eduMatObj = new EduMaterial();
                $aliasEduMat = $eduMatObj->getEducationalMaterialDetails($aliasEduMatSer);
            }
                         
			$aliasDetails = array(
				'name_FR' 		    => $aliasName_FR, 
				'name_EN' 		    => $aliasName_EN, 
				'serial' 		    => $ser, 
                'type'			    => $aliasType, 
                'update'            => $aliasUpdate,
                'eduMat'            => $aliasEduMat,
				'description_EN' 	=> $aliasDesc_EN, 
                'description_FR' 	=> $aliasDesc_FR, 
                'source_db'         => $sourceDatabase,
				'count' 		    => count($aliasTerms), 
				'terms' 		    => $aliasTerms
			);
		
            return $aliasDetails;

		} catch (PDOException $e) {
			echo $e->getMessage();
			return $aliasDetails;
		}
	}

    /**
     *
     * Inserts an alias into the database
     *
     * @param array $aliasArray : the alias details
     * @return void
     */
	public function insertAlias( $aliasArray ) {

		$aliasName_EN 	= $aliasArray['name_EN'];
		$aliasName_FR 	= $aliasArray['name_FR'];
		$aliasDesc_EN	= $aliasArray['description_EN'];
		$aliasDesc_FR	= $aliasArray['description_FR'];
		$aliasType	    = $aliasArray['type'];
		$aliasTerms	    = $aliasArray['terms'];
        $aliasEduMatSer = 0;
        if ( is_array($aliasArray['edumat']) && isset($aliasArray['edumat']['serial']) ) {
            $aliasEduMatSer = $aliasArray['edumat']['serial'];
        }
        $sourceDBSer    = $aliasArray['source_db']['serial'];

		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
			$connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
			$sql = "
				INSERT INTO 
					Alias (
						AliasSerNum, 
						AliasName_FR,
						AliasName_EN,
						AliasDescription_FR,
                        AliasDescription_EN, 
                        EducationalMaterialControlSerNum,
                        SourceDatabaseSerNum,
                        AliasType, 
                        AliasUpdate,
						LastUpdated
					) 
				VALUES (
					NULL, 
					\"$aliasName_FR\", 
					\"$aliasName_EN\",
					\"$aliasDesc_FR\", 
                    \"$aliasDesc_EN\", 
                    '$aliasEduMatSer',
                    '$sourceDBSer',
                    '$aliasType', 
                    '0',
					NULL
				)
			";
			$query = $connect->prepare( $sql );
			$query->execute();

			$aliasSer = $connect->lastInsertId();

			foreach ($aliasTerms as $aliasTerm) {

				$sql = "
                    INSERT INTO 
                        AliasExpression (
                            AliasSerNum,
                            ExpressionName
                        )
                    VALUE (
                        '$aliasSer',
                        \"$aliasTerm\"
                    )
                    ON DUPLICATE KEY UPDATE
                        AliasSerNum = '$aliasSer'
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
     * Deletes an alias from the database
     *
     * @param integer $aliasSer : the alias serial number
     * @return array : response
     */
    public function removeAlias( $aliasSer ) {

        // Initialize a response array
        $response = array(
            'value'     => 0,
            'message'   => ''
        );
		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
			$connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

            $sql = "
                DELETE FROM
                    AliasExpression
                WHERE
                    AliasExpression.AliasSerNum = $aliasSer
			";
			
			$query = $connect->prepare( $sql );
            $query->execute();

			$sql = "
				DELETE FROM 
					Alias 
				WHERE 
					Alias.AliasSerNum = $aliasSer
			";

			$query = $connect->prepare( $sql );
			$query->execute();

	
            $response['value'] = 1; // Success
            return $response;	

		} catch( PDOException $e) {
            $response['message'] = $e->getMessage();
			return $response; // Fail
		}
	}

    /**
     *
     * Updates an alias in the database
     *
     * @param array $aliasArray : the alias details
     * @return array : response
     */    
    public function updateAlias( $aliasArray ) {

		$aliasName_EN 	= $aliasArray['name_EN'];
		$aliasName_FR 	= $aliasArray['name_FR'];
		$aliasDesc_EN	= $aliasArray['description_EN'];
		$aliasDesc_FR	= $aliasArray['description_FR'];
		$aliasSer	    = $aliasArray['serial'];
        $aliasTerms	    = $aliasArray['terms'];
        $aliasEduMatSer = 0;
        if ( is_array($aliasArray['edumat']) && isset($aliasArray['edumat']['serial']) ) {
            $aliasEduMatSer = $aliasArray['edumat']['serial'];
        }

        $existingTerms	= array();

        // Initialize a response array
        $response = array(
            'value'     => 0,
            'message'   => ''
        );
		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
			$connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
			$sql = "
				UPDATE 
					Alias 
				SET 
					Alias.AliasName_EN 		                = \"$aliasName_EN\", 
					Alias.AliasName_FR 		                = \"$aliasName_FR\", 
					Alias.AliasDescription_EN	            = \"$aliasDesc_EN\",
                    Alias.AliasDescription_FR	            = \"$aliasDesc_FR\",
                    Alias.EducationalMaterialControlSerNum  = '$aliasEduMatSer'
				WHERE 
					Alias.AliasSerNum = $aliasSer
			";

			$query = $connect->prepare( $sql );
			$query->execute();

			$sql = "
				SELECT DISTINCT 
					AliasExpression.ExpressionName 
				FROM 
					AliasExpression 
				WHERE 
					AliasExpression.AliasSerNum = $aliasSer
			";

			$query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {

				array_push($existingTerms, $data[0]);
			}

            // This loop compares the old terms with the new
            // If old terms not in new, then remove old
			foreach ($existingTerms as $existingTermName) {
				if (!in_array($existingTermName, $aliasTerms)) {
					$sql = "
                        DELETE FROM 
							AliasExpression
						WHERE
                            AliasExpression.ExpressionName = \"$existingTermName\"
                        AND AliasExpression.AliasSerNum = $aliasSer
					";

					$query = $connect->prepare( $sql );
					$query->execute();
				}
			}

            // If new terms, then insert
			foreach ($aliasTerms as $term) {
				if (!in_array($term, $existingTerms)) {
                    $sql = "
                        INSERT INTO 
                            AliasExpression (
                                AliasExpressionSerNum,
                                AliasSerNum,
                                ExpressionName
                            )
                        VALUES (
                            NULL,
                            '$aliasSer',
                            \"$term\"
                        )
                        ON DUPLICATE KEY UPDATE
                            AliasSerNum = '$aliasSer'
					";
					$query = $connect->prepare( $sql );
					$query->execute();
				}
            }

            $response['value'] = 1; // Success
            return $response;
		
		} catch( PDOException $e) {
		    $response['message'] = $e->getMessage();
			return $response; // Fail
		}
	}

    /**
     *
     * Gets a list of source databases 
     *
     * @return array
     */
	public function getSourceDatabases () {
        $sourceDBList = array();
        try {
 	        $connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

            $sql = "
                SELECT DISTINCT
                    sd.SourceDatabaseSerNum,
                    sd.SourceDatabaseName
                FROM
                    SourceDatabase sd
                ORDER BY 
                    sd.SourceDatabaseSerNum
            ";

            $query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

            while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {

                $sourceDBArray = array(
                    'serial'    => $data[0],
                    'name'      => $data[1]
                );

                array_push($sourceDBList, $sourceDBArray);

            }

            return $sourceDBList;
        
        } catch (PDOException $e) {
			echo $e->getMessage();
			return $sourceDBList;
		}
	}


                    
                

}
?>
