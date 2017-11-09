/**
 * @class OpalResponseSuccess
 *
 */
class OpalResponse {
	constructor(code, data, reqObj) {
		this.code = code;
		this.data = data;
		this.reqObj = reqObj;
	}
}

module.exports = OpalResponse;
/**
 * Response codes facilitate the handling of the error for firebase, here is the breakdown.
 * CODE 1: Attack to our server incorrect password for encryption or unable to retrieve user's password, delete request and ignore user, since user
 * expects only responses encrypted with their password
 * CODE 2: User is authenticated correctly but their was a problem processing the request, could be queries, incorrect parameters, etc. In that case we log the error
 *        In the error log table and respond to the user a server error, report error to the hospital.
 * CODE 3: success
 */
//
var responseCodes =
	{
		'1':'Authentication problem',
		'2':'Server Response Error',
		'3':'Success',
		'4':'Too many attempts for answer'
	};