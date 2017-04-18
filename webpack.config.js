let path = require('path');

module.exports = {
    entry: './app/copycat.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {test: /\.css$/, use: ['style-loader', 'css-loader']},
            {test: /\.(png|jpg|gif|svg)$/, loader: 'url', query: {limit: 10000, name: '[name].[ext]?[hash]'}}
        ]
    },

    devtool: "source-map"
};