const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
    mode: process.env.NODE_ENV,
    entry: {
        app: ['./js/script.js']
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: "[name].js"
    },
    plugins: [new Dotenv()],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
}