module.exports = {
    apps : [
        {
            name: "opal-listener",
            script: "server.js",
            watch: true,
            env: {
                "NODE_ENV": "development"
            },
            env_production: {
                "NODE_ENV": "production",
            }
        }
    ]
};