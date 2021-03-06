var ExtractTextPlugin = require("extract-text-webpack-plugin");
var optimize = require('webpack').optimize;
var loaders = require('./loaders.js');

module.exports = {
    entry: __dirname + '/../index.js',
    module: {
        loaders: loaders
    },
    output: {
        path: __dirname + '/../',
        filename: 'bundle.js'
    },
    plugins: [
        new ExtractTextPlugin("bundle.css"),
        new optimize.UglifyJsPlugin({
            mangle: false // it breaks the Immutable Record
        })
    ]
};