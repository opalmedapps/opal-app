<?php

/**
 * TestResult class
 *
 */
class TestResult {

    /**
     *
     * Updates the publish flag(s) in the database
     *
     * @param array $testResultList : a list of test results
     * @return array : response
     */
    public function updatePublishFlags( $testResultList ) {
        $response = array(
            'value'     => 0,
            'message'   => ''
        );
		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            foreach ($testResultList as $testResult) {
                $publishFlag = $testResult['publish'];
                $serial = $testResult['serial'];
                $sql = "
                    UPDATE
                        TestResultControl
                    SET 
                        TestResultControl.PublishFlag = $publishFlag
                    WHERE
                        TestResultControl.TestResultControlSerNum = $serial
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
     * Gets details on a particular test result
     *
     * @param integer $serial : the serial number of the test result
     * @return array
     */
    public function getTestResultDetails ($serial) {
        $testResultDetails = array();
 		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $sql = "
                SELECT DISTINCT 
                    tr.Name_EN,
                    tr.Name_FR,
                    tr.Description_EN,
                    tr.Description_FR,
                    tr.Group_EN,
                    tr.Group_FR
                FROM
                    TestResultControl tr
                WHERE
                    tr.TestResultControlSerNum = $serial
            ";
			$query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			$data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT);

            $name_EN        = $data[0];
            $name_FR        = $data[1];
            $description_EN = $data[2];
            $description_FR = $data[3];
            $group_EN       = $data[4];
            $group_FR       = $data[5];
            $tests          = array();

            $sql = "
                SELECT DISTINCT
                    tre.ExpressionName
                FROM    
                    TestResultExpression tre
                WHERE   
                    tre.TestResultControlSerNum = $serial
            ";
            $query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
	    	$query->execute();

            while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {

                $testArray = array(
                    'name'  => $data[0],
                    'id'    => $data[0],
                    'added' => 1
                );

                array_push($tests, $testArray);
            }

            $testResultDetails = array(
                'name_EN'           => $name_EN,
                'name_FR'           => $name_FR,
                'description_EN'    => $description_EN,
                'description_FR'    => $description_FR,
                'group_EN'          => $group_EN,
                'group_FR'          => $group_FR,
                'serial'            => $serial,
                'tests'             => $tests
            );
            return $testResultDetails;
        } catch (PDOException $e) {
			echo $e->getMessage();
			return $testResultDetails;
		}
	}

    /**
     *
     * Gets a list of test result groups
     *
     * @return array
     */
    public function getTestResultGroups () {

        $groups = array (
            'EN'    => array(),
            'FR'    => array()
        );
        try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $sql = "
                SELECT DISTINCT
                    trc.Group_EN
                FROM 
                    TestResultControl trc
                ORDER BY
                    trc.Group_EN
            ";
			$query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {
                array_push($groups['EN'], $data[0]);
            }
            $sql = "
                SELECT DISTINCT
                    trc.Group_FR
                FROM 
                    TestResultControl trc
                ORDER BY
                    trc.Group_FR
            ";
			$query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {
                array_push($groups['FR'], $data[0]);
            }

            return $groups;
        } catch (PDOException $e) {
			echo $e->getMessage();
			return $groups;
		}
    }

    /**
     *
     * Gets a list of test result names from ARIA
     *
     * @return array
     */    
    public function getTestNames() {
        $testNames = array();

        try {
            $aria_link = mssql_connect(ARIA_DB, ARIA_USERNAME, ARIA_PASSWORD);

			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

            $sql = "
                use varianenm;
                SELECT DISTINCT
                    tr.comp_name
                FROM
                    test_result tr
            ";
            $query = mssql_query($sql);
            while ($data = mssql_fetch_array($query)) {
                $testArray = array(
                    'name'      => $data[0],
                    'id'        => $data[0],
                    'added'     => 0
                );
                array_push($testNames, $testArray);
            }

            return $testNames;
  	  	} catch (PDOException $e) {
            echo $e->getMessage();
            return $testNames;
		}
    }

    /**
     *
     * Inserts a test result into the database
     *
     * @param array $testResultArray : the test result details
     */
    public function insertTestResult ($testResultArray) {

        $name_EN            = $testResultArray['name_EN'];
        $name_FR            = $testResultArray['name_FR'];
        $description_EN     = $testResultArray['description_EN'];
        $description_FR     = $testResultArray['description_FR'];
        $group_EN           = $testResultArray['group_EN'];
        $group_FR           = $testResultArray['group_FR'];
        $tests              = $testResultArray['tests'];

		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
			$connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $sql = "
                INSERT INTO
                    TestResultControl (
                        Name_EN,
                        Name_FR,
                        Description_EN,
                        Description_FR,
                        Group_EN,
                        Group_FR,
                        DateAdded,
                        LastPublished
                    )
                VALUES (
                    \"$name_EN\",
                    \"$name_FR\",
                    \"$description_EN\",
                    \"$description_FR\",
                    \"$group_EN\",
                    \"$group_FR\",
                    NOW(),
                    NOW()
                )
            ";
			$query = $connect->prepare( $sql );
			$query->execute();

            $testResultSer = $connect->lastInsertId();

            foreach ($tests as $test) {

                $name   = $test['name'];

                $sql = "
                    INSERT INTO
                        TestResultExpression (
                            TestResultControlSerNum,
                            ExpressionName,
                            DateAdded
                        )
                    VALUES (
                        '$testResultSer',
                        \"$name\",
                        NOW()
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
     * Gets a list of existing test results in the database
     *
     * @return array
     */    
    public function getExistingTestResults () { 

        $testResultList = array();

 		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
            $connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $sql = "
                SELECT DISTINCT 
                    tr.TestResultControlSerNum,
                    tr.Name_EN,
                    tr.Name_FR,
                    tr.Description_EN,
                    tr.Description_FR,
                    tr.Group_EN,
                    tr.Group_FR,
                    tr.PublishFlag
                FROM
                    TestResultControl tr
            ";
			$query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {

                $testResultSer          = $data[0];
                $name_EN                = $data[1];
                $name_FR                = $data[2];
                $description_EN         = $data[3];
                $description_FR         = $data[4];
                $group_EN               = $data[5];
                $group_FR               = $data[6];
                $publishFlag            = $data[7];
                $tests                  = array();

                $sql = "
                    SELECT DISTINCT
                        tre.ExpressionName
                    FROM    
                        TestResultExpression tre
                    WHERE
                        tre.TestResultControlSerNum = $testResultSer
                ";

                $secondQuery = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
				$secondQuery->execute();
    
				while ($secondData = $secondQuery->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {

                    $testNameArray = array(
                        'name'  => $secondData[0],
                        'id'    => $secondData[0],
                        'added' => 1
                    );

                    array_push($tests, $testNameArray);
                }

                $testArray = array(
                    'name_EN'           => $name_EN,
                    'name_FR'           => $name_FR,
                    'serial'            => $testResultSer,
                    'description_EN'    => $description_EN,
                    'description_FR'    => $description_FR,
                    'group_EN'          => $group_EN,
                    'group_FR'          => $group_FR,
                    'publish'           => $publishFlag,
                    'tests'             => $tests
                );

                array_push($testResultList, $testArray);
            }
            return $testResultList;
        } catch (PDOException $e) {
			echo $e->getMessage();
			return $testResultList;
		}
	}

    /**
     *
     * Updates test result details in the database
     *
     * @param array $testResultArray : the test result details 
     * @return array : response
     */    
    public function updateTestResult ($testResultArray) {

        $name_EN            = $testResultArray['name_EN'];
        $name_FR            = $testResultArray['name_FR'];
        $description_EN     = $testResultArray['description_EN'];
        $description_FR     = $testResultArray['description_FR'];
        $group_EN           = $testResultArray['group_EN'];
        $group_FR           = $testResultArray['group_FR'];
        $serial             = $testResultArray['serial'];
        $tests              = $testResultArray['tests'];

        $existingTests      = array();

        $response = array(
            'value'     => 0,
            'message'   => ''
        );
		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
			$connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $sql = "
                UPDATE
                    TestResultControl
                SET
                    TestResultControl.Name_EN           = \"$name_EN\",
                    TestResultControl.Name_FR           = \"$name_FR\",
                    TestResultControl.Description_EN    = \"$description_EN\",
                    TestResultControl.Description_FR    = \"$description_FR\",
                    TestResultControl.Group_EN          = \"$group_EN\",
                    TestResultControl.Group_FR          = \"$group_FR\"
                WHERE
                    TestResultControl.TestResultControlSerNum = $serial
            ";

            $query = $connect->prepare( $sql );
			$query->execute();

            $sql = "
                SELECT DISTINCT
                    tre.ExpressionName
                FROM
                    TestResultExpression tre
                WHERE
                    tre.TestResultControlSerNum = $serial
            ";
			$query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {
                array_push($existingTests, $data[0]);
            }

            // If old test names not in new test names, delete from database
            foreach ($existingTests as $existingTestName) {
                if (!in_array($existingTestName, $tests)) {
                    $sql = "
                        DELETE FROM
                            TestResultExpression
                        WHERE
                            TestResultExpression.ExpressionName = \"$existingTestName\"
                        AND TestResultExpression.TestResultControlSerNum = $serial
                    ";

					$query = $connect->prepare( $sql );
					$query->execute();
				}
			}

            // If new test names, insert into database
            foreach ($tests as $test) {
                $testName = $test['name'];
                if(!in_array($test, $existingTests)) {
                    $sql = "
                        INSERT INTO 
                            TestResultExpression (
                                TestResultControlSerNum,
                                ExpressionName
                            )
                        VALUES (
                            '$serial',
                            \"$test\"
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

    /**
     *
     * Removes a test result from the database
     *
     * @param integer $testResultSer : the serial number of the test result
     * @return array : response
     */    
    public function removeTestResult ($testResultSer) {

        $response = array(
            'value'     => 0,
            'message'   => ''
        );

	    try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
			$connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $sql = "
                DELETE FROM
                    TestResultControl
                WHERE
                    TestResultControl.TestResultControlSerNum = $testResultSer
            ";

	        $query = $connect->prepare( $sql );
            $query->execute();

            $sql = "
                DELETE FROM
                    TestResultExpression
                WHERE
                    TestResultExpression.TestResultControlSerNum = $testResultSer
            ";
            $query = $connect->prepare( $sql );
			$query->execute();

            $response['value'] = 1;
            return $response;

	    } catch( PDOException $e) {
		    $response['message'] = $e->getMessage();
			return $response;
		}
	}
}

?>



                    

