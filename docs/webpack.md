# Webpack

[Webpack](https://webpack.js.org/) is a compiler and task manager that handles bundling the app and other common web code development tasks,
such as:

1.  Controlling differences between environments: Webpack's [ProvidePlugin](https://webpack.js.org/plugins/provide-plugin/)
    allows us to specify environment variables in a file that is made available everywhere in the app.
2.  Emitting a [minified](https://webpack.js.org/plugins/terser-webpack-plugin/) version of the code.
3.  Compiling the code to an older version of JavaScript using [babel](https://babeljs.io/), which allows us to use
    the latest features from JavaScript without worrying about JavaScript compatibility on patients' devices.
4.  Optimizing the code in different ways.

For more information on Webpack, see: https://survivejs.com/webpack/what-is-webpack/

This project also makes use of [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) for development,
a web server which quickly serves and reloads Webpack's bundles from localhost while working on the code.
