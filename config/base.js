const webpack = require("webpack");
const path = require("path");
const util = require("util");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

const autoprefixer = require("autoprefixer");
const mqpacker = require("css-mqpacker");
const nano = require("cssnano");
const cssdedupe = require("postcss-discard-duplicates");

module.exports = {
    context: path.resolve(__dirname, "../"),
    entry: {
        app: ["./src/app/index.js"]
    },
    output: {
        path: path.join(__dirname, "../build"),
        publicPath: "/",
        filename: "[name].[hash].js",
        pathinfo: true
    },
    target: "web",
    resolve: {
        alias: {
            "components": path.join(__dirname, "../src/app/components"),
            "lib": path.join(__dirname, "../src/app/lib"),
            "assets": path.join(__dirname, "../src/assets")
        }
    },
    node: {
        __filename: true
    },
    devtool: "source-map",
    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader",
                options: {
                    cacheDirectory: "./.cache"
                }
            }
        }, {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                disable: process.env.NODE_ENV !== "production",
                use: [
                    "css-loader",
                    {
                        loader: "postcss-loader"
                    },
                    {
                        loader: "sass-loader",
                        query: {
                            sourceMap: false,
                        }
                    }
                ],
            })
        }, {
            test: /.svg$/,
            use: {
                loader: "svg-sprite-loader",
                options: {
                    extract: true
                }
            },
        }]
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new CopyWebpackPlugin([
            { from: "src/assets", to: "assets" },
            { from: "src/favicons/*", to: "[name].[ext]" },
        ]),
        new webpack.LoaderOptionsPlugin({
            options: {
                sassLoader: {
                    includePaths: [
                        path.resolve(__dirname, "../src/scss")
                    ],
                    sourceMap: true
                },
                postcss: [autoprefixer(), mqpacker(), cssdedupe(), nano()]
            }
        }),
        new HtmlWebpackPlugin({
            template: "./src/index.ejs"
        }),
        new ExtractTextPlugin("styles.[hash].css"),
        new SpriteLoaderPlugin()
    ]
};
