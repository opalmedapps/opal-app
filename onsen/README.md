Cordova Mobile app with [Onsen UI](http://onsen.io/)
====

## Requirements

 * Node.js - Install [Node.js](http://nodejs.org)
 * Cordova - Install with `npm install cordova`

## Development Instructions

Install dependencies
```bash
$ npm install
```

### Testing in a browser (locally)

Install [http-server](https://www.npmjs.com/package/http-server):
```bash
$ npm install -g http-server
```
Start a new server
```bash
$ http-server
```
Open [localhost](http://localhost:8080/www/) in your favourite web browser.

### Testing on a mobile device

Detailed instructions available on the [Cordova Docs](https://cordova.apache.org/docs/en/edge/guide_cli_index.md.html).

Add a platform: (to see a list of platforms: `cordova platforms ls`)
```bash
$ cordova platform add <platform>
```
Plug your phone to your machine and run:
```bash
$ cordova run <platform>
```

## Directory Layout

    README.md     --> This file
    gulpfile.js   --> Gulp tasks definition
    www/          --> Asset files for app
      index.html  --> App entry point
      views/      --> Pages
      js/
      styles/
      lib/onsen/
        stylus/   --> Stylus files for onsen-css-components.css
        js/       --> JS files for Onsen UI
        css/      --> CSS files for Onsen UI
    platforms/    --> Cordova platform directory
    plugins/      --> Cordova plugin directory
    merges/       --> Cordova merge directory
    hooks/        --> Cordova hook directory
