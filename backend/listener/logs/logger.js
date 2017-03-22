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
var exports = module.exports = {};

var logger = new (winston.Logger)({
    transports: [
        // Output all debug events and higher to console
        new (winston.transports.Console)({
            level: 'debug',
            json: true
        }),
        // Store all info events and higher to the opal.log file
        new (winston.transports.File)({
            filename: './opal.log',
            level: 'info',
            json: false,
            timestamp: true
        })
    ]
});

// Log all uncaught exceptions to a separate file
logger.handleExceptions(new winston.transports.File({ filename: './opal-uncaughtExceptions.log' }));

exports.logger = logger;