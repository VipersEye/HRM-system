const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const EslintWebpackPlugin = require('eslint-webpack-plugin');


const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;
console.log('IS DEV:', isDev);
console.log('IS PROD:', isProd);

/** @type {import('webpack').Configuration} */
module.exports = {
    mode: 'development',
    context: path.resolve(__dirname, 'src'),
    entry: {
        login: './modules/login.js',
        home: './modules/home.js'
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    devtool: isDev ? 'source-map' : undefined,
    devServer: {
        static: path.resolve(__dirname, 'dist'),
        hot: true,
        watchFiles: ['src/templates/*.html']
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader ,'css-loader'],
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            '@modules': path.resolve(__dirname, 'src/modules'),
            '@styles': path.resolve(__dirname, 'src/assets/styles'),
        }
    },
    plugins: [
        new HTMLWebpackPlugin({
            filename: 'login.html',
            template: path.resolve(__dirname, 'src/templates/login.html'),
            chunks: ['login']
        }),
        new HTMLWebpackPlugin({
            filename: 'home.html',
            template: path.resolve(__dirname, 'src/templates/home.html'),
            chunks: ['home']
        }),
        new CopyWebpackPlugin({
            patterns: [
                {from: path.resolve(__dirname, 'src/assets/images'), to: path.resolve(__dirname, 'dist/images')},
                {from: path.resolve(__dirname, 'src/templates/site.webmanifest'), to: path.resolve(__dirname, 'dist')},
                {from: path.resolve(__dirname, 'src/requests'), to: path.resolve(__dirname, 'dist/requests')}
            ]
        }),
        new MiniCssExtractPlugin({
            filename: '[name][contenthash].css'
        }),
        new EslintWebpackPlugin()
    ],
    optimization: {
        minimizer: [
            new CssMinimizerWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    },
};