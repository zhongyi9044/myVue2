import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

//rollup默认导出一个对象，作为打包的配置文件
export default {
  input:'./src/index.js',//打包入口
  output:{
    file:'./dist/vue.js',//打包出口
    name:'Vue',//global全局创建挂载一个Vue变量
    format:'umd',//esm es6模块    commonjs模块    iife自执行函数    umd 统一模块规范，兼容了commonjs,amd等除了es6
    sourcemap:true
  },
  // 使用插件
  plugins:[
    //去找babelrc
    babel({
      exclude:'node_modules/**'//排除node_modules文件
    }),
    resolve()
  ]
}

//vue2只支持ie9以上，因为Object.defineProperty,proxy是es6，不支持ie