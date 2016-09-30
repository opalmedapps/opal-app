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

#---------------------------------------------------------------------------------
# Connect to the databases
#---------------------------------------------------------------------------------

my $sourceDatabase	= $Database::sourceDatabase;
my $SQLDatabase		= $Database::targetDatabase;

#-----------------------------------------------------------------------
# Connect to FTPS
#-----------------------------------------------------------------------
my $targetFTPS = $FTPS::targetFTPS;
my $ftpsObject = $FTPS::ftpsObject;
#my $visitLevelTargetFTPS = $FTPS::visitLevelTargetFTPS;
#my $visitLevelFtpsObject = $FTPS::visitLevelFtpsObject;

#====================================================================================
# Constructor for our Docs class 
#====================================================================================
sub new
{
	my $class = shift;
	my $document = {
		_ser			=> undef,
		_id			    => undef,
		_patientser		=> undef,
		_revised		=> undef,
		_validentry		=> undef,
		_errtxt			=> undef,
		_aliasexpressionser	=> undef,
		_approvedby		=> undef,
		_approvedtimestamp	=> undef,
		_fileloc		=> undef,
		_transferstatus		=> undef,
		_log			=> undef,
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
# Subroutine to set the document id
#====================================================================================
sub setDocId
{
	my ($document, $id) = @_; # doc object with provided id in arguments
	$document->{_id} = $id; # set the id
	return $document->{_id};
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
# Subroutine to get the document id
#====================================================================================
sub getDocId
{
	my ($document) = @_; # our document object
	return $document->{_id};
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
# Subroutine to get documents from the ARIA db for automatic cron
#======================================================================================
sub getDocsFromSourceDB
{
	my (@patientList) = @_; # a list of patients from args

	my @docList = (); # initialize a list for document objects

    my $verbose = 1;
	# when we retrieve query results
	my ($pt_id, $visit_id, $note_id);
	my ($expressionname, $id, $errtxt, $validentry, $fileloc, $revised);
	my ($apprvby, $apprvts);
    my $lastupdated;

    # retrieve all aliases that are marked for update
    my @aliasList = Alias::getAliasesMarkedForUpdate('Document');

	# Go through the list of Patient objects and get the information that we need
    # in order to search for the corresponding documents in the database
	foreach my $Patient (@patientList) {


		my $patientSer		    = $Patient->getPatientSer(); # get patient serial
		my $ariaSer		        = $Patient->getPatientAriaSer(); # get aria serial
		my $patientlastupdated	= $Patient->getPatientLastUpdated(); # get last updated

        foreach my $Alias (@aliasList) {

            my $aliasSer            = $Alias->getAliasSer(); # get alias serial
            my @expressions         = $Alias->getAliasExpressions(); 
            my $aliaslastupdated    = $Alias->getAliasLastUpdated();
	        # convert expression list into a string enclosed in quotes
		    my $expressionText = join ',', map { qq/'$_->{_name}'/ } @expressions;

            # compare last updates to find the earliest date 
            my $formatted_PLU = Time::Piece->strptime($patientlastupdated, "%Y-%m-%d %H:%M:%S");
            my $formatted_ALU = Time::Piece->strptime($aliaslastupdated, "%Y-%m-%d %H:%M:%S");
            # get the diff in seconds
            my $date_diff = $formatted_PLU - $formatted_ALU;
            if ($date_diff < 0) {
                $lastupdated = $patientlastupdated;
            } else {
                $lastupdated = $aliaslastupdated;
            }

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
				    visit_note.appr_tstamp
    			FROM	
	    			variansystem.dbo.Patient Patient,
		    		varianenm.dbo.visit_note visit_note,
			    	varianenm.dbo.note_typ note_typ,
				varianenm.dbo.pt pt
    			WHERE
	    			pt.pt_id 			                = visit_note.pt_id
		    	AND 	pt.patient_ser			        = Patient.PatientSer
			AND 	Patient.PatientSer		        = '$ariaSer'
    			AND   	visit_note.note_typ		        = note_typ.note_typ
	    		AND 	visit_note.appr_flag		    = 'A'
		    	AND	visit_note.trans_log_mtstamp	> '$lastupdated'
                	AND     note_typ.note_typ_desc          IN ($expressionText)
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
	    		$id			= $pt_id . $visit_id . $note_id;

    			$expressionname	= $row->[3];
	    		$revised		= $row->[4];
		    	$validentry		= $row->[5];
			    $errtxt			= $row->[6];
    			$fileloc		= $row->[7];
			$apprvby		= Staff::reassignStaff($row->[8]);
			$apprvts		= convertDateTime($row->[9]);

                	
		    	# Search through alias expression list to find associated
    			# expression serial number (in our DB)
	    		my $expressionser;
		    	foreach my $checkExpression (@expressions) {
    
	    			if ($checkExpression->{_name} eq $expressionname) { # match
    
		    			$expressionser = $checkExpression->{_ser};
			    		last; # break out of loop
				    }
    			}

    			$document->setDocId($id);
	    		$document->setDocPatientSer($patientSer);
		    	$document->setDocRevised($revised);
			$document->setDocValidEntry($validentry);
    			$document->setDocErrorReasonText($errtxt);
	    		$document->setDocFileLoc($fileloc);
		    	$document->setDocAliasExpressionSer($expressionser);	
			$document->setDocApprovedBy($apprvby);
			$document->setDocApprovedTimeStamp($apprvts);
	
			push(@docList, $document);
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
	my $documentId = $document->getDocId(); # retrieve document id
	
	my $DocIdInDB = 0; # false by default. Will be true if document exists
	my $ExistingDoc = (); # data to be entered if document exists

	# Other document variables, if it exists
	my ($ser, $revised, $validentry, $errtxt, $fileloc, $transferstatus, $aliasexpressionser, $log, $patientser);
	my ($apprvby, $apprvts);
	
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
			Document.ApprovedTimeStamp
		FROM
			Document
		WHERE
			Document.DocumentId = '$documentId'
		";

	# prepare query
	my $query = $SQLDatabase->prepare($inDB_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {
	
		$patientser		= $data[0];
		$DocIdInDB		= $data[1];
		$revised		= $data[2];
		$validentry		= $data[3];
		$errtxt			= $data[4];
		$fileloc		= $data[5];
		$transferstatus		= $data[6];
		$expressionser		= $data[7];
		$log			= $data[8];
        	$ser            	= $data[9];
		$apprvby		= $data[10];
		$apprvts		= $data[11];
	}

	if ($DocIdInDB) {

		$ExistingDoc = new Document(); # initialize document object

        	$ExistingDoc->setDocSer($ser);
		$ExistingDoc->setDocId($DocIdInDB);
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
				#	We send new document, and update database info

				# Convert .doc to .pdf if .doc
				if ($finalextension eq "doc") {
					system("$lowriter --headless --convert-to pdf --nologo --outdir $pdfDir $sourcefile");
                    			$Document->setDocFileLoc("$finalfilenum.pdf"); # record that it has been changed 
				}
				# if already pdf, just copy
				if ($finalextension eq "pdf") {
					system("cp $sourcefile $pdfDir/$finalfileloc");
				}
  
                		# set transfer status to true
				$Document->setDocTransferStatus("T");
	
				# log this transfer as a success
				$Document->setDocLog("Transfer successful");

				my $UpdatedDoc = $Document->compareWith($ExistingDoc);

				# update document table
				$UpdatedDoc->updateDatabase();	

			} else { # document DNE in our database
			
					print "NEW DOCUMENT\n" if $verbose; 

					# Convert .doc to .pdf if .doc
					if ($finalextension eq "doc") {
						system("$lowriter --headless --convert-to pdf --nologo --outdir $pdfDir $sourcefile");
                        			$Document->setDocFileLoc("$finalfilenum.pdf"); # change extension for database
					}
					# if already pdf, just copy
					if ($finalextension eq "pdf") {
						system("cp $sourcefile $pdfDir/$finalfileloc");
					}
  		
					# set transfer status to true
					$Document->setDocTransferStatus("T");
	
					# log this transfer as a success
					$Document->setDocLog("Transfer successful");
				
					# insert Document log into our database
					$Document = $Document->insertDocIntoOurDB();
				
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

	} # END docList loop

	return;
}
#======================================================================================
# Subroutine to insert our document info in our database
#======================================================================================
sub insertDocIntoOurDB
{
	my ($document) = @_; # our document object to insert

	my $id				= $document->getDocId();
	my $patientser			= $document->getDocPatientSer();
	my $revised			= $document->getDocRevised();
	my $validentry			= $document->getDocValidEntry();
	my $errtxt			= $document->getDocErrorReasonText();
	my $fileloc			= $document->getDocFileLoc();
	my $transferstatus		= $document->getDocTransferStatus();
	my $expressionser		= $document->getDocAliasExpressionSer();	
	my $log				= $document->getDocLog();	
	my $approvedby			= $document->getDocApprovedBy();
	my $approvedtimestamp		= $document->getDocApprovedTimeStamp();

	my $insert_sql = "
		INSERT INTO 
			Document (
				DocumentSerNum, 
				PatientSerNum,
				DocumentId, 
				ApprovedBySerNum,
				ApprovedTimeStamp,
				AliasExpressionSerNum, 
				Revised, 
				ValidEntry, 
				ErrorReasonText, 
				OriginalFileName, 
				FinalFileName, 
				TransferStatus, 
				TransferLog,
                DateAdded,
				LastUpdated
			)
		VALUES (
			NULL,
			'$patientser',
			'$id',
			'$approvedby',
			'$approvedtimestamp',
			'$expressionser',
			'$revised',
			'$validentry',
			'$errtxt',
			'$fileloc',
			'$fileloc',
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

	my $id				= $document->getDocId();
	my $patientser			= $document->getDocPatientSer();
	my $revised			= $document->getDocRevised();
	my $validentry			= $document->getDocValidEntry();
	my $errtxt			= $document->getDocErrorReasonText();
	my $fileloc			= $document->getDocFileLoc();
	my $transferstatus		= $document->getDocTransferStatus();
	my $expressionser		= $document->getDocAliasExpressionSer();	
	my $log				= $document->getDocLog();	
	my $approvedby			= $document->getDocApprovedBy();
	my $approvedtimestamp		= $document->getDocApprovedTimeStamp();

	my $update_sql = "
		UPDATE
			Document
		SET 
			PatientSerNum		= '$patientser',
			Revised		 	= '$revised',
			ValidEntry		= '$validentry',
			ErrorReasonText		= '$errtxt',
			FinalFileName	 	= '$fileloc',
			TransferStatus		= '$transferstatus',
			AliasExpressionSerNum	= '$expressionser',
			ApprovedBySerNum	= '$approvedby',
			ApprovedTimeStamp	= '$approvedtimestamp',
			TransferLog		= '$log'
		WHERE
			DocumentId		= '$id'
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
	my $Serrtxt			= $SuspectDoc->getDocErrorReasonText();
	my $Saliasexpressionser		= $SuspectDoc->getDocAliasExpressionSer();
	my $Sapprovedby			= $SuspectDoc->getDocApprovedBy();
	my $Sapprovedtimestamp		= $SuspectDoc->getDocApprovedTimeStamp();
	my $Sfileloc			= $SuspectDoc->getDocFileLoc();
	my $Stransferstatus		= $SuspectDoc->getDocTransferStatus();
	my $Slog			= $SuspectDoc->getDocLog();	

	# Original document...	
	my $Orevised			= $OriginalDoc->getDocRevised();
	my $Ovalidentry			= $OriginalDoc->getDocValidEntry();
	my $Oerrtxt			= $OriginalDoc->getDocErrorReasonText();
	my $Oaliasexpressionser		= $OriginalDoc->getDocAliasExpressionSer();	
	my $Oapprovedby			= $OriginalDoc->getDocApprovedBy();
	my $Oapprovedtimestamp		= $OriginalDoc->getDocApprovedTimeStamp();
	my $Ofileloc			= $OriginalDoc->getDocFileLoc();
	my $Otransferstatus		= $OriginalDoc->getDocTransferStatus();
	my $Olog			= $OriginalDoc->getDocLog();	

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

