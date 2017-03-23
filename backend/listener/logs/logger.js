/*
 * Filename     :   logger.js
 * Description  :   This file intiliazes the logger for Opal.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   22 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

var winston = require('winston');

winston.configure({
    transports: [
        // Output all debug events and higher to console
        new (winston.transports.Console)({
            level: 'debug',
            json: false,
            timestamp: true
        }),
        // Store all info events and higher to the opal.log file
        new (winston.transports.File)({
            filename: './logs/opal-info.log',
            level: 'info',
            json: true,
            timestamp: true
        })
    ]
});

// Log all uncaught exceptions to a separate file
winston.handleExceptions(new winston.transports.File({ filename: './logs/opal-uncaughtExceptions.log' }));


module.exports = winston;