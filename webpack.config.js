const path = require('path');
const ROOT_PATH = path.resolve(__dirname);
const webpack = require('webpack');
const APP_PATH = path.resolve(ROOT_PATH, 'app');
const BUILD_PATH = path.resolve(ROOT_PATH, 'build');

// entry point
const entry = [path.resolve(APP_PATH, 'scripts/app.js')];
module.exports = {
    entry,
    output: {
        path: BUILD_PATH,
        filename: 'bundle.js',
    },
    devServer: {
        contentBase: BUILD_PATH,
        port: 9000,
        compress: true,
        historyApiFallback: true,
        hot: true,
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js?$/,
                include: [
                    path.resolve(APP_PATH, 'scripts'),
                ],
                loader: 'babel-loader',
                options: {
                    presets: ['es2015'],
                },
            },
            {
                test: /\.html?$/,
                include: [APP_PATH],
                loader: 'html-loader',
            },
            {
                test: /\.(jpe?g|gif|png|svg|woff|ttf|eot|woff2)$/,
                loader: 'url-loader?limit=8192&name=./imgs/[hash].[ext]',
            },
            {
                test: /\.css$/,
                loaders: ['style!css', 'resolve-url-loader', 'url-loader?limit=8192&name=./imgs/[hash].[ext]'],
            },
            {
                test: /\.scss$/,
                loaders: ['style-loader', 'css-loader', 'resolve-url-loader', 'sass-loader?sourceMap'],
            },
        ],
    },
    resolve: {
        extensions: ['.js'],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ],
};
