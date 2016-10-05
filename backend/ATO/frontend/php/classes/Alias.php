<?php

/**
 * Alias class
 *
 */
class Alias {

    /**
     *
     * Gets a list of expressions from ARIA
     *
     * @param string $type : the type of expressions to look out for
     * @return array
     */
	public function getExpressions ($type) {
        $expressionList = array();
        try {
            $aria_link = mssql_connect(ARIA_DB, ARIA_USERNAME, ARIA_PASSWORD);

			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

            if ($type != "Document") {
                $sql = "
                    SELECT DISTINCT
				        vv_ActivityLng.Expression1

			        FROM  
				        variansystem.dbo.vv_ActivityLng vv_ActivityLng 

                    ORDER BY 
                    vv_ActivityLng.Expression1
                ";

                $query = mssql_query($sql);
                while ($data = mssql_fetch_array($query)) {

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

                $query = mssql_query($sql);
                while ($data = mssql_fetch_array($query)) {

                    $termName = $data[0];
                        
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
                    Alias.EducationalMaterialControlSerNum
				FROM 
					Alias
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
                    $aliasEduMat = EduMaterial::getEducationalMaterialDetails($aliasEduMatSer);
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
                    Alias.EducationalMaterialControlSerNum 
				FROM 
					Alias 
				WHERE 
					Alias.AliasSerNum = $ser
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
                $aliasEduMat = EduMaterial::getEducationalMaterialDetails($aliasEduMatSer);
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
        $aliasEduMatSer = $aliasArray['edumat']['serial'];

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
                            AliasExpressionSerNum,
                            AliasSerNum,
                            ExpressionName
                        )
                    VALUE (
                        NULL,
                        '$aliasSer',
                        \"$aliasTerm\"
                    )
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
        $aliasEduMatSer = $aliasArray['edumat']['serial'];

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

}
?>
