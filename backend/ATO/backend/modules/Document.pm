#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 10-Aug-2015 ++ File: Document.pm
#---------------------------------------------------------------------------------
# Perl module that creates a document class. This module calls a constructor to 
# create a document object that contains document information stored as object 
# variables.
#
# There exists various subroutines to set doc information, get doc information
# and compare doc information between two doc objects. 
# There exists various subroutines that use the Database.pm module to update the
# MySQL database and check if a document exists already in this database.

package Document; # Declare package name

use Exporter; # To export subroutines and variables
use Database; # Use our custom database module Database.pm
use Time::Piece; # To parse and convert date time
use POSIX;
use Storable qw(dclone);

use Patient; # Our patient module
use Alias; # Our Alias module
use FTPS; # Custom FTPS.pm
use Staff; # Custom Staff.pm
use PushNotification; # Custom PushNotification.pm

#---------------------------------------------------------------------------------
# Connect to the database
#---------------------------------------------------------------------------------
my $SQLDatabase		= $Database::targetDatabase;

#-----------------------------------------------------------------------
# Connect to FTPS
#-----------------------------------------------------------------------
my $targetFTPS = $FTPS::targetFTPS;
my $ftpsObject = $FTPS::ftpsObject;

#====================================================================================
# Constructor for our Docs class 
#====================================================================================
sub new
{
	my $class = shift;
	my $document = {
		_ser			    => undef,
        _sourcedbser        => undef,
		_sourceuid		    => undef,
		_patientser		    => undef,
		_revised		    => undef,
		_validentry		    => undef,
		_errtxt			    => undef,
		_aliasexpressionser	=> undef,
		_approvedby		    => undef,
		_approvedtimestamp	=> undef,
		_authoredby		    => undef,
		_dateofservice		=> undef,
		_createdby		    => undef,
		_createdtimestamp	=> undef,        
		_fileloc		    => undef,
		_transferstatus		=> undef,
		_log			    => undef,
	};
	# bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $document, $class; 
	return $document;
}

#====================================================================================
# Subroutine to set the document serial
#====================================================================================
sub setDocSer
{
	my ($document, $ser) = @_; # doc object with provided serial in arguments
	$document->{_ser} = $ser; # set the ser
	return $document->{_ser};
}

#====================================================================================
# Subroutine to set the document source database serial
#====================================================================================
sub setDocSourceDatabaseSer
{
	my ($document, $sourcedbser) = @_; # doc object with provided serial in arguments
	$document->{_sourcedbser} = $sourcedbser; # set the ser
	return $document->{_sourcedbser};
}

#====================================================================================
# Subroutine to set the document source uid
#====================================================================================
sub setDocSourceUID
{
	my ($document, $sourceuid) = @_; # doc object with provided id in arguments
	$document->{_sourceuid} = $sourceuid; # set the id
	return $document->{_sourceuid};
}

#====================================================================================
# Subroutine to set the document patient serial
#====================================================================================
sub setDocPatientSer
{
	my ($document, $patientser) = @_; # doc object with provided serial in arguments
	$document->{_patientser} = $patientser; # set the serial
	return $document->{_patientser};
}

#====================================================================================
# Subroutine to set the document revision indicator
#====================================================================================
sub setDocRevised
{
	my ($document, $revised) = @_; # doc object with provided status in arguments
	$document->{_revised} = $revised; # set the status
	return $document->{_revised};
}

#====================================================================================
# Subroutine to set the document valid entry status
#====================================================================================
sub setDocValidEntry
{
	my ($document, $validentry) = @_; # doc object with provided status in arguments
	$document->{_validentry} = $validentry; # set the status
	return $document->{_validentry};
}

#====================================================================================
# Subroutine to set the document error reason text
#====================================================================================
sub setDocErrorReasonText
{
	my ($document, $errtxt) = @_; # doc object with provided error text in arguments
	$document->{_errtxt} = $errtxt; # set the text
	return $document->{_errtxt};
}

#====================================================================================
# Subroutine to set the document alias expression serial
#====================================================================================
sub setDocAliasExpressionSer
{
	my ($document, $aliasexpressionser) = @_; # doc object with provided serial in arguments
	$document->{_aliasexpressionser} = $aliasexpressionser; # set the serial
	return $document->{_aliasexpressionser};
}

#====================================================================================
# Subroutine to set the document approved by
#====================================================================================
sub setDocApprovedBy
{
	my ($document, $approvedby) = @_; # doc object with provided staff ser in arguments
	$document->{_approvedby} = $approvedby; # set the ser
	return $document->{_approvedby};
}

#====================================================================================
# Subroutine to set the document approved timestamp
#====================================================================================
sub setDocApprovedTimeStamp
{
	my ($document, $approvedtimestamp) = @_; # doc object with provided timestamp in arguments
	$document->{_approvedtimestamp} = $approvedtimestamp; # set the TS
	return $document->{_approvedtimestamp};
}

#====================================================================================
# Subroutine to set the document authored by
#====================================================================================
sub setDocAuthoredBy
{
	my ($document, $authoredby) = @_; # doc object with provided staff ser in arguments
	$document->{_authoredby} = $authoredby; # set the ser
	return $document->{_authoredby};
}

#====================================================================================
# Subroutine to set the document date of service
#====================================================================================
sub setDocDateOfService
{
	my ($document, $dateofservice) = @_; # doc object with provided DOS in arguments
	$document->{_dateofservice} = $dateofservice; # set the DOS
	return $document->{_dateofservice};
}

#====================================================================================
# Subroutine to set the document created by
#====================================================================================
sub setDocCreatedBy
{
	my ($document, $createdby) = @_; # doc object with provided staff ser in arguments
	$document->{_createdby} = $createdby; # set the ser
	return $document->{_createdby};
}

#====================================================================================
# Subroutine to set the document created timestamp
#====================================================================================
sub setDocCreatedTimeStamp
{
	my ($document, $createdtimestamp) = @_; # doc object with provided timestamp in arguments
	$document->{_createdtimestamp} = $createdtimestamp; # set the TS
	return $document->{_createdtimestamp};
}

#====================================================================================
# Subroutine to set the document file location
#====================================================================================
sub setDocFileLoc
{
	my ($document, $fileloc) = @_; # doc object with provided location in arguments
	$document->{_fileloc} = $fileloc; # set the location
	return $document->{_fileloc};
}

#====================================================================================
# Subroutine to set the document transfer status
#====================================================================================
sub setDocTransferStatus
{
	my ($document, $transferstatus) = @_; # doc object with provided status in arguments
	$document->{_transferstatus} = $transferstatus; # set the status
	return $document->{_transferstatus};
}

#====================================================================================
# Subroutine to set the document log
#====================================================================================
sub setDocLog
{
	my ($document, $log) = @_; # doc object with provided log in arguments
	$document->{_log} = $log; # set the log
	return $document->{_log};
}

#====================================================================================
# Subroutine to get the document ser
#====================================================================================
sub getDocSer
{
	my ($document) = @_; # our document object
	return $document->{_ser};
}

#====================================================================================
# Subroutine to get the document source database ser
#====================================================================================
sub getDocSourceDatabaseSer
{
	my ($document) = @_; # our document object
	return $document->{_sourcedbser};
}

#====================================================================================
# Subroutine to get the document uid
#====================================================================================
sub getDocSourceUID
{
	my ($document) = @_; # our document object
	return $document->{_sourceuid};
}

#====================================================================================
# Subroutine to get the document patient serial
#====================================================================================
sub getDocPatientSer
{
	my ($document) = @_; # our document object
	return $document->{_patientser};
}

#====================================================================================
# Subroutine to get the document revision indicator
#====================================================================================
sub getDocRevised
{
	my ($document) = @_; # our document object
	return $document->{_revised};
}

#====================================================================================
# Subroutine to get the document valid entry status
#====================================================================================
sub getDocValidEntry
{
	my ($document) = @_; # our document object
	return $document->{_validentry};
}

#====================================================================================
# Subroutine to get the document error reason text
#====================================================================================
sub getDocErrorReasonText
{
	my ($document) = @_; # our document object
	return $document->{_errtxt};
}

#====================================================================================
# Subroutine to get the document alias expression serial
#====================================================================================
sub getDocAliasExpressionSer
{
	my ($document) = @_; # our document object
	return $document->{_aliasexpressionser};
}


#====================================================================================
# Subroutine to get the document approved by
#====================================================================================
sub getDocApprovedBy
{
	my ($document) = @_; # our document object
	return $document->{_approvedby};
}

#====================================================================================
# Subroutine to get the document approved timestamp
#====================================================================================
sub getDocApprovedTimeStamp
{
	my ($document) = @_; # our document object
	return $document->{_approvedtimestamp};
}

#====================================================================================
# Subroutine to get the document authored by
#====================================================================================
sub getDocAuthoredBy
{
	my ($document) = @_; # our document object
	return $document->{_authoredby};
}

#====================================================================================
# Subroutine to get the document date of service
#====================================================================================
sub getDocDateOfService
{
	my ($document) = @_; # our document object
	return $document->{_dateofservice};
}

#====================================================================================
# Subroutine to get the document created by
#====================================================================================
sub getDocCreatedBy
{
	my ($document) = @_; # our document object
	return $document->{_createdby};
}

#====================================================================================
# Subroutine to get the document created timestamp
#====================================================================================
sub getDocCreatedTimeStamp
{
	my ($document) = @_; # our document object
	return $document->{_createdtimestamp};
}

#====================================================================================
# Subroutine to get the document file location
#====================================================================================
sub getDocFileLoc
{
	my ($document) = @_; # our document object
	return $document->{_fileloc};
}

#====================================================================================
# Subroutine to get the document transfer status
#====================================================================================
sub getDocTransferStatus
{
	my ($document) = @_; # our document object
	return $document->{_transferstatus};
}

#====================================================================================
# Subroutine to get the document log
#====================================================================================
sub getDocLog
{
	my ($document) = @_; # our document object
	return $document->{_log};
}

#======================================================================================
# Subroutine to get documents from the source database
#======================================================================================
sub getDocsFromSourceDB
{
	my (@patientList) = @_; # a list of patients from args

	my @docList = (); # initialize a list for document objects

    my $verbose = 1;

	# when we retrieve query results
	my ($pt_id, $visit_id, $note_id);
	my ($expressionname, $sourceuid, $errtxt, $validentry, $fileloc, $revised);
	my ($apprvby, $apprvts, $authoredby, $dos, $createdby, $createdts);
    my $lasttransfer;

    # retrieve all aliases that are marked for update
    my @aliasList = Alias::getAliasesMarkedForUpdate('Document');

	# Go through the list of Patient objects and get the information that we need
    # in order to search for the corresponding documents in the database
	foreach my $Patient (@patientList) {

		my $patientSer		    = $Patient->getPatientSer(); # get patient serial
		my $patientSourceUID    = $Patient->getPatientSourceUID();
        my $patientLastTransfer	= $Patient->getPatientLastTransfer(); # get last updated

        foreach my $Alias (@aliasList) {

            my $aliasSer            = $Alias->getAliasSer(); # get alias serial
            my $sourceDBSer         = $Alias->getAliasSourceDatabaseSer();
            my @expressions         = $Alias->getAliasExpressions(); 
            my $aliasLastTransfer   = $Alias->getAliasLastTransfer();
	        # convert expression list into a string enclosed in quotes
		    my $expressionText = join ',', map { qq/'$_->{_name}'/ } @expressions;

            # compare last updates to find the earliest date 
            my $formatted_PLU = Time::Piece->strptime($patientLastTransfer, "%Y-%m-%d %H:%M:%S");
            my $formatted_ALU = Time::Piece->strptime($aliasLastTransfer, "%Y-%m-%d %H:%M:%S");
            # get the diff in seconds
            my $date_diff = $formatted_PLU - $formatted_ALU;
            if ($date_diff < 0) {
                $lasttransfer = $patientLastTransfer;
            } else {
                $lasttransfer = $aliasLastTransfer;
            }

            # ARIA
            if ($sourceDBSer eq 1) {

                my $sourceDatabase = Database::connectToSourceDatabase($sourceDBSer);
        		my $docInfo_sql = "
	        		SELECT DISTINCT
		        		visit_note.pt_id,
			        	visit_note.pt_visit_id,
				        visit_note.visit_note_id,
    				    note_typ.note_typ_desc,
    	    			visit_note.revised_ind,
	    	    		visit_note.valid_entry_ind,
		    	    	visit_note.err_rsn_txt,
			    	    visit_note.doc_file_loc,
				        visit_note.appr_stkh_id,
				        visit_note.appr_tstamp,
    				    visit_note.author_stkh_id,
	    			    visit_note.note_tstamp,
		    		    visit_note.trans_log_userid,
			    	    visit_note.trans_log_tstamp
        			FROM	
	        			variansystem.dbo.Patient Patient,
		        		varianenm.dbo.visit_note visit_note,
			        	varianenm.dbo.note_typ note_typ,
				        varianenm.dbo.pt pt
        			WHERE
	        			pt.pt_id 			            = visit_note.pt_id
		        	AND pt.patient_ser			        = Patient.PatientSer
			        AND Patient.PatientSer		        = '$patientSourceUID'
        			AND visit_note.note_typ		        = note_typ.note_typ
	        		AND visit_note.appr_flag		    = 'A'
		        	AND	visit_note.trans_log_mtstamp	> '$lasttransfer'
                	AND note_typ.note_typ_desc          IN ($expressionText)
    		    ";

    	    	# prepare query
	    	    my $query = $sourceDatabase->prepare($docInfo_sql)
		    	    or die "Could not prepare query: " . $sourceDatabase->errstr;

    		    # execute query
    	    	$query->execute()
	    	    	or die "Could not execute query: " . $query->errstr;
    
                my $data = $query->fetchall_arrayref();
	        	foreach my $row (@$data) {

		        	my $document = new Document(); 

        			$pt_id			= $row->[0];
	        		$visit_id		= $row->[1];
		        	$note_id		= $row->[2];
    			    # so visit_note_id from varian manual claims to be "unique" but it's not
        			# I combine pt_id, visit_id, note_id to generate a unique Id for this document
	        		$sourceuid		= $pt_id . $visit_id . $note_id;
    
        			$expressionname	= $row->[3];
	        		$revised		= $row->[4];
		        	$validentry		= $row->[5];
			        $errtxt			= $row->[6];
        			$fileloc		= $row->[7];
	    		    $apprvby		= Staff::reassignStaff($row->[8], $sourceDBSer);
		    	    $apprvts		= convertDateTime($row->[9]);
                    $authoredby     = Staff::reassignStaff($row->[10]);
                    $dos            = convertDateTime($row->[11]);
                    $createdby      = Staff::reassignStaff($row->[12]);
                    $createdts      = convertDateTime($row->[13]);
                    	
		        	# Search through alias expression list to find associated
    		    	# expression serial number (in our DB)
	    		    my $expressionser;
    		    	foreach my $checkExpression (@expressions) {
        
	        			if ($checkExpression->{_name} eq $expressionname) { # match
        
		        			$expressionser = $checkExpression->{_ser};
			        		last; # break out of loop
				        }
        			}
    
        			$document->setDocSourceUID($sourceuid);
                    $document->setDocSourceDatabaseSer($sourceDBSer);
	        		$document->setDocPatientSer($patientSer);
		        	$document->setDocRevised($revised);
    	    		$document->setDocValidEntry($validentry);
        			$document->setDocErrorReasonText($errtxt);
	        		$document->setDocFileLoc($fileloc);
		        	$document->setDocAliasExpressionSer($expressionser);	
	    	    	$document->setDocApprovedBy($apprvby);
    			    $document->setDocApprovedTimeStamp($apprvts);
    		    	$document->setDocAuthoredBy($authoredby);
	    		    $document->setDocDateOfService($dos);
		        	$document->setDocCreatedBy($createdby);
			        $document->setDocCreatedTimeStamp($createdts);
	
    			    push(@docList, $document);
        		}

                $sourceDatabase->disconnect();
            }
        }
	}

	return @docList;
}

#======================================================================================
# Subroutine to check if a particular document exists in our MySQL db
#	@return: document object (if exists) .. NULL otherwise
#======================================================================================
sub inOurDatabase
{
	my ($document) = @_; # our document object

	my $sourceUID   = $document->getDocSourceUID(); # retrieve document id
    my $sourceDBSer = $document->getDocSourceDatabaseSer();
	
	my $DocSourceUIDInDB = 0; # false by default. Will be true if document exists
	my $ExistingDoc = (); # data to be entered if document exists

	# Other document variables, if it exists
	my ($ser, $revised, $validentry, $errtxt, $fileloc, $transferstatus, $aliasexpressionser, $log, $patientser);
	my ($apprvby, $apprvts, $authoredby, $dos, $createdby, $createdts);
	
	my $inDB_sql = "
		SELECT
			Document.PatientSerNum, 
			Document.DocumentId,
			Document.Revised,
			Document.ValidEntry,	
			Document.ErrorReasonText,
			Document.OriginalFileName,
			Document.TransferStatus,
			Document.AliasExpressionSerNum,
			Document.TransferLog,
            Document.DocumentSerNum,
			Document.ApprovedBySerNum,
			Document.ApprovedTimeStamp,
			Document.AuthoredBySerNum,
			Document.DateOfService,
       		Document.CreatedBySerNum,
			Document.CreatedTimeStamp
		FROM
			Document
		WHERE
			Document.DocumentId             = '$sourceUID'
        AND Document.SourceDatabaseSerNum   = '$sourceDBSer'
	";

	# prepare query
	my $query = $SQLDatabase->prepare($inDB_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {
	
		$patientser		    = $data[0];
		$DocSourceUIDInDB	= $data[1];
		$revised		    = $data[2];
		$validentry		    = $data[3];
		$errtxt			    = $data[4];
		$fileloc		    = $data[5];
		$transferstatus		= $data[6];
		$expressionser		= $data[7];
		$log			= $data[8];
        $ser            	= $data[9];
		$apprvby		= $data[10];
		$apprvts		= $data[11];
        $authoredby     = $data[12];
        $dos            = $data[13];
        $createdby      = $data[14];
        $createdts      = $data[15];
	}

	if ($DocSourceUIDInDB) {

		$ExistingDoc = new Document(); # initialize document object

        $ExistingDoc->setDocSer($ser);
        $ExistingDoc->setDocSourceDatabaseSer($sourceDBSer);
		$ExistingDoc->setDocSourceUID($DocSourceUIDInDB);
		$ExistingDoc->setDocPatientSer($patientser);
		$ExistingDoc->setDocRevised($revised);
		$ExistingDoc->setDocValidEntry($validentry);
		$ExistingDoc->setDocErrorReasonText($errtxt);
		$ExistingDoc->setDocFileLoc($fileloc);
		$ExistingDoc->setDocTransferStatus($transferstatus);
		$ExistingDoc->setDocAliasExpressionSer($expressionser);	
		$ExistingDoc->setDocLog($log);
		$ExistingDoc->setDocApprovedBy($apprvby);
		$ExistingDoc->setDocApprovedTimeStamp($apprvts);
		$ExistingDoc->setDocAuthoredBy($authoredby);
		$ExistingDoc->setDocDateOfService($dos);		
		$ExistingDoc->setDocCreatedBy($createdby);
		$ExistingDoc->setDocCreatedTimeStamp($createdts);

		return $ExistingDoc; # this is true (ie. document exists, return object)
	}

	else {return $ExistingDoc;} # this is false (ie. document DNE, return empty)
}

#======================================================================================
# Subroutine to copy/transfer our patient documents into a target directory using ftps
#======================================================================================
sub transferPatientDocuments
{
	my (@DocsList) = @_; # our list of documents from args

	my $lowriter = "/opt/libreoffice4.3/program/soffice.bin --writer";

    my $verbose = 1;

	#==============================================================
	# Loop over each document.
	#==============================================================
	foreach my $Document (@DocsList) {

        my $sourceDBSer = $Document->getDocSourceDatabaseSer();

        my $sourceDatabase = Database::connectToSourceDatabase($sourceDBSer);

		# check if document log exists in our database
		my $DocExists = $Document->inOurDatabase();

		my $finalfileloc = $Document->getDocFileLoc(); # document file name
	
		# get directory where we store the .pdf files (converted from .doc)
		my $pdfDir = $ftpsObject->getFTPSPDFDir(); 

        print "PDF: $pdfDir LOC: $finalfileloc\n" if $verbose;

		my @filefields = split /\./, $finalfileloc; # split from file extension
		my $finalfilenum = $filefields[0]; # remove extension of file
		my $finalextension = $filefields[1]; # get the extension

		my $localDir = $ftpsObject->getFTPSLocalDir(); # get local directory of documents

		my $sourcefile = "$localDir/$finalfileloc"; # concatenate directory and file

        print "Source file: $sourcefile\n" if $verbose;
		
		my ($originalfileloc, $originalfilenum, $originalextension);
	
 		# check if document file exists on Aria server harddrive
  		if (-e $sourcefile)
  		{

			if ($DocExists) { # document log exists in our MySQL database

				print "DOC EXISTS\n" if $verbose;

				my $ExistingDoc = dclone($DocExists); # reassign variable


				# CASE: Document was transferred previously.
				#	Now document was modified and probably has been amended or deleted.
                #	We send error template to replace original document
                my $validentry = $Document->getDocValidEntry();

                if ($validentry eq "N") { # errored out document

            		# find when the document was last updated (if the document has been errored out 
            		# this info would correspond to the user who errored out said document)
            		my $lastModUser;
            		my $lastModTimeStamp;

            		my $last_mod_sql = "
			            SELECT 
            				visit_note.trans_log_mtstamp,
			            	RTRIM(visit_note.trans_log_muserid)
            			FROM
			            	varianenm.dbo.visit_note visit_note
            			WHERE
			            	visit_note.doc_file_loc = '$finalfileloc'
            		";

            		# prepare query
            		my $query = $sourceDatabase->prepare($last_mod_sql)
            			or die "Could not prepare query: " . $sourceDatabase->errstr;

            		# execute query
            		$query->execute()
			            or die "Could not execute query: " . $query->errstr;

            		while (my @data = $query->fetchrow_array()) {
			    
            			$lastModTimeStamp	= convertDateTime($data[0]);
            			$lastModUser		= Staff::reassignStaff($data[1], $sourceDBSer);
            		}

                    # create an error file
                    my $sourceErrorFile = "$pdfDir/$finalfilenum.err";
                    
                    #####################################
					# Write error file information
					#####################################
                    my $error_reason = $Document->getDocErrorReasonText();
                    my $error_text = <<END;
[[ English ]]
This document has been deleted by: $lastModUser on $lastModTimeStamp.
Reason for deletion: $error_reason


[[ Français ]]
Ce document a été supprimé par: $lastModUser - $lastModTimeStamp.
Raison de la suppression: $error_reason
END

                    # Open an error file that we will write to
                    open(my $error, '>', $sourceErrorFile) or die "Could not open file '$sourceErrorFile' $!";
                    # write to file with our error information
                    print $error $error_text;
                    close $error; # close handle

					# Convert error file to .pdf 
					system("$lowriter --headless --convert-to pdf --nologo --outdir $pdfDir $sourceErrorFile");
                    $Document->setDocFileLoc("$finalfilenum.pdf"); # record that it has been changed 

                }

                # CASE: Document was transferred previously.
                #   Now document was modified and amended
				#	We send new document, and update database info
                if ($validentry eq "Y") {

    				# Convert .doc to .pdf if .doc
	    			if ($finalextension eq "doc") {
		    			system("$lowriter --headless --convert-to pdf --nologo --outdir $pdfDir $sourcefile");
                    	$Document->setDocFileLoc("$finalfilenum.pdf"); # record that it has been changed 
    				}
	    			# if already pdf, just copy
		    		if ($finalextension eq "pdf") {
			    		system("cp $sourcefile $pdfDir/$finalfileloc");
				    }
  
                }

                # set transfer status to true
	    		$Document->setDocTransferStatus("T");
	
	    		# log this transfer as a success
		    	$Document->setDocLog("Transfer successful");

                # update existing document
				my $UpdatedDoc = $Document->compareWith($ExistingDoc);

				# update document table
				$UpdatedDoc->updateDatabase();	

                # send push notification
                my $docSer = $UpdatedDoc->getDocSer();
                my $patientSer = $UpdatedDoc->getDocPatientSer();
                PushNotification::sendPushNotification($patientSer, $docSer, 'UpdDocument');

			} else { # document DNE in our database
			
				print "NEW DOCUMENT\n" if $verbose; 

                # determine whether document is errored out or not
                my $validentry = $Document->getDocValidEntry();

                if ($validentry eq "N") { # errored out 

            		# find when the document was last updated (if the document has been errored out 
            		# this info would correspond to the user who errored out said document)
            		my $lastModUser;
            		my $lastModTimeStamp;

            		my $last_mod_sql = "
			            SELECT 
            				visit_note.trans_log_mtstamp,
			            	RTRIM(visit_note.trans_log_muserid)
            			FROM
			            	varianenm.dbo.visit_note visit_note
            			WHERE
			            	visit_note.doc_file_loc = '$finalfileloc'
            		";

            		# prepare query
            		my $query = $sourceDatabase->prepare($last_mod_sql)
            			or die "Could not prepare query: " . $sourceDatabase->errstr;

            		# execute query
            		$query->execute()
			            or die "Could not execute query: " . $query->errstr;

            		while (my @data = $query->fetchrow_array()) {
			    
            			$lastModTimeStamp	= convertDateTime($data[0]);
            			$lastModUser		= Staff::reassignStaff($data[1], $sourceDBSer);
            		}

                    # create an error file
                    my $sourceErrorFile = "$pdfDir/$finalfilenum.err";
                    
                    #####################################
					# Write error file information
					#####################################
                    my $error_reason = $Document->getDocErrorReasonText();
                    my $error_text = <<END;
[[ English ]]
This document has been deleted by: $lastModUser on $lastModTimeStamp.
Reason for deletion: $error_reason


[[ Français ]]
Ce document a été supprimé par: $lastModUser - $lastModTimeStamp.
Raison de la suppression: $error_reason
END

                    # Open an error file that we will write to
                    open(my $error, '>', $sourceErrorFile) or die "Could not open file '$sourceErrorFile' $!";
                    # write to file with our error information
                    print $error $error_text;
                    close $error; # close handle

					# Convert error file to .pdf 
					system("$lowriter --headless --convert-to pdf --nologo --outdir $pdfDir $sourceErrorFile");
                    $Document->setDocFileLoc("$finalfilenum.pdf"); # record that it has been changed 



                }
                if ($validentry eq "Y") { # not errored out
    
                    # Convert .doc to .pdf if .doc
    				if ($finalextension eq "doc") {
	    				system("$lowriter --headless --convert-to pdf --nologo --outdir $pdfDir $sourcefile");
            			$Document->setDocFileLoc("$finalfilenum.pdf"); # change extension for database
    				}
    				# if already pdf, just copy
		    		if ($finalextension eq "pdf") {
			    		system("cp $sourcefile $pdfDir/$finalfileloc");
			    	}
                }
  		
				# set transfer status to true
				$Document->setDocTransferStatus("T");
	
				# log this transfer as a success
				$Document->setDocLog("Transfer successful");
				
				# insert Document log into our database
				$Document = $Document->insertDocIntoOurDB();

                # send push notification
                my $docSer = $Document->getDocSer();
                my $patientSer = $Document->getDocPatientSer();
                PushNotification::sendPushNotification($patientSer, $docSer, 'Document');
				
			}
        }

		# document file DNE
		else
		{	
			# set the transfer status to false
			$Document->setDocTransferStatus("F");
			# log this as a type of error
			$Document->setDocLog("No such file exists in the directory");
            # Change extension for database
            $Document->setDocFileLoc("$finalfilenum.pdf"); # record that it has been changed 

			if ($DocExists) { # document log exists

				my $ExistingDoc = dclone($DocExists); # reassign variable

				my $UpdatedDoc = $Document->compareWith($ExistingDoc);

				# simply update document log
				$UpdatedDoc->updateDatabase();
			
			} else { # document log DNE in our database
	
				# insert Document log into our database
				$Document = $Document->insertDocIntoOurDB();
			}

		} # END else 

        $sourceDatabase->disconnect();

	} # END docList loop

	return;
}
#======================================================================================
# Subroutine to insert our document info in our database
#======================================================================================
sub insertDocIntoOurDB
{
	my ($document) = @_; # our document object to insert

	my $sourceuid			= $document->getDocSourceUID();
    my $sourcedbser         = $document->getDocSourceDatabaseSer();
	my $patientser			= $document->getDocPatientSer();
	my $revised			    = $document->getDocRevised();
	my $validentry			= $document->getDocValidEntry();
	my $errtxt			    = $document->getDocErrorReasonText();
	my $fileloc			    = $document->getDocFileLoc();
	my $transferstatus		= $document->getDocTransferStatus();
	my $expressionser		= $document->getDocAliasExpressionSer();	
	my $log				    = $document->getDocLog();	
	my $approvedby			= $document->getDocApprovedBy();
	my $approvedtimestamp   = $document->getDocApprovedTimeStamp();
	my $authoredby			= $document->getDocAuthoredBy();
	my $dateofservice		= $document->getDocDateOfService();
	my $createdby			= $document->getDocCreatedBy();
	my $createdtimestamp	= $document->getDocCreatedTimeStamp();

	my $insert_sql = "
		INSERT INTO 
			Document (
				DocumentSerNum, 
				PatientSerNum,
                SourceDatabaseSerNum,
				DocumentId, 
				ApprovedBySerNum,
				ApprovedTimeStamp,
                AuthoredBySerNum,
                DateOfService,
				AliasExpressionSerNum, 
				Revised, 
				ValidEntry, 
				ErrorReasonText, 
				OriginalFileName, 
				FinalFileName,
                CreatedBySerNum,
                CreatedTimeStamp,
				TransferStatus, 
				TransferLog,
                DateAdded,
				LastUpdated
			)
		VALUES (
			NULL,
			'$patientser',
            '$sourcedbser',
			'$sourceuid',
			'$approvedby',
			'$approvedtimestamp',
            '$authoredby',
            '$dos',
			'$expressionser',
			'$revised',
			'$validentry',
			'$errtxt',
			'$fileloc',
			'$fileloc',
            '$createdby',
            '$createdts',
			'$transferstatus',	
			'$log',
            NOW(),
			NULL
		)
	";
		
	# prepare query
	my $query = $SQLDatabase->prepare($insert_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	# Retrieve the TaskSer
	my $ser = $SQLDatabase->last_insert_id(undef, undef, undef, undef);

	# Set the serial in our document object
	$document->setDocSer($ser);

	return $document;
}

#======================================================================================
# Subroutine to update our database with the document's updated info
#======================================================================================
sub updateDatabase
{
	my ($document) = @_; # our document 

	my $sourceuid		    = $document->getDocSourceUID();
    my $sourcedbser         = $document->getDocSourceDatabaseSer();
	my $patientser		    = $document->getDocPatientSer();
	my $revised			    = $document->getDocRevised();
	my $validentry		    = $document->getDocValidEntry();
	my $errtxt			    = $document->getDocErrorReasonText();
	my $fileloc			    = $document->getDocFileLoc();
	my $transferstatus	    = $document->getDocTransferStatus();
	my $expressionser	    = $document->getDocAliasExpressionSer();	
	my $log				    = $document->getDocLog();	
	my $approvedby		    = $document->getDocApprovedBy();
	my $approvedtimestamp	= $document->getDocApprovedTimeStamp();
	my $authoredby			= $document->getDocAuthoredBy();
	my $dateofservice		= $document->getDocDateOfService();
	my $createdby			= $document->getDocCreatedBy();
	my $createdtimestamp	= $document->getDocCreatedTimeStamp();

	my $update_sql = "
		UPDATE
			Document
		SET 
			PatientSerNum		    = '$patientser',
			Revised		 	        = '$revised',
			ValidEntry		        = '$validentry',
			ErrorReasonText		    = '$errtxt',
			FinalFileName	 	    = '$fileloc',
			TransferStatus		    = '$transferstatus',
			AliasExpressionSerNum	= '$expressionser',
			ApprovedBySerNum	    = '$approvedby',
			ApprovedTimeStamp	    = '$approvedtimestamp',
 			AuthoredBySerNum	= '$authoredby',
			DateOfService		= '$dateofservice',
   			CreatedBySerNum		= '$createdby',
			CreatedTimeStamp	= '$createdtimestamp',        
			TransferLog		        = '$log',
            ReadStatus              = 0
		WHERE
			DocumentId		        = '$sourceuid'
        AND SourceDatabaseSerNum    = '$sourcedbser'
		";

	# prepare query
	my $query = $SQLDatabase->prepare($update_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
}

#======================================================================================
# Subroutine to compare two document objects. If different, use setter functions
# to update document object.
#======================================================================================
sub compareWith
{
	my ($SuspectDoc, $OriginalDoc) = @_; # our two document objects from arguments 
	my $UpdatedDoc = dclone($OriginalDoc);

	# retrieve parameters...
	# Suspect document...
	my $Srevised			= $SuspectDoc->getDocRevised();
	my $Svalidentry			= $SuspectDoc->getDocValidEntry();
	my $Serrtxt			    = $SuspectDoc->getDocErrorReasonText();
	my $Saliasexpressionser	= $SuspectDoc->getDocAliasExpressionSer();
	my $Sapprovedby			= $SuspectDoc->getDocApprovedBy();
	my $Sapprovedtimestamp	= $SuspectDoc->getDocApprovedTimeStamp();
	my $Sfileloc			= $SuspectDoc->getDocFileLoc();
	my $Stransferstatus		= $SuspectDoc->getDocTransferStatus();
	my $Slog			    = $SuspectDoc->getDocLog();	
	my $Sauthoredby			= $SuspectDoc->getDocAuthoredBy();
	my $Sdateofservice		= $SuspectDoc->getDocDateOfService();
	my $Screatedby			= $SuspectDoc->getDocCreatedBy();
	my $Screatedtimestamp		= $SuspectDoc->getDocCreatedTimeStamp();

	# Original document...	
	my $Orevised			= $OriginalDoc->getDocRevised();
	my $Ovalidentry			= $OriginalDoc->getDocValidEntry();
	my $Oerrtxt			    = $OriginalDoc->getDocErrorReasonText();
	my $Oaliasexpressionser	= $OriginalDoc->getDocAliasExpressionSer();	
	my $Oapprovedby			= $OriginalDoc->getDocApprovedBy();
	my $Oapprovedtimestamp	= $OriginalDoc->getDocApprovedTimeStamp();
	my $Ofileloc			= $OriginalDoc->getDocFileLoc();
	my $Otransferstatus		= $OriginalDoc->getDocTransferStatus();
	my $Olog			    = $OriginalDoc->getDocLog();	
	my $Oauthoredby			= $OriginalDoc->getDocAuthoredBy();
	my $Odateofservice		= $OriginalDoc->getDocDateOfService();
	my $Ocreatedby			= $OriginalDoc->getDocCreatedBy();
	my $Ocreatedtimestamp	= $OriginalDoc->getDocCreatedTimeStamp();

	# go through each parameter
	if ($Srevised ne $Orevised) {

		print "Document Revised Status has changed from '$Orevised' to '$Srevised'\n";
		my $updatedRevised = $UpdatedDoc->setDocRevised($Srevised); # update
		print "Will update database entry to '$updatedRevised'.\n";
	}
	if ($Svalidentry ne $Ovalidentry) {

		print "Document Valid Entry Status has changed from '$Ovalidentry' to '$Svalidentry'\n";
		my $updatedValidEntry = $UpdatedDoc->setDocValidEntry($Svalidentry); # update
		print "Will update database entry to '$updatedValidEntry'.\n";
	}
	if ($Serrtxt ne $Oerrtxt) {

		print "Document Error Reason Text has changed from '$Oerrtxt' to '$Serrtxt'\n";
		my $updatedErrorReasonText = $UpdatedDoc->setDocErrorReasonText($Serrtxt); # update
		print "Will update database entry to '$updatedErrorReasonText'.\n";
	}
	if ($Sfileloc ne $Ofileloc) {

		print "Document Final File Name has changed from '$Ofileloc' to '$Sfileloc'\n";
		my $updatedFileLoc = $UpdatedDoc->setDocFileLoc($Sfileloc); # update
		print "Will update database entry to '$updatedFileLoc'.\n";
	}
	if ($Saliasexpressionser ne $Oaliasexpressionser) {

		print "Document Alias Expression Serial has changed from '$Oaliasexpressionser' to '$Saliasexpressionser'\n";
		my $updatedAESer = $UpdatedDoc->setDocAliasExpressionSer($Saliasexpressionser); # update
		print "Will update database entry to '$updatedAESer'.\n";
	}
	if ($Sapprovedby ne $Oapprovedby) {

		print "Document Approved By has change from '$Oapprovedby' to '$Sapprovedby'\n";
		my $updatedApprovedBy = $UpdatedDoc->setDocApprovedBy($Sapprovedby); # update
		print "Will update database entry to '$updatedApprovedBy'.\n";
	}
	if ($Sapprovedtimestamp ne $Oapprovedtimestamp) {

		print "Document Approved TimeStamp has changed from '$Oapprovedtimestamp' to '$Sapprovedtimestamp'\n";
		my $updatedApprovedTimeStamp = $UpdatedDoc->setDocApprovedTimeStamp($Sapprovedtimestamp); # update
		print "Will update database entry to '$updatedApprovedTimeStamp'.\n";
	}
 	if ($Sauthoredby ne $Oauthoredby) {

		print "Document Authored By has changed from '$Oauthoredby' to '$Sauthoredby'\n";
		my $updatedAuthoredBy = $UpdatedDoc->setDocAuthoredBy($Sauthoredby); # update
		print "Will update database entry to '$updatedAuthoredBy'.\n";
	}
	if ($Sdateofservice ne $Odateofservice) {

		print "Document Date Of Service has changed from '$Odateofservice' to '$Sdateofservice'\n";
		my $updatedDateOfService = $UpdatedDoc->setDocDateOfService($Sdateofservice); # update
		print "Will update database entry to '$updatedDateOfService'.\n";
	}
	if ($Screatedby ne $Ocreatedby) {

		print "Document Created By has changed from '$Ocreatedby' to '$Screatedby'\n";
		my $updatedCreatedBy = $UpdatedDoc->setDocCreatedBy($Screatedby); # update
		print "Will update database entry to '$updatedCreatedBy'.\n";
	}
	if ($Screatedtimestamp ne $Ocreatedtimestamp) {

		print "Document Created TimeStamp has changed from '$Ocreatedtimestamp' to '$Screatedtimestamp'\n";
		my $updatedCreatedTimeStamp = $UpdatedDoc->setDocCreatedTimeStamp($Screatedtimestamp); # update
		print "Will update database entry to '$updatedCreatedTimeStamp'.\n";
	}   
	if ($Stransferstatus ne $Otransferstatus) {

		print "Document Transfer Status has changed from '$Otransferstatus' to '$Stransferstatus'\n";
		my $updatedTransferStatus = $UpdatedDoc->setDocTransferStatus($Stransferstatus); # update
		print "Will update database entry to '$updatedTransferStatus'.\n";
	}
	if ($Slog ne $Olog) {

		print "Document Transfer Log has changed from '$Olog' to '$Slog'\n";
		my $updatedLog = $UpdatedDoc->setDocLog($Slog); # update
		print "Will update database entry to '$updatedLog'.\n";
	}

	return $UpdatedDoc;
}

#======================================================================================
# Subroutine to convert date format
# 	Converts "Jul 13 2013 4:23pm" to "2013-07-13 16:23:00"
#======================================================================================
sub convertDateTime 
{
	my ($inputDate) = @_;

	my $dateFormat = Time::Piece->strptime($inputDate,"%b %d %Y %I:%M%p");

	my $convertedDate = $dateFormat->strftime("%Y-%m-%d %H:%M:%S");

	return $convertedDate;
}

# To exit/return always true (for the module itself)
1;	

