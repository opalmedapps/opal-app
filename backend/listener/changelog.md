## [1.4.7] - 2017-11-07
**SEQUENTIAL VERSION**
### Changed
- updateReadStatus to validate parameters, modified query to escape values
- updateAccountField Modified query to have escaped values, checks for undefined 
  parameters
- inputFeedback to validate parameters
- updateDeviceIdentifier, validates parameters now
- Any query that did not go through runSqlQuery
- Logger file to print uncaught exceptions if under dev.
- getSecurityQuestion under security.js to use a consistent call to validate 
  registration parameters
- queries to not call unescaped and not sanitized queries
### Added
- [dotenv](https://www.npmjs.com/package/dotenv) npm package to manage 
    environment variables
- npm scripts, `npm run start:dev` to run dev version, `npm run start` to run
  under production, this needs to be made compatible with pm2 via their
  config file.
  
