#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 04-May-2016 ++ File: Filter.pm
#---------------------------------------------------------------------------------
# Perl module that creates a filter class. This module calls a contructor to 
# create a filter object that contains filter information stored as parameters
#
# There exists various subroutines to set / get filter information

package Filter; # Declare package name

use Database; # Our custom module Database.pm

#---------------------------------------------------------------------------------
# Connect to the database
#---------------------------------------------------------------------------------
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our Filters class 
#====================================================================================
sub new
{
    my $class = shift;
    my $filter = {
        _expressions    => undef,
        _diagnoses      => undef,
        _doctors        => undef,
        _resources      => undef,
    };

	# bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $filter, $class; 
	return $filter;
}

#======================================================================================
# Subroutine to set the expression filters
#======================================================================================
sub setExpressionFilters
{
	my ($filter, @expressions) = @_; # filter object with provided expressions in arguments
	@{$filter->{_expressions}} = @expressions; # set the expressions
	return @{$filter->{_expressions}};
}

#======================================================================================
# Subroutine to set the diagnosis filters
#======================================================================================
sub setDiagnosisFilters
{
	my ($filter, @diagnoses) = @_; # filter object with provided diagnoses in arguments
	@{$filter->{_diagnoses}} = @diagnoses; # set the diagnoses
	return @{$filter->{_diagnoses}};
}

#======================================================================================
# Subroutine to set the doctor filters
#======================================================================================
sub setDoctorFilters
{
	my ($filter, @doctors) = @_; # filter object with provided doctors in arguments
	@{$filter->{_doctors}} = @doctors; # set the doctors
	return @{$filter->{_doctors}};
}

#======================================================================================
# Subroutine to set the resource filters
#======================================================================================
sub setResourceFilters
{
	my ($filter, @resources) = @_; # filter object with provided resources in arguments
	@{$filter->{_resources}} = @resources; # set the resources
	return @{$filter->{_resources}};
}

#======================================================================================
# Subroutine to get the expression filters
#======================================================================================
sub getExpressionFilters
{
	my ($filter) = @_; # our filter object
	return @{$filter->{_expressions}};
}

#======================================================================================
# Subroutine to get the diagnosis filters
#======================================================================================
sub getDiagnosisFilters
{
	my ($filter) = @_; # our filter object
	return @{$filter->{_diagnoses}};
}

#======================================================================================
# Subroutine to get the doctor filters
#======================================================================================
sub getDoctorFilters
{
	my ($filter) = @_; # our filter object
	return @{$filter->{_doctors}};
}

#======================================================================================
# Subroutine to get the resource filters
#======================================================================================
sub getResourceFilters
{
	my ($filter) = @_; # our filter object
	return @{$filter->{_resources}};
}

#======================================================================================
# Subroutine to get all filters given a control serial number and table name
#======================================================================================
sub getAllFiltersFromOurDB
{
    my ($controlSer, $controlTable) = @_; # args

    my @expressionFilters   = getExpressionFiltersFromOurDB($controlSer, $controlTable);
    my @diagnosisFilters    = getDiagnosisFiltersFromOurDB($controlSer, $controlTable);
    my @doctorFilters       = getDoctorFiltersFromOurDB($controlSer, $controlTable);
    my @resourceFilters     = getResourceFiltersFromOurDB($controlSer, $controlTable);

    my $Filter = new Filter(); # initialize object

    $Filter->setExpressionFilters(@expressionFilters);
    $Filter->setDiagnosisFilters(@diagnosisFilters);
    $Filter->setDoctorFilters(@doctorFilters);
    $Filter->setResourceFilters(@resourceFilters);

    return $Filter;

}

#======================================================================================
# Subroutine to get expression filters from DB given a control serial number and table name
#======================================================================================
sub getExpressionFiltersFromOurDB
{
    my ($controlSer, $controlTable) = @_; # args

    my @expressionFilters = (); # initialize list
    my $select_sql = "
        SELECT DISTINCT
            Filters.FilterId
        FROM
            Filters
        WHERE
            Filters.ControlTable         = '$controlTable'
        AND Filters.ControlTableSerNum   = '$controlSer'
        AND Filters.FilterType           = 'Expression'
    ";

    # prepare query
	my $query = $SQLDatabase->prepare($select_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {
        push(@expressionFilters, $data[0]);
    }

    return @expressionFilters;
}

#======================================================================================
# Subroutine to get diagnosis filters from DB given a control serial number and table name
#======================================================================================
sub getDiagnosisFiltersFromOurDB
{
    my ($controlSer, $controlTable) = @_; # args

    my @diagnosisFilters = (); # initialize list
    my $select_sql = "
        SELECT DISTINCT
            Filters.FilterId
        FROM
            Filters
        WHERE
            Filters.ControlTable         = '$controlTable'
        AND Filters.ControlTableSerNum   = '$controlSer'
        AND Filters.FilterType           = 'Diagnosis'
    ";

    # prepare query
	my $query = $SQLDatabase->prepare($select_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {
        push(@diagnosisFilters, $data[0]);
    }

    return @diagnosisFilters;
}

#======================================================================================
# Subroutine to get doctor filters from DB given a control serial number and table name
#======================================================================================
sub getDoctorFiltersFromOurDB
{
    my ($controlSer, $controlTable) = @_; # args

    my @doctorFilters = (); # initialize list
    my $select_sql = "
        SELECT DISTINCT
            Filters.FilterId
        FROM
            Filters
        WHERE
            Filters.ControlTable         = '$controlTable'
        AND Filters.ControlTableSerNum   = '$controlSer'
        AND Filters.FilterType           = 'Doctor'
    ";

    	# prepare query
	my $query = $SQLDatabase->prepare($select_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {
        push(@doctorFilters, $data[0]);
    }

    return @doctorFilters;
}

#======================================================================================
# Subroutine to get resource filters from DB given a control serial number and table name
#======================================================================================
sub getResourceFiltersFromOurDB
{
    my ($controlSer, $controlTable) = @_; # args

    my @resourceFilters = (); # initialize list
    my $select_sql = "
        SELECT DISTINCT
            Filters.FilterId
        FROM
            Filters
        WHERE
            Filters.ControlTable         = '$controlTable'
        AND Filters.ControlTableSerNum   = '$controlSer'
        AND Filters.FilterType           = 'Resource'
    ";

    	# prepare query
	my $query = $SQLDatabase->prepare($select_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {
        push(@resourceFilters, $data[0]);
    }

    return @resourceFilters;
}

# exit smoothly for module
1;
