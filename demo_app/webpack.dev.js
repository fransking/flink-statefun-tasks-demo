const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack')

module.exports = merge(common(), {
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    output: {

    },
    stats: {
        errorDetails: true
    },
    devServer: {
        static: [
            {
                directory: './website/assets',
                publicPath: '/assets'
            }
        ],
        port: 3000,
        open: false,
        client: {
            progress: true,
            overlay: true
        },
        hot: true
    }
});