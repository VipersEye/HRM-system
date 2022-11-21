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
        main: './index.js',
        home: './home.js'
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
        watchFiles: ['src/*.html']
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
            '@modules': path.resolve(__dirname, ''),
            '@templates': path.resolve(__dirname, ''),
            '@styles': path.resolve(__dirname, ''),
            '@images': path.resolve(__dirname, '')
        }
    },
    plugins: [
        new HTMLWebpackPlugin({
            filename: 'index.html',
            template: './index.html',
            // favicon: '',
            chunks: ['main']
        }),
        new HTMLWebpackPlugin({
            filename: 'home.html',
            template: './home.html',
            // favicon: '',
            chunks: ['home']
        }),
        // new CopyWebpackPlugin({
        //     patterns: [
        //         {from: 'path.resolve()', to: 'path.resolve()'}
        //     ]
        // }),
        new MiniCssExtractPlugin(
            // {
                // filename: '[name].[contenthash].css'
            // }
        ),
        new EslintWebpackPlugin()
    ],
    optimization: {
        // splitChunks: {
        //     chunks: 'all',
        // },
        // runtimeChunk: 'single',
        // minimize: true,
        minimizer: [
            new CssMinimizerWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    },
};