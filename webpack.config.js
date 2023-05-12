const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const EslintWebpackPlugin = require('eslint-webpack-plugin');

/** @type {import('webpack').Configuration} */
const config = {
    mode: 'development',
    context: path.resolve(__dirname, 'src'),
    entry: {
        login: './modules/login.js',
        recruiting: './modules/recruiting.js',
        workers: './modules/workers.js'
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
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
            filename: 'recruiting.html',
            template: path.resolve(__dirname, 'src/templates/recruiting.html'),
            chunks: ['recruiting']
        }),
        new HTMLWebpackPlugin({
            filename: 'workers.html',
            template: path.resolve(__dirname, 'src/templates/workers.html'),
            chunks: ['workers']
        }),
        new CopyWebpackPlugin({
            patterns: [
                {from: path.resolve(__dirname, 'src/assets/images'), to: path.resolve(__dirname, 'dist/images')},
                {from: path.resolve(__dirname, 'src/templates/site.webmanifest'), to: path.resolve(__dirname, 'dist')},
                {from: path.resolve(__dirname, 'src/requests'), to: path.resolve(__dirname, 'dist/requests')},
                {from: path.resolve(__dirname, 'src/assets/resumes'), to: path.resolve(__dirname, 'dist/resumes')}
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

module.exports = (env, argv) => {
    console.log(argv.mode);
    config.devtool = argv.mode === 'development' ? 'source-map' : undefined;
    return config;
};