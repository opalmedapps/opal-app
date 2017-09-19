/*
 * Filename     :   mailer.js
 * Description  :   Module that send emails using node mailer
 * Created by   :   David Herrera, Robert Maglieri 
 * Date         :   30 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

'use strict';
const nodemailer = require('nodemailer');

function Mail(){
    
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: '172.25.123.208',
        port: 25
    });

    // setup email data with unicode symbols

    this.sendMail = function (recipient, subject, text, replyEmail) {
        let mailOptions = {
            from: '"Opal" <opal@muhc.mcgill.ca>', // sender address
            to: recipient, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            replyTo: replyEmail
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
    };
// send mail with defined transport object

}

module.exports = Mail;

