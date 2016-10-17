#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 19-Feb-2014 ++ File: Alias.pm
#---------------------------------------------------------------------------------
# Perl module that creates an alias class. This module calls a constructor to 
# create an alias object that contains alias information stored as object 
# variables.
#
# There exists various subroutines to set alias information, get alias information (to/from objects)
# There exists subroutines that use the Database.pm module to set/get alias information to/from MySQL

package Alias; # Declare package name


use Exporter; # To export subroutines and variables
use Database; # Use our custom database module Database.pm
use Time::Piece; # To parse and convert date time

#---------------------------------------------------------------------------------
# Definitions:
#	@EXPORT: 	contains a list of functions that we export by default, in this case nothing. 
#			This avoids accidentally clashing with functions defined in the script using the module.
#	@EXPORT_OK: 	contains a list of variables that we export on demand (ie. if we specifically requested to in another script) 
#	%EXPORT_TAGS:	define a set of export tags. The ':AllSubs' tag exports all subroutines. This is nice 
#			because we don't have to reveal the names of the subroutines in the other scripts that use this module. 
#			In this case, the arrays are anonymous.
#----------------------------------------------------------------------------------

# WE EXPORT ALL SUBROUNTINES BY DEFAULT SO NO NEED TO SPECIFY

#our @EXPORT		= (); 
#our @EXPORT_OK		= ();
#our %EXPORT_TAGS	= ( AllSubs => [qw()]);

#---------------------------------------------------------------------------------
# Connect to the database
#---------------------------------------------------------------------------------

my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our Alias class 
#====================================================================================
sub new
{
	my $class = shift;
	my $alias = {
		_ser		=> undef,
		_name		=> undef,
		_type		=> undef,
		_update		=> undef,
		_lastupdated	=> undef,
		_expressions	=> undef,
	};

	# bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $alias, $class; 
	return $alias;
}

#======================================================================================
# Subroutine to set the alias serial
#======================================================================================
sub setAliasSer
{
	my ($alias, $ser) = @_; # alias object with provided serial in arguments
	$alias->{_ser} = $ser if defined($ser); # set the serial
	return $alias->{_ser};
}

#======================================================================================
# Subroutine to set the alias name
#======================================================================================
sub setAliasName
{
	my ($alias, $name) = @_; # alias object with provided name in arguments
	$alias->{_name} = $name if defined($name); # set the name
	return $alias->{_name};
}

#======================================================================================
# Subroutine to set the alias type
#======================================================================================
sub setAliasType
{
	my ($alias, $type) = @_; # alias object with provided type in arguments
	$alias->{_type} = $type if defined($type); # set the type
	return $alias->{_type};
}

#======================================================================================
# Subroutine to set the alias update
#======================================================================================
sub setAliasUpdate
{
	my ($alias, $update) = @_; # alias object with provided update in arguments
	$alias->{_update} = $update if defined($update); # set the update
	return $alias->{_update};
}

#======================================================================================
# Subroutine to set the alias last updated
#======================================================================================
sub setAliasLastUpdated
{
	my ($alias, $lastupdated) = @_; # alias object with provided LU in arguments
	$alias->{_lastupdated} = $lastupdated if defined($lastupdated); # set the LU
	return $alias->{_lastupdated};
}

#======================================================================================
# Subroutine to set the alias expressions (ie. task, appts, or docs assigned to this alias)
#======================================================================================
sub setAliasExpressions
{
	my ($alias, @expressions) = @_; # alias object with provided expressions in arguments
	@{$alias->{_expressions}} = @expressions if (@expressions); # set the expressions array
	return @{$alias->{_expressions}};
}

#======================================================================================
# Subroutine to get the alias serial
#======================================================================================
sub getAliasSer
{
	my ($alias) = @_; # our alias object
	return $alias->{_ser};
}

#======================================================================================
# Subroutine to get the alias name
#======================================================================================
sub getAliasName
{
	my ($alias) = @_; # our alias object
	return $alias->{_name};
}

#======================================================================================
# Subroutine to get the alias type
#======================================================================================
sub getAliasType
{
	my ($alias) = @_; # our alias object
	return $alias->{_type};
}

#======================================================================================
# Subroutine to get the alias update
#======================================================================================
sub getAliasUpdate
{
	my ($alias) = @_; # our alias object
	return $alias->{_update};
}

#======================================================================================
# Subroutine to get the alias last updated
#======================================================================================
sub getAliasLastUpdated
{
	my ($alias) = @_; # our alias object
	return $alias->{_lastupdated};
}

#======================================================================================
# Subroutine to get the alias expressions
#======================================================================================
sub getAliasExpressions
{
	my ($alias) = @_; # our alias object
	return @{$alias->{_expressions}};
}

#======================================================================================
# Subroutine to get the aliases marked for update
#======================================================================================
sub getAliasesMarkedForUpdate
{
	my ($aliasType) = @_; # the type of alias from args
	my @aliasList = (); # initialize our list of alias objects
	my ($ser, $type, $lastupdated);
	my @expressions;

	#======================================================================================
	# Retrieve the alias info
	#======================================================================================
	my $aliasInfo_sql = "
		SELECT DISTINCT
			Alias.AliasSerNum,
			Alias.AliasType,
			Alias.LastTransferred
		FROM
			Alias
		WHERE
			Alias.AliasUpdate	= 1
		AND	Alias.AliasType		= \"$aliasType\"
	";

    
	# prepare query
	my $query = $SQLDatabase->prepare($aliasInfo_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	while (my @data = $query->fetchrow_array()) {

		my $Alias = new Alias(); # alias object

		$ser		= $data[0];
		$type		= $data[1];
		$lastupdated	= $data[2];

		# set alias information
		$Alias->setAliasSer($ser);
		$Alias->setAliasType($type);
		$Alias->setAliasLastUpdated($lastupdated);

		# get expressions for this alias
		@expressions	= $Alias->getAliasExpressionsFromOurDB();

		# finally, set expressions 
		$Alias->setAliasExpressions(@expressions);

		push(@aliasList, $Alias);
	}

	return @aliasList;
}

#======================================================================================
# Subroutine to get the expressions for a particular alias from MySQL
#======================================================================================
sub getAliasExpressionsFromOurDB
{
	my ($Alias) = @_; # our alias object

	my @expressions = (); # initialize a list of expressions

	# get alias serial
	my $ser = $Alias->getAliasSer();

	#======================================================================================
	# Retrieve the alias expressions
	#======================================================================================
	my $expressionInfo_sql = "
		SELECT DISTINCT
			AliasExpression.AliasExpressionSerNum,
			AliasExpression.ExpressionName
		FROM 
			Alias,
			AliasExpression
		WHERE
			Alias.AliasSerNum		= $ser
		AND 	AliasExpression.AliasSerNum	= Alias.AliasSerNum
	";

	# prepare query
	my $query = $SQLDatabase->prepare($expressionInfo_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	while (my @data = $query->fetchrow_array()) {
		my $aliasExpression = {
			_ser		=> $data[0],
			_name		=> $data[1],
		};
		push(@expressions, $aliasExpression); # push in our list
	}

	return @expressions;
}

#======================================================================================
# Subroutine to set/update the "last transferred" field to current time 
#======================================================================================
sub setAliasLastUpdatedIntoOurDB
{	
	my ($current_datetime) = @_; # our current datetime in arguments

	my $update_sql = "
		
		UPDATE
			Alias
		SET
			LastTransferred	= '$current_datetime',
            LastUpdated     = LastUpdated
		WHERE
			AliasUpdate	= 1
		";

	# prepare query
	my $query = $SQLDatabase->prepare($update_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
}

#======================================================================================
# Subroutine to get expression name from our db given an expression serial
#======================================================================================
sub getExpressionNameFromOurDB
{
    my ($expressionSer) = @_; # args

    my $expressionName; #  initialize 

    my $select_sql = "
        SELECT DISTINCT
            ae.ExpressionName
        FROM
            AliasExpression ae
        WHERE
            ae.AliasExpressionSerNum = '$expressionSer'
    ";

    # prepare query
	my $query = $SQLDatabase->prepare($select_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	while (my @data = $query->fetchrow_array()) {

        $expressionName = $data[0];

    }

    return $expressionName;

}
