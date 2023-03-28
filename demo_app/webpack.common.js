const path = require('path')

module.exports = () => ({
    entry: {
        app: path.join(__dirname, 'website', 'js', 'app.js')
    },
    output: {
        path: path.join(__dirname, 'website', 'dist')
    },
    plugins: [],
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
            }
        ]
    }
})
