const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HTMLWebpackPlugin = require('html-webpack-plugin')
const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
    template: __dirname + '/public/index.html',
    filename: 'index.html',
    inject: 'body'
})
const Dotenv = require('dotenv-webpack');
const { webpack } = require("webpack");

module.exports = {
    entry: __dirname + '/src/index.js',
    module: {
        rules: [
            {
                test: [/\.js$/, /\.jsx$/],
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader", "postcss-loader"
                ]
            },
            {
                test: /\.(jpg|png|svg)$/,
                use: {
                    loader: "url-loader"
                }
            }
        ]
    },
    output: {
        filename: 'transformed.js',
        path: __dirname + '/build'
    },
    plugins: [
        HTMLWebpackPluginConfig,
        new MiniCssExtractPlugin({
            filename: "index.css",
            chunkFilename: "index.css"
          }),
        new Dotenv()
    ],
    target: 'web',
    mode: 'development',
    devServer: {
        historyApiFallback: true,
        port: 3000
    }
};