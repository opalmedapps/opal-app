module.exports = {
    /**
     * Application configuration section
     */
    apps : [

        // Opal pm2 configs, out_file is for logs
        {
            name        : "opal",
            script      : "server.js",
            out_file    : "dev/null"
        }
    ]
};
