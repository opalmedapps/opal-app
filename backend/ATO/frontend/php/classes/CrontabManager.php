<?php 

class CrontabManager {

	private $path;
	private $handle;
	private $cron_file;

	/* Class contructor */
	function __construct() {

		/* Default directory for our temporary cron file */
		$this->path = getcwd() . '/'; // Current directory for simplicity
	
		/* Dafault file name for the temp cron file */
		$this->handle = 'crontab.txt';

		// Concat the path and handle together
		$this->cron_file = "{$this->path}{$this->handle}";

	}
		
	/* Function to execute commands on the server */
	public function exec () {

		// Count the total number of argments passed	
		$argument_count = func_num_args();

		try {
			// Check whether if any arguments were passed
			if (!$argument_count) throw new Exception("There is nothing to execute. No command specified.");

			// Create an array of all the arguments which were passed
			$arguments = func_get_args();

			// A single line string representation of the actual Linux
			// commands we'll be executing.
			$command_string = ($argument_count > 1) ? implode(" && ", $arguments) : $arguments[0];

			// Execute command(s)
			shell_exec($command_string);

		} catch (Exception $e){

			// Simply display error message
			$this->error_message($e->getMessage());
		}

		// Return $this to make this function chainable
		return $this;
	}

	/* Function to remove the temporary cron file */
	public function remove_file() {
		
		// Check for existance of temp cron file
		// then execute rm to delete it
		if ($this->crontab_file_exists()) $this->exec("rm {$this->cron_file}");

		// Return $this to make function chainable
		return $this;
	}

	/* Function to write existing crontab to a temp file or create a blank temp 
	 * should no cron jobs exist.
  	 */
	public function write_to_file($path=NULL, $handle=NULL) {

		// Check if the cron file exists
		// If the file does exist, just return 
		if ( !$this->crontab_file_exists() ) { // File DNE

			// Check the $path and $handle to determine whether or not they're NULL
			// If either of them are NULL, we use the predefined fallbacks from our
			// constructor to define them
        		$this->handle = (is_null($handle)) ? $this->handle : $handle;
        		$this->path   = (is_null($path))   ? $this->path   : $path;
 
			// Concatenate these properties to represent the full path
			// and file name for the temporary cron file
        		$this->cron_file = "{$this->path}{$this->handle}";
			
			// write existing jobs to file. If no jobs exists, the file is blank.
			$this->exec("crontab -l > {$this->cron_file}");

		}

		// Return $this to make this function chainable
		return $this;
	}

	/* Function for creating cron jobs by way of adding new jobs / lines to the temp cron 
	 * file and then executing the "crontab" command which will install all of the jobs
	 * as a new crontab.
	 */
	public function append_cronjob($cron_jobs=NULL) {

		// Determine if there are cron jobs from the argument
		// If there aren't any, we halt any further executions 
		// and display an error message.
		if (is_null($cron_jobs)) $this->error_message("Nothing to append!  Please specify a cron job or an array of cron jobs.");
     
		/* Constructing a command */
		$append_cronfile = "echo '";
		
		// Populate the string with the cron jobs.
		// Using the ternary operator, if there are multiple cron jobs,
		// we implode that array of jobs. If not, we just concat that one job
		$append_cronfile .= (is_array($cron_jobs)) ? implode("\\n", $cron_jobs) : $cron_jobs;

		// Echo the jobs into the cron file by redirecting stout
		$append_cronfile .= "' >> {$this->cron_file}";

		// String command to install the new cron file
		$install_cron = "crontab {$this->cron_file}";

		// Before executing these commands, we call "write_to_file()" to create 
		// the temp cron file. Then whithin a chain, we execute these commands,
		// and call "remove_file()" to delete the temp file. (Neat!)
		$this->write_to_file()->exec($append_cronfile, $install_cron)->remove_file();

		// Return $this to make this function chainable
		return $this;
	}

		
	/* Function to remove existing cron jobs */
	public function remove_cronjob( $cron_jobs=NULL ) {

		// check if the argument is empty and halt execution if it is
		if (is_null($cron_jobs)) $this->error_message("Nothing to remove! Please specify a cron job or an array of cron jobs.");

		// Continue with writing the crontab to a file
		$this->write_to_file();

		/* With the cron file created, we now read it into an array */
		// Note: file() parses a given file into an array with each line
		// as an array element.
		$cron_array = file($this->cron_file, FILE_IGNORE_NEW_LINES);

		// Should there be no cron jobs scheduled, this array will be empty.
		// No reason to continue, halt execution if array is empty.
    		if (empty($cron_array)) $this->error_message("Nothing to remove!  The cronTab is already empty.");
		
		if (is_array($cron_jobs)) {
	
			// Note: preg_grep() returns an array of all the array elements
			// that match the regular expressions. In this case, we want the 
			// array of elements that don't match (PREG_GREP_INVERT).
			// In other words, we need an array of all the cron jobs that 
			// we're going to keep so that we can initialize the crontab with 
			// just these jobs.
        		foreach ($cron_jobs as $cron_regex) $cron_array = preg_grep($cron_regex, $cron_array, PREG_GREP_INVERT);
    		}
    		else
    		{
			// $cron_jobs in not an array, we just proceed in the same manner 
			// as the previous if statement.
        		$cron_array = preg_grep($cron_jobs, $cron_array, PREG_GREP_INVERT);
    		}   
		
		// We check the count of the $cron_array. If the length is zero, 
		// this means we've removed everything from the crontab, so we 
		// simply remove the crontab. If not, then we remove
		// the crontab AND we install a new one
		return (count($cron_array) == 0) ? $this->remove_crontab() : $this->remove_crontab()->append_cronjob($cron_array);
	}


	/* Function to remove the entire crontab */ 
	public function remove_crontab() {

		// Execute the crontab command with the "-r" flag
		// which removes the entire crontab for a given user.
		// Since the crontab has been removed, might as well
		// remove the temporary cron file as well, should it exist.
		$this->exec("crontab -r")->remove_file();
     
		// Return this to preserve chainability!
		return $this;
	}
		
	/* Helper function to check if the crontab is empty */
	public function crontab_exists() {

		// Write the crontab to a file
		$this->write_to_file();

		/* With the cron file created, we now read it into an array */
		// Note: file() parses a given file into an array with each line
		// as an array element.
		$cron_array = file($this->cron_file, FILE_IGNORE_NEW_LINES);

		// Should there be no cron jobs scheduled, this array will be empty.
    		if (empty($cron_array)) return false;
		else {
			$this->remove_file(); // remove temp file
			return true;
		}
	}

	/* Function to check whether the temp cron file exists or not */
	private function crontab_file_exists() {
		return file_exists($this->cron_file);
	}
	
	/* Helper function to halt execution and display an error message */
	private function error_message($error) {
		$this->remove_file();
		die("<pre style='color:#EE2711'>ERROR: {$error}</pre>");
	}
}

?>
