const Path = require('path');

module.exports = {
    //entry: ['babel-polyfill','./src/index.js'],
    watch: global.isWatching,
    entry: {
        bundle: './src/pages/resource_requests/index.js',
        signup: './src/pages/signup/index.js',
        login: './src/pages/login/index.js',
        report: './src/pages/report/index.js',
        contact: './src/pages/contact/index.js',
        chat: './src/pages/chat/index.js'
    },
    output: {
        path: Path.resolve(__dirname,'public/js'),
        filename: '[name].js'
    },
    externals: {
        'cheerio': 'window',
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true,
    },
    module: {
        loaders: [
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react', 'stage-2', 'airbnb']
                }
            },
            {   test: /\.css$/, 
                exclude: /node_modules/,
                use: [ 'style-loader', 'css-loader' ]
            }
        ]
    },
};