const CompressionWebpackPlugin = require('compression-webpack-plugin')

module.exports = {
    pluginOptions: {
        i18n: {
            locale: 'en',
            fallbackLocale: 'en',
            localeDir: 'locales',
            enableInSFC: true
        }
    },
    publicPath: process.env.NODE_ENV === 'production' ? '' : '/',
    productionSourceMap: false,
    configureWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
            config.plugins.push(
                new CompressionWebpackPlugin({
                    // 正在匹配需要压缩的文件后缀
                    test: /\.(js|css|svg|woff|ttf|json|html)$/,
                    threshold: 10240,
                    deleteOriginalAssets: true
                })
            )
        }
    },
    chainWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
            config.output.filename('js/[name].js').end();
            config.output.chunkFilename('js/[name].js').end();
            // 修改生产配置
            config.plugin('extract-css').tap(() => [{
                filename: `css/[name].css`,
                chunkFilename: `css/[name].css`
            }])
        }
        config.module
            .rule('fonts')
            .use('url-loader')
            .loader('url-loader')
            .tap(options => {
                options.fallback.options.name = 'fonts/[name].[ext]';
                return options
            });
        // px2rem-loader
        config.module
            .rule('px2rem-loader')
            .test(/\.css$/)
            .use('px2rem-loader')
            .loader('px2rem-loader')
            .options({remUnit: 75})
            .end()
    }
}
