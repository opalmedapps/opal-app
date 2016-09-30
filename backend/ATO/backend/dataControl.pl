#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 07-Aug-2015 ++ File: dataControl.pl
#---------------------------------------------------------------------------------
# Perl script that acts as a cronjob for populating the MySQL database with selected
# information. This script is called from the crontab.  
#
# We use our custom Perl Modules to help us with getting information and 
# setting them into the appropriate place. 

# DEV
use lib '/usr/lib/cgi-bin/dev/ATO/modules'; # specify where are modules are

# PRO
# use lib '/usr/lib/cgi-bin/DB/ATOules'; # specify where are modules are

#-----------------------------------------------------------------------
# Packages/Modules
#-----------------------------------------------------------------------
use CGI qw(:standard);
use CGI::Carp qw(fatalsToBrowser);
use Time::Piece;
use POSIX;
use Storable qw(dclone);

use Database; # custom Database.pm
use Patient; # custom Patient.pm
use Task; # custom Task.pm
use Appointment; # custom Appointment.pm
use ResourceAppointment; # custom ResourceAppointment.pm
use Document; # custom Document.pm
use Alias; # custom Alias.pm
use Doctor; # custom Doctor.pm
use Diagnosis; # custom Diagnosis.pm
use PatientDoctor; # custom PatientDoctor.pm
use TestResult; # custom TestResult.pm
use Cron; # custon Cron.pm
use PostControl; # custom PostControl.pm
use Announcement; # custom Announcement.pm
use TxTeamMessage; # custom TxTeamMessage.pm
use EducationalMaterialControl; # custom EducationalMaterialControl.pm
use EducationalMaterial; # custom EducationalMaterial.pm
use Priority; # custom Priority.pm

#-----------------------------------------------------------------------
# Connect to the databases
#-----------------------------------------------------------------------
my $sourceDatabase = $Database::sourceDatabase; # ARIA
my $targetDatabase = $Database::targetDatabase; # MySQL

# Get the current time (for last-updates/logs)
my $start_datetime = strftime("%Y-%m-%d %H:%M:%S", localtime(time));

# Log that the script is initialized in the cronlog
Cron::setCronLog("Started", $start_datetime);

#-----------------------------------------------------------------------
# Parameters
#-----------------------------------------------------------------------
my @patientListForUpdate = (); # this will hold the list of patients scheduled for update
my @PDList = (); 
my @TaskList = (); 
my @ApptList = (); 
my @DocList = ();
my @DiagnosisList = ();
my @PriorityList = ();
my @TRList = ();
my @RAList = ();

#=========================================================================================
# Retrieve all patients that are marked for update
#=========================================================================================
@patientListForUpdate = Patient::getPatientsMarkedForUpdate(); 

print "Got patients\n";
##########################################################################################
# 
# Data Retrieval PATIENTDOCTORS - get list of patient-doctor info updated since last update
#
##########################################################################################
@PDList = PatientDoctor::getPatientDoctorsFromSourceDB(@patientListForUpdate);
#=========================================================================================
# Loop over each PD. Various functions are done.
#=========================================================================================
foreach my $PatientDoctor (@PDList) {

	# check if patient exists in our database
	my $PDExists = $PatientDoctor->inOurDatabase();

	if ($PDExists) { # patientdoctor exists

		my $ExistingPD = dclone($PDExists); # reassign variable	

		# compare our retrieve PatientDoctor with existing PD
		# update is done on the original (existing) PD
		my $UpdatedPD = $PatientDoctor->compareWith($ExistingPD);

		# after updating our PatientDoctor object, update the database
		$UpdatedPD->updateDatabase();

	} else { # patient doctor DNE 

		# insert PatientDoctor into our database
		$PatientDoctor->insertPatientDoctorIntoOurDB();
	}
}

print "Got PDs\n";
##########################################################################################
# 
# Data Retrieval DIAGNOSES - get list of diagnosis info updated since last update
#
##########################################################################################
@DiagnosisList = Diagnosis::getDiagnosesFromSourceDB(@patientListForUpdate);

#=========================================================================================
# Loop over each diagnosis. Various functions are done.
#=========================================================================================
foreach my $Diagnosis (@DiagnosisList) {

	# check if diagnosis exists in our database
	my $DiagnosisExists = $Diagnosis->inOurDatabase();

	if ($DiagnosisExists) { # diagnosis exists

		my $ExistingDiagnosis = dclone($DiagnosisExists); # reassign variable	

		# compare our retrieve Diagnosis with existing Diagnosis
		# update is done on the original (existing) Diagnosis
		my $UpdatedDiagnosis = $Diagnosis->compareWith($ExistingDiagnosis);

		# after updating our Diagnosis object, update the database
		$UpdatedDiagnosis->updateDatabase();

	} else { # diagnosis DNE 
				
		# insert Diagnosis into our database
		$Diagnosis->insertDiagnosisIntoOurDB();
	}
}

print "Got diagnosis\n";

##########################################################################################
# 
# Data Retrieval PRIORITIES - get list of priority info updated since last update
#
##########################################################################################
@PriorityList = Priority::getPrioritiesFromSourceDB(@patientListForUpdate);

#=========================================================================================
# Loop over each priority. Various functions are done.
#=========================================================================================
foreach my $Priority (@PriorityList) {

	# check if priority exists in our database
	my $PriorityExists = $Priority->inOurDatabase();

	if ($PriorityExists) { # priority exists

		my $ExistingPriority = dclone($PriorityExists); # reassign variable	

		# compare our retrieve Priority with existing Priority
		# update is done on the original (existing) Priority
		my $UpdatedPriority = $Priority->compareWith($ExistingPriority);

		# after updating our Priority object, update the database
		$UpdatedPriority->updateDatabase();

	} else { # priority DNE 
				
		# insert Priority into our database
		$Priority->insertPriorityIntoOurDB();
	}
}

print "Got priority\n";


##########################################################################################
# 
# Data Retrieval TASKS - get list of patients with tasks updated since last update
#
##########################################################################################
@TaskList = Task::getTasksFromSourceDB(@patientListForUpdate);

#=========================================================================================
# Loop over each task. Various functions are done.
#=========================================================================================
foreach my $Task (@TaskList) {

	# check if task exists in our database
	my $TaskExists = $Task->inOurDatabase();

	if ($TaskExists) { # task exists

		my $ExistingTask = dclone($TaskExists); # reassign variable	

		# compare our retrieve Task with existing Task
		# update is done on the original (existing) Task
		my $UpdatedTask = $Task->compareWith($ExistingTask);

		# after updating our Task object, update the database
		$UpdatedTask->updateDatabase();

	} else { # task DNE 
				
		# insert Task into our database
		$Task = $Task->insertTaskIntoOurDB();
	}	

}

print "Got tasks\n";
##########################################################################################
# 
# Data Retrieval APPOINTMENTS - get list of patients with appointments updated since last update
#
##########################################################################################
@ApptList = Appointment::getApptsFromSourceDB(@patientListForUpdate);

#=========================================================================================
# Loop over each patient. Various functions are done.
#=========================================================================================
foreach my $Appointment (@ApptList) {

	# check if appointment exists in our database
	my $AppointmentExists = $Appointment->inOurDatabase();

	if ($AppointmentExists) { # appointment exists

		my $ExistingAppointment = dclone($AppointmentExists); # reassign variable	

		# compare our retrieve Appointment with existing Appointment
		# update is done on the original (existing) Appointment
		my $UpdatedAppointment = $Appointment->compareWith($ExistingAppointment);

		# after updating our Appointment object, update the database
		$UpdatedAppointment->updateDatabase();

	} else { # appointment DNE 
				
		# insert Appointment into our database
		$Appointment = $Appointment->insertApptIntoOurDB();
	}	
}

print "Got appointments\n";
##########################################################################################
# 
# Data Retrieval RESOURCEAPPOINTMENT - get list of resourceappt info updated since last update
#
##########################################################################################
@RAList = ResourceAppointment::getResourceAppointmentsFromSourceDB(@patientListForUpdate);

print "RA List\n";
#=========================================================================================
# Loop over each RA. Various functions are done.
#=========================================================================================
foreach my $ResourceAppointment (@RAList) {

	# check if RA exists in our database
	my $RAExists = $ResourceAppointment->inOurDatabase();

	if ($RAExists) { # RA exists

		my $ExistingRA = dclone($RAExists); # reassign variable	

		# compare our retrieve RA with existing RA
		# update is done on the original (existing) RA
		my $UpdatedRA = $ResourceAppointment->compareWith($ExistingRA);

		# after updating our RA object, update the database
		$UpdatedRA->updateDatabase();

	} else { # RA DNE 
				
		# insert RA into our database
		$ResourceAppointment->insertResourceAppointmentIntoOurDB();
	}
}


print "Got RAs\n";

##########################################################################################
# 
# Data Retrieval DOCUMENTS - get list of patients with documents updated since last update
#
##########################################################################################
@DocList = Document::getDocsFromSourceDB(@patientListForUpdate);

# Transfer and log patient documents
Document::transferPatientDocuments(@DocList);


print "Got documents\n";

##########################################################################################
# 
# Data Retrieval TESTRESULTS - get list of patients with test results updated since last update
#
##########################################################################################
@TRList = TestResult::getTestResultsFromSourceDB(@patientListForUpdate);

#=========================================================================================
# Loop over each test result. Various functions are done.
#=========================================================================================
foreach my $TestResult (@TRList) {

	# check if TR exists in our database
	my $TRExists = $TestResult->inOurDatabase();

	if ($TRExists) { # TR exists

		my $ExistingTR = dclone($TRExists); # reassign variable	

		# compare our retrieve TR with existing TR
		# update is done on the original (existing) TR
		my $UpdatedTR = $TestResult->compareWith($ExistingTR);

		# after updating our TR object, update the database
		$UpdatedTR->updateDatabase();

	} else { # TR DNE 
				
		# insert TR into our database
		$TestResult->insertTestResultIntoOurDB();
	}	
		
}

print "Got test results\n";
##########################################################################################
# 
# Publishing ANNOUNCEMENTS 
#
##########################################################################################
Announcement::publishAnnouncements(@patientListForUpdate);

print "Got announcements\n";

##########################################################################################
# 
# Publishing TREATMENT TEAM MESSAGES
#
##########################################################################################
TxTeamMessage::publishTxTeamMessages(@patientListForUpdate);

print "Got TTM\n";

##########################################################################################
# 
# Publishing EDUCATIONAL MATERIALS
#
##########################################################################################
EducationalMaterial::publishEducationalMaterials(@patientListForUpdate);

print "Got Educational materials\n";

# Once everything is complete, we update the "last transfered" field for all controls
# Patient control
Patient::setPatientLastTransferredIntoOurDB($start_datetime);
# Alias control
Alias::setAliasLastUpdatedIntoOurDB($start_datetime);
# Post control
PostControl::setPostControlLastPublishedIntoOurDB($start_datetime);
# Educational material control
EducationalMaterialControl::setEduMatControlLastPublishedIntoOurDB($start_datetime);


# Get the current time
my $current_datetime = strftime("%Y-%m-%d %H:%M:%S", localtime(time));

# Log that the script is finished in the cronlog
Cron::setCronLog("Completed", $current_datetime);

# Update the "Next Cron"
Cron::setNextCron();
