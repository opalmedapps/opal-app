#!/usr/bin/perl

#---------------------------------------------------------------------------------
# A.Joseph 18-Dec-2013 ++ File: Database.pm
#---------------------------------------------------------------------------------
# Perl module that creates a database class. It connects first to the ARIA 
# database. A database object is created for the MySQL database connection.
# This module calls a constructor to create this object and then calls a 
# subroutine to connect to the MySQL database with the parameters given.
#
# Although all these object variables are set within this module, I provide 
# setter subroutines in case the user wishes to changed the object variables.

package Database; # Declare package name

use Configs; # Custom Config.pm to get constants (i.e. configurations)
use Exporter; # To export subroutines and variables
use DBI;
use DBD::Sybase;

# Create a database object
our $databaseObject = new Database(
        $Configs::SERVER_DB_NAME_HOST,
        $Configs::SERVER_DB_HOST,
        $Configs::SERVER_DB_USER,
        $Configs::SERVER_DB_PASS
    );

# Connect to our MySQL database
our $targetDatabase = $databaseObject->connectToTargetDatabase();

#====================================================================================
# Constructor for our Databases class 
#====================================================================================
sub new 
{
	my $class = shift;
	my $database = {
		_name		=> shift,
		_host		=> shift,
		_user		=> shift,
		_password	=> shift,
	};

	# bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $database, $class; 
	return $database;
}

#======================================================================================
# Subroutine to connect to the source database
#======================================================================================
sub connectToSourceDatabase
{
	my ($sourceDBser) = @_; # source database serial

    my $sourceDBCredentials = Configs::fetchSourceCredentials($sourceDBser);

    my $db_connect = DBI->connect_cached(
            $sourceDBCredentials->{_name},
            $sourceDBCredentials->{_user},
            $sourceDBCredentials->{_password},
        )
	    or die "Could not connect to the source database: " . DBI->errstr;

	return $db_connect;
}

#======================================================================================
# Subroutine to connect to the MySQL database
#======================================================================================
sub connectToTargetDatabase
{
	my ($database) = @_; # database object	
	my $db_connect = DBI->connect_cached(
            $database->{_name},
            $database->{_user},
            $database->{_password}
        )
		or die "Could not connect to the MySQL db: " . DBI->errstr;
	return $db_connect;
}

#======================================================================================
# Subroutine to set the database name
#======================================================================================
sub setDatabaseName 
{
	my ($database, $name) = @_; # database object with provided name in arguments
	$database->{_name} = $name if defined($name); # set the name
	return $database->{_name};
}

#======================================================================================
# Subroutine to set the database host
#======================================================================================
sub setDatabaseHost
{
	my ($database, $host) = @_; # database object with provided host name in arguments
	$database->{_host} = $host if defined($host); # set the host name
	return $database->{_host};
}

#======================================================================================
# Subroutine to set the database username
#======================================================================================
sub setDatabaseUser
{
	my ($database, $user) = @_; # database object with provided user name in arguments
	$database->{_user} = $user if defined($user); # set the user name
	return $database->{_user};
}

#======================================================================================
# Subroutine to set the database password
#======================================================================================
sub setDatabasePassword
{
	my ($database, $password) = @_; # database object with provided password in arguments
	$database->{_password} = $password if defined($password); # set the password
	return $database->{_password};
}

# To exit/return always true (for the module itself)
1;
