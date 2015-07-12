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
        new optimize.UglifyJsPlugin()
    ]
};