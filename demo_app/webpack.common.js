const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = () => ({
    entry: {
        app: path.join(__dirname, 'website', 'js', 'app.js')
    },
    output: {
        path: path.join(__dirname, 'website', 'dist')
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'website/index_template.html',
            filename: 'index.html'
        }),
        new MiniCssExtractPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [
                    path.join(__dirname, 'website')
                ],
                options: {
                    presets: ['@babel/preset-env', '@babel/preset-react']
                }
            },
            {
                test: /\.scss$/,
                include: [
                    path.join(__dirname, 'website')
                ],
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve('./website/js'),
            'node_modules'
        ]
    }
})
