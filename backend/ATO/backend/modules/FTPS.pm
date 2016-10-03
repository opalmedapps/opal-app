#!/usr/bin/perl

#---------------------------------------------------------------------------------
# A.Joseph 22-Jul-2014 ++ File: FTPS.pm
#---------------------------------------------------------------------------------
# Perl module that creates an FTPS class. It connects to a host server.
# This module calls a constructor to create an FTPS class and then calls a
# subroutine to connect to the host server with the parameters given.
#
# It is assumed that the host, username and password will remain static 
# through the whole process so we pre-define those variables in the constructor.
# However, when creating a new FTPS object, we pass the remote and local directories
# as arguments incase we wish to quickly change these parameters when modifying
# this module. 
#
# Although all these object variables are set within this module, I provide setter and getter
# subroutines in case the user wishes to change these variables.

package FTPS; # Declare package name

use Net::FTPSSL; # Perl's FTPSSL module
use Net::FTP; # Perl's FTP module

# Create a ftps object
# PRO FTPS for Guy Mattieu's PROD Import
#our $ftpsObject = new FTPS(
#	"/mnt/VarianFILEDATA/documents/files",
#	"/Aria",
#	"/usr/lib/cgi-bin/DB/ATS/xmlFiles",
#	"/usr/lib/cgi-bin/DB/ATS/pdfFiles",
#	"172.26.188.167",
#	"wnetvmap29\\ProdImport",
#	"Importap29"
#	);

# DEV FTPS for Guy Mattieu's STRM Import
#our $chartLevelFtpsObject = new FTPS(
#	"/mnt/VarianFILEDATA/Documents/Files",
#	"/Aria",
#	"/usr/lib/cgi-bin/dev/ATS/xmlFiles",
#	"/usr/lib/cgi-bin/dev/ATS/pdfFiles",
#	"172.26.188.198",
#	"wnetvmap08\\StrmImport",
#	"Importap08"
#	);

# Connect to FTPSSL
#our $chartLevelTargetFTPS = $chartLevelFtpsObject->connectToFTPSSL();
#$chartLevelTargetFTPS->binary(); # super important convert to binary 

#our $visitLevelFtpsObject = $chartLevelFtpsObject; ## this line is to send test visit level docs to Guy's interface, otherwise comment out 

# DEV FTP for Yves' depository  
#our $visitLevelFtpsObject = new FTPS(
#	"/mnt/VarianFILEDATA/Documents/Files",
#	".",
#	"/usr/lib/cgi-bin/dev/ATS/xmlFiles",
#	"/usr/lib/cgi-bin/dev/ATS/pdfFiles",
#	"axap29.muhc.mcgill.ca",
#	"ariarpt",
#	"qdxt1X0"
#	);

# PRO FTP for Yves' Repository
#our $visitLevelFtpsObject = new FTPS(
#	"/mnt/VarianFILEDATA/Documents/Files",
#	".",
#	"/usr/lib/cgi-bin/dev/ATS/xmlFiles",
#	"/usr/lib/cgi-bin/dev/ATS/pdfFiles",
#	"qdxengine.muhc.mcgill.ca",
#	"ariarpt",
#	"qdxt1X0"
#	);

# Connect to FTP 
#our $visitLevelTargetFTPS = $visitLevelFtpsObject->connectToFTPSSL(); ## Yves' PRO interface
#our $visitLevelTargetFTPS = $visitLevelFtpsObject->connectToFTP(); ## Yves' DEV interface
#$visitLevelTargetFTPS->binary(); # super important convert to binary 

# DEV FTPS for testing 
our $ftpsObject = new FTPS(
	"/mnt/VarianFILEDATA/Documents/Files",
	".",
	".",
	"/home/VarianFILEDATA/Documents",
	"172.26.66.41",
	"webdb",
	"service"
	);

# Connect to FTPSSL
#our $targetFTPS = $ftpsObject->connectToFTP();
#$targetFTPS->binary(); # super important convert to binary 

#====================================================================================
# Constructor for our FTPS class 
#====================================================================================
sub new
{
	my $class = shift;
	# PRO
	#my $ftps = {
	#	_localdir	=> shift,
	#	_remotedir	=> shift,
	#	_xmldir		=> shift,
	#	_pdfdir		=> shift,
	#	_host		=> shift,
	#	_user		=> shift,
	#	_password	=> shift,
	#};

	# DEV
	my $ftps = {
		_localdir	=> shift,
		_remotedir	=> shift,
		_xmldir		=> shift,
		_pdfdir		=> shift,
		_host		=> shift,
		_user		=> shift,
		_password	=> shift,
	};

	# bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $ftps, $class; 
	return $ftps;
}

#======================================================================================
# Subroutine to connect to FTPSSL
#======================================================================================
sub connectToFTPSSL
{
	my ($ftps) = @_; # ftps object
	my $ftps_connect = Net::FTPSSL->new($ftps->{_host})
		or die "Could not connect to server.";

	$ftps_connect->login($ftps->{_user},$ftps->{_password})
		or die "Credential error." . $ftps->last_message;
	
	return $ftps_connect;
}

#======================================================================================
# Subroutine to connect to FTP
#======================================================================================
sub connectToFTP
{
	my ($ftp) = @_; # ftp object
	my $ftp_connect = Net::FTP->new($ftp->{_host},
		SSL => 1)
		or die "Could not connect to server.";

	$ftp_connect->login($ftp->{_user},$ftp->{_password})
		or die "Credential error." . $ftp->last_message;

	# Upgrade plain connection to SSL
	#$ftp_connect->starttls();

	return $ftp_connect;
}

#======================================================================================
# Subroutine to set the ftps local directory
#======================================================================================
sub setFTPSLocalDir
{
	my ($ftps, $localdir) = @_; # ftps object with provided directory in arguments
	$ftps->{_localdir} = $localdir if defined($localdir); # set the directory
	return $ftps->{_localdir};
}

#======================================================================================
# Subroutine to set the ftps remote directory
#======================================================================================
sub setFTPSRemoteDir
{
	my ($ftps, $remotedir) = @_; # ftps object with provided directory in arguments
	$ftps->{_remotedir} = $remotedir if defined($remotedir); # set the directory
	return $ftps->{_remotedir};
}

#======================================================================================
# Subroutine to set the ftps xml directory
#======================================================================================
sub setFTPSXMLDir
{
	my ($ftps, $xmldir) = @_; # ftps object with provided directory in arguments
	$ftps->{_xmldir} = $xmldir if defined($xmldir); # set the directory
	return $ftps->{_xmldir};
}

#======================================================================================
# Subroutine to set the ftps pdf directory
#======================================================================================
sub setFTPSPDFDir
{
	my ($ftps, $pdfdir) = @_; # ftps object with provided directory in arguments
	$ftps->{_pdfdir} = $pdfdir if defined($pdfdir); # set the directory
	return $ftps->{_pdfdir};
}

#======================================================================================
# Subroutine to set the ftps host
#======================================================================================
sub setFTPSHost
{
	my ($ftps, $host) = @_; # ftps object with provided host name in arguments
	$ftps->{_host} = $host if defined($host); # set the host name
	return $ftps->{_host};
}

#======================================================================================
# Subroutine to set the ftps username
#======================================================================================
sub setFTPSUser
{
	my ($ftps, $user) = @_; # ftps object with provided user name in arguments
	$ftps->{_user} = $user if defined($user); # set the user name
	return $ftps->{_user};
}

#======================================================================================
# Subroutine to set the ftps password
#======================================================================================
sub setFTPSPassword
{
	my ($ftps, $password) = @_; # ftps object with provided password in arguments
	$ftps->{_password} = $password if defined($password); # set the password
	return $ftps->{_password};
}

#====================================================================================
# Subroutine to get the ftps local directory
#====================================================================================
sub getFTPSLocalDir
{
	my ($ftps) = @_; # our ftps object
	return $ftps->{_localdir};
}

#====================================================================================
# Subroutine to get the ftps remote directory
#====================================================================================
sub getFTPSRemoteDir
{
	my ($ftps) = @_; # our ftps object
	return $ftps->{_remotedir};
}

#====================================================================================
# Subroutine to get the ftps xml directory
#====================================================================================
sub getFTPSXMLDir
{
	my ($ftps) = @_; # our ftps object
	return $ftps->{_xmldir};
}

#====================================================================================
# Subroutine to get the ftps pdf directory
#====================================================================================
sub getFTPSPDFDir
{
	my ($ftps) = @_; # our ftps object
	return $ftps->{_pdfdir};
}

# To exit/return always true (for the module itself)
1;	
