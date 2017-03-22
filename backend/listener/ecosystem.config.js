module.exports = {
    /**
     * Application configuration section
     */
    apps : [

        // Opal pm2 configs, out_file is for logs
        {
            name        : "opal",
            script      : "server.js",
            watch       : true,
            out_file    : null,
            error_file  : null
        }
    ]
};
