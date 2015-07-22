var ExtractTextPlugin = require("extract-text-webpack-plugin");
var loaders = require('./loaders');

module.exports = {
    entry: __dirname + '/../index.js',
    devtool: 'source-map',
    cache: true,
    module: {
        loaders: loaders
    },
    output: {
        path: __dirname + "/../",
        publicPath: "http://localhost:9090/",
        filename: "bundle.js"
    },
    plugins: [
        new ExtractTextPlugin("bundle.css"),
    ]
};