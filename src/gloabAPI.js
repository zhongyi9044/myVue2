import { mergeOpions } from "./utils"

export function initGlobalAPI(Vue) {
  //静态options
  Vue.options = {
    _base: Vue//把Vue放进去
  }
  //发布订阅功能
  Vue.mixin = function (mixin) {
    //把用户的选项合并到全局的options

    //1.options和用户options合并
    //2.合并过的options继续和用户options合并
    this.options = mergeOpions(this.options, mixin)
    return this
  }

  // 手动创造组件api
  Vue.extend = function (options) {
    //返回一个构造函数
    function Sub(options = {}) {
      this._init(options)
    }
    Sub.prototype = Object.create(Vue.prototype)//可以用Vue的init和$mount了
    Sub.prototype.constructor = Sub//把constructor指回来

    Sub.options = mergeOpions(Vue.options, options)//用户的选项和全局的合并
    console.log(Sub.options)
    return Sub
  }

  Vue.options.components = {

  }//全局的指令
  //手动创建全局组件
  Vue.component = function (id, definition) {
    definition = typeof definition === 'function' ? definition : Vue.extend(definition)//内部包装，如果传过来的不是extend(xxx)，就这里自动包装
    Vue.options.components[id] = definition//存到里面
    console.log(Vue.options)
  }

}

