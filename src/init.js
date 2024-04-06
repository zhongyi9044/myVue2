import { compileToFunction } from "./compiler"
import { initState } from "./initState"
import { mountComponent } from "./lifecycle"
import { mergeOpions } from "./utils"

//vue的初始化功能，匿名函数方式
export function initMxin(Vue) {
  //在Vue的原型上直接声明init
  Vue.prototype._init = function (options) {
    const vm = this
    vm.$options = mergeOpions(this.constructor.options, options)//把options直接放在Vue实例里，后面方便用
    console.log(vm.$options)

    // 初始化状态
    initState(vm)

    //判断用户有没有传el
    if (options.el) {
      vm.$mount(options.el)//数据挂载
    }
  }

  Vue.prototype.$mount = function (el) {
    const vm = this
    let ops = vm.$options
    el = document.querySelector(el)//el是#app，需要获取一下
    console.log(el)
    if (!ops.rander) {
      let template
      if (!ops.template && el) {//如果用户没有写render和template，那么就用外部的el
        template = el.outerHTML
      } else {

        template = ops.template

      }
      //如果经过一轮判断，template有值
      if (template) {
        // 对模板进行编译
        const render = compileToFunction(template);

        ops.render = render
      }
    }
    
    mountComponent(vm, el)//组件的挂载
  }
}