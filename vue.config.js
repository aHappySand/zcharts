const path = require('path');

const resolve = (dir) => path.join(__dirname, dir);

const isProduction = process.env.NODE_ENV !== 'development';
const svgIconsPath = 'examples/assets/svg';
const devServerPort = 8880;

const alias = {
  '@': path.resolve(__dirname, './examples'),
  main: path.resolve(__dirname, './src'),
  packages: path.resolve(__dirname, './packages'),
  examples: path.resolve(__dirname, './examples'),
  node_modules: path.resolve(__dirname, './node_modules'),
  'vue2-record': path.resolve(__dirname, './'),
}

module.exports = {
  productionSourceMap: !isProduction, // 解决vue项目打包后浏览器F12查看到项目源代码false不能看到
  publicPath: isProduction ? './' : '/',
  assetsDir: 'static',
  lintOnSave: false,//process.env.NODE_ENV !== 'production',
  // 修改 src 目录 为 examples 目录
  pages: {
    index: {
      entry: 'examples/main.js',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  devServer: {
    port: devServerPort,
    hot: true,
    // 配置跨域请求头，解决开发环境的跨域问题
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: { // 解决跨域问题
      '/api': {
        target: 'http://localhost:2222/', // 本地json数据
        changeOrigin: true,
        ws: false,
        pathRewrite: {
          '/api': '/mock' // 本地
        }
      }
    }
  },
  css: {
    // 是否使用css分离插件 ExtractTextPlugin
    extract: true,
    // 开启 CSS source maps?
    sourceMap: false,
    // 启用 CSS modules for all css / pre-processor files.
    requireModuleExtension: true,
    loaderOptions: {
      // css预设器配置项
      // 向 CSS 相关的 loader 传递选项
      less: {
        javascriptEnabled: true,
      },
      scss: {
        // 全局sass变量
        //sass-loader 8.0.0以前版本 - data , v8 - prependData, v10+ - additionalData
        additionalData: `@import "~@/assets/css/variable.scss";`,
      },
    },
  },
  chainWebpack: (config) => {
    // 配置快捷路径
    for (let alia in alias) {
      config.resolve.alias.set(alia, alias[alia]);
    }

    // 默认 svg 处理，排除 此目录下的 svg 处理
    config.module.rule('svg').exclude.add(resolve(svgIconsPath)).end();
    // set svg-sprite-loader
    config.module
      .rule('svg-sprite-loader')
      .test(/\.svg$/)
      .include.add(resolve(svgIconsPath)) // 处理svg目录
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })
      .end();

    // 解决：worker 热更新问题
    config.module.rule('js')
      .exclude.add(/\.worker\.js$/);

    // 解决：“window is undefined”报错，这个是因为worker线程中不存在window对象，因此不能直接使用，要用this代替
    config.output.globalObject('this')

    //配置包分析器
    if(process.env.VUE_ANALYZER) {
      config.plugin('webpack-bundle-analyzer')
        .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    }
    // 使用自定义 loader
    config.module
      .rule("md-loader")
      .test(/\.md$/)
      .use("vue-loader")
      .loader("vue-loader")
      .end()
      .use("md-loader")
      .loader(resolve("./examples/plugins/md-loader/index.js"))
      .end();
  },
  configureWebpack: {
    resolve: {
      // .mjs needed for https://github.com/graphql/graphql-js/issues/1272
      // extensions: ['*', '.mjs', '.js', '.vue', '.json']
    },
    module: {
      rules: [
        {
          test: /\.worker.js$/,
          use: {
            loader: 'worker-loader',
            // 允许将内联的 web worker 作为 BLOB
            options: {
              inline: 'no-fallback'
            }
          },
        },
      ]
    }
  },
};
