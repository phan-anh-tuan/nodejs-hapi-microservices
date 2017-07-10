const Path = require('path');

module.exports = {
    entry: ['babel-polyfill','./src/index.js'],
    output: {
        path: Path.resolve(__dirname,'public/js'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
        {
            test: /.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                presets: ['es2015', 'react']
            }
        }
        ]
    },
};