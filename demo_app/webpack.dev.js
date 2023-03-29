const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common(), {
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    output: {
        filename: '[name].[contenthash].js'
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
        hot: true,
        watchFiles: {
            options: {
              usePolling: true,
              ignored: /node_modules/
            }
        }
    },
    watchOptions: {
        aggregateTimeout: 200,
        poll: 500,
        ignored: /node_modules/
    }
});