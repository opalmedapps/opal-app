
const main = require('../api/main');
const req = {key:"-KyX4Q8NE1KMRbl4f-gi", requestObject: { DeviceId: '741506b0520fd0490360ca0-e111f01f0560-4970f60b30-13c190890be0-4c1104101a0ac0950aa06f03b07808f060',
	Parameters:
	{ Fields:
		[ 'uP8ZfM9GngvYOjUD8Wn9p1d3eKI58TuW8JNDNPACdaXRs1t9Tz3B385X33n767g=',
			'uP8ZfM9GngvYOjUD8Wn9p1d3eKI58TuWN8NTUEn7mGvxuoaib6BhUN9G23/367jYARREYg==',
			'uP8ZfM9GngvYOjUD8Wn9p1d3eKI58TuWLYCcJU9PowdmEjWclPql7spX2Hvt',
			'uP8ZfM9GngvYOjUD8Wn9p1d3eKI58TuW+jRwzyofNN2B004p2BW+08pO/3X/6IHQFwlRdkzC',
			'uP8ZfM9GngvYOjUD8Wn9p1d3eKI58TuWV8O6P9azR1YnnwA5h/28e9tS3nP/8aXaChtcXEjFlYKR5C0=',
			'uP8ZfM9GngvYOjUD8Wn9p1d3eKI58TuWl8SjWWCmHZJ9NxBCUkLsl9pZyGXz4KLBFw==',
			'uP8ZfM9GngvYOjUD8Wn9p1d3eKI58TuWXGn6nMp/6GcZnTxAmzUGYtBZ33n47K/UEBNff1o=' ] },
	Request: 'q2swiEIHiaIoXVDMqjnoChqfLXhYschUoxVn0La6WpgIi8Gv7tely1NtOfUL',
		Timestamp: 1510252853364,
		Token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ3N2I2ZWVjZmI3MGNjOWQwOWYyNGNkY2QzYWI3MzNiNDRhNmNjZGYifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vb3BhbC1wcm9kIiwiYXVkIjoib3BhbC1wcm9kIiwiYXV0aF90aW1lIjoxNTA5NzQ1NjczLCJ1c2VyX2lkIjoiQjJrWXNTZXBNTmNLbjVkUjRBeHNrYUhmeVMwMiIsInN1YiI6IkIya1lzU2VwTU5jS241ZFI0QXhza2FIZnlTMDIiLCJpYXQiOjE1MDk3NDU2NzQsImV4cCI6MTUwOTc0OTI3NCwiZW1haWwiOiJtdWhjLmFwcC5tb2JpbGVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbIm11aGMuYXBwLm1vYmlsZUBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.tTWpiTGELMZkYuYKRFcfy3ipJmN2a6n_nJFWKs3V73B7XoeDdhGMsdC1JbWPpC6nM1W55jYUHCGR5talet86Em-PpnPc5b-s02O54ndam1Kpm2mitNuqT2VyidLMpir5uQcSt1tB_Us40uXXo5QlgsxhnFF3Ecs_MGQedyyVa7mlRjQSNVOM1PmfwmjwqUKuiFPGSB2sO0fsVmFplR2lqUEodI__RbqwtcPP1R8T5nuTbAjnhd2mGDv8i4xk_1lgi4itARuEusz-1rU1Pkqh9ou9tXEv-ew97P7WnIbcO_dRajCGjLnmGyhDP8DHoFiyBjlqL6SBBqk_DJPU-ajGdQ',
		UserEmail: 'muhc.app.mobile@gmail.com',
		UserID: 'B2kYsSepMNcKn5dR4AxskaHfyS02' }
};
main.apiRequestFormatter(req.key, req.requestObject).then((res)=>{
	console.log("HEL", res);
}).catch((err)=>{
	console.log("fucl");
});