module.exports = [
    {test: /\.js$/, exclude: /node_modules/, loaders: ['babel-loader']},
    {test: /\.less$/, loader: 'style!css!autoprefixer-loader!less'},
    {test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader : 'url-loader?limit=100000'},
    {test: /node_modules\/flux-lumines\/((?!node_modules).)*\.js$/, loaders: ['babel-loader']}
];
