<?php

/**
 * Post class
 *
 */
class Post {

    /**
     *
     * Updates the publish flags in the database
     *
     * @param array $postList : the list of posts
     * @return array : response
     */    
    public function updatePostPublishFlags( $postList ) {

        $response = array(
            'value'     => 0,
            'message'   => ''
        );

		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
			$connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
			foreach ($postList as $post) {
				$postPublish = $post['publish'];
				$postSer = $post['serial'];
				$sql = "
					UPDATE 
						PostControl 	
					SET 
						PostControl.PublishFlag = $postPublish 
					WHERE 
						PostControl.PostControlSerNum = $postSer
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
     * Gets a list of existing posts
     *
     * @return array
     */        
	public function getExistingPosts() {
		$postList = array();
		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
			$connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
			$sql = "
                SELECT DISTINCT
                    PostControl.PostControlSerNum,
                    PostControl.PostType,
                    PostControl.PostName_EN,
                    PostControl.PostName_FR,
                    PostControl.Body_EN,
                    PostControl.Body_FR,
                    PostControl.PublishFlag,
                    IF(PostControl.PublishDate = '0000-00-00 00:00:00', '--', PostControl.PublishDate)
				FROM 
					PostControl
			";

			$query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {

				$postSer 	            = $data[0];
				$postType	            = $data[1];
				$postName_EN	        = $data[2];
				$postName_FR	        = $data[3];
				$postBody_EN	        = $data[4];
                $postBody_FR            = $data[5];
                $postPublish           = $data[6];
                $postPublishDate        = $data[7];
                $postFilters            = array();

				$sql = "
					SELECT DISTINCT 
                        Filters.FilterType,
                        Filters.FilterId
					FROM 
						PostControl, 
						Filters 
					WHERE 
                            PostControl.PostControlSerNum 		        = $postSer
                    AND     Filters.ControlTable             = 'PostControl'
                    AND     Filters.ControlTableSerNum       = PostControl.PostControlSerNum
                    AND     Filters.FilterType              != ''
                    AND     Filters.FilterId                != ''
				";

				$secondQuery = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
				$secondQuery->execute();

				while ($secondData = $secondQuery->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {

					$filterType = $secondData[0];
					$filterId   = $secondData[1];
					$filterArray = array (
						'type'  => $filterType,
						'id'    => $filterId,
						'added' => 1
					);

					array_push($postFilters, $filterArray);
				}

				$postArray = array(
					'name_FR' 		    => $postName_FR, 
					'name_EN' 		    => $postName_EN, 
					'serial' 		    => $postSer, 
                    'type'			    => $postType, 
                    'publish'          => $postPublish,
					'body_EN' 	        => $postBody_EN, 
                    'body_FR' 	        => $postBody_FR,
                    'publish_date'      => $postPublishDate,
					'filters' 		    => $postFilters
				);

				array_push($postList, $postArray);
			}
			return $postList;
		} catch (PDOException $e) {
			echo $e->getMessage();
			return $postList;
		}
	}

    /**
     *
     * Gets details on a particular post
     *
     * @param integer $postSer : the post serial number
     * @return array
     */    			
    public function getPostDetails ($postSer) {

		$postDetails = array();

		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
			$connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
			$sql = "
				SELECT DISTINCT 
                    PostControl.PostType,
                    PostControl.PostName_EN,
                    PostControl.PostName_FR,
                    PostControl.Body_EN,
                    PostControl.Body_FR,
                    PostControl.PublishFlag,
                    IF(PostControl.PublishDate = '0000-00-00 00:00:00', NULL, PostControl.PublishDate)
				FROM 
					PostControl 
				WHERE 
					PostControl.PostControlSerNum = $postSer
			";

			$query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			$data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT);

			$postType	        = $data[0];
			$postName_EN	    = $data[1];
			$postName_FR	    = $data[2];
			$postBody_EN	    = $data[3];
            $postBody_FR	    = $data[4];
            $postPublish       = $data[5];
            $postPublishDate    = $data[6];
			$postFilters	    = array();

			$sql = "
				SELECT DISTINCT 
                        Filters.FilterType,
                        Filters.FilterId
					FROM 
						PostControl, 
						Filters 
					WHERE 
                            PostControl.PostControlSerNum   = $postSer 
                    AND     Filters.ControlTable            = 'PostControl'
                    AND     Filters.ControlTableSerNum      = PostControl.PostControlSerNum
                    AND     Filters.FilterType              != ''
                    AND     Filters.FilterId                != ''

			";

			$query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {

					$filterType = $data[0];
					$filterId   = $data[1];
					$filterArray = array (
						'type'  => $filterType,
						'id'    => $filterId,
						'added' => 1
					);

					array_push($postFilters, $filterArray);


            }

			$postDetails = array(
	            'name_FR' 		    => $postName_FR, 
				'name_EN' 		    => $postName_EN, 
				'serial' 		    => $postSer, 
                'type'			    => $postType, 
                'publish'           => $postPublish,
				'body_EN' 	        => $postBody_EN, 
                'body_FR' 	        => $postBody_FR,
                'publish_date'      => $postPublishDate,
				'filters' 		    => $postFilters
            );
		
			return $postDetails;
		} catch (PDOException $e) {
			echo $e->getMessage();
			return $postDetails;
		}
	}

    /**
     *
     * Inserts a post into the database
     *
     * @param array $postArray : the post details
     */    
	public function insertPost( $postArray ) {

		$postName_EN 	= $postArray['name_EN'];
		$postName_FR 	= $postArray['name_FR'];
		$postBody_EN	= $postArray['body_EN'];
		$postBody_FR	= $postArray['body_FR'];
        $postType	    = $postArray['type'];
        $postPublishDate= $postArray['publish_date'];
		$postFilters	= $postArray['filters'];

		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
			$connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
			$sql = "
				INSERT INTO 
                    PostControl (
                        PostName_EN,
                        PostName_FR,
                        Body_EN,
                        Body_FR,
                        PostType,
                        PublishDate,
                        DateAdded
					) 
				VALUES (
					\"$postName_EN\", 
					\"$postName_FR\",
					\"$postBody_EN\", 
					\"$postBody_FR\", 
                    '$postType', 
                    '$postPublishDate',
                    NOW()
				)
			";
			$query = $connect->prepare( $sql );
			$query->execute();

			$postSer = $connect->lastInsertId();

			foreach ($postFilters as $filter) {

                $filterType = $filter['type'];
                $filterId   = $filter['id'];

				$sql = "
                    INSERT INTO 
                        Filters (
                            ControlTable,
                            ControlTableSerNum,
                            FilterType,
                            FilterId,
                            DateAdded
                        )
                    VALUE (
                        'PostControl',
                        '$postSer',
                        '$filterType',
                        \"$filterId\",
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
     * Removes a post from the database
     *
     * @param integer $postSer : the post serial number
     * @return array : response
     */        
    public function removePost( $postSer ) {

        $response = array(
            'value'     => 0,
            'message'   => ''
        );

		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
			$connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
			$sql = "
				DELETE FROM 
					PostControl 
				WHERE 
					PostControl.PostControlSerNum = $postSer
			";

			$query = $connect->prepare( $sql );
			$query->execute();

			$sql = "
                DELETE FROM
                    Filters
                WHERE
                    Filters.ControlTableSerNum   = $postSer
                AND Filters.ControlTable         = 'PostControl'
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

    /**
     *
     * Updates a post's details in the database
     *
     * @param array $postArray : the post details
     * @return array : response
     */        
    public function updatePost( $postArray ) {

		$postName_EN 	    = $postArray['name_EN'];
		$postName_FR 	    = $postArray['name_FR'];
		$postBody_EN	    = $postArray['body_EN'];
		$postBody_FR	    = $postArray['body_FR'];
        $postSer	        = $postArray['serial'];
        $postPublishDate    = $postArray['publish_date'];
		$postFilters	    = $postArray['filters'];

        $existingFilters	= array();

        $response = array(
            'value'     => 0,
            'message'   => ''
        );

		try {
			$connect = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD );
			$connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
			$sql = "
				UPDATE 
					PostControl 
				SET 
					PostControl.PostName_EN 		= \"$postName_EN\", 
					PostControl.PostName_FR 		= \"$postName_FR\", 
					PostControl.Body_EN	            = \"$postBody_EN\",
                    PostControl.Body_FR	            = \"$postBody_FR\",
                    PostControl.PublishDate         = '$postPublishDate'
				WHERE 
					PostControl.PostControlSerNum = $postSer
			";

			$query = $connect->prepare( $sql );
			$query->execute();

			$sql = "
				SELECT DISTINCT 
                    Filters.FilterType,
                    Filters.FilterId
				FROM 
					Filters
				WHERE 
                    Filters.ControlTableSerNum       = $postSer
                AND Filters.ControlTable             = 'PostControl'
                AND Filters.FilterType              != ''
                AND Filters.FilterId                != ''
			";


			$query = $connect->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			$query->execute();

			while ($data = $query->fetch(PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT)) {

                $filterArray = array(
                    'type'  => $data[0],
                    'id'    => $data[1]
                );
				array_push($existingFilters, $filterArray);
			}

            if (!empty($existingFilters)) {
                // If old filters not in new, remove from DB
	    		foreach ($existingFilters as $existingFilter) {
                    $id     = $existingFilter['id'];
                    $type   = $existingFilter['type'];
                    if (!$this->nestedSearch($id, $type, $postFilters)) {
					    $sql = "
                            DELETE FROM 
	    						Filters
		    				WHERE
                                Filters.FilterId            = \"$id\"
                            AND Filters.FilterType          = '$type'
                            AND Filters.ControlTableSerNum   = $postSer
                            AND Filters.ControlTable         = 'PostControl'
    					";
    
	    				$query = $connect->prepare( $sql );
		    			$query->execute();
			    	}
    			}   
            }
            if (!empty($postFilters)) {
                // If new filters, insert into DB
    			foreach ($postFilters as $filter) {
                    $id     = $filter['id'];
                    $type   = $filter['type'];
                    if (!$this->nestedSearch($id, $type, $existingFilters)) {
                        $sql = "
                            INSERT INTO 
                                Filters (
                                    ControlTable,
                                    ControlTableSerNum,
                                    FilterId,
                                    FilterType,
                                    DateAdded
                                )
                            VALUES (
                                'PostControl',
                                '$postSer',
                                \"$id\",
                                '$type',
                                NOW()
                            )
			    		";
				    	$query = $connect->prepare( $sql );
					    $query->execute();
    				}
	    		}
            }

            $response['value'] = 1;
            return $response;
        } catch( PDOException $e) {
            $response['message'] = $e->getMessage();
			return $response;
		}
    }

    public function nestedSearch($id, $type, $array) {
        if(empty($array) || !$id || !$type){
            return 0;
        }
        foreach ($array as $key => $val) {
            if ($val['id'] === $id and $val['type'] === $type) {
                return 1;
            }
        }
        return 0;
    }

}
?>
