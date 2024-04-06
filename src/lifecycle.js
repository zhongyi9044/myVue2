import { createElementVCNode, createTextVVNode } from "./voom"
import Watcher from "./watcher";

import { patch } from "./voom/patch";

export function initLifeCycle(Vue) {
  Vue.prototype._update = function (vNode) {

    const vm = this
    const el = vm.$el
    const prevVnode = vm.vNode = vm._vNode

    vm._vNode = vNode//第一次产生的虚拟节点保存起来
    //核心，将虚拟dom转换成真实dom，有初始化和更新的功能

    if (prevVnode) {//有值就不是第一次
      patch(prevVnode,vNode)
    } else {
      vm.$el = patch(el, vNode);//把vNode转换成真实dom替换el,并且保存起来最新的
    }



  }

  //字符串_c('div',{},...children)这类似的
  Vue.prototype._c = function () {//我们写的render从字符串被转成函数以后会解释成有个_c方法，所以我们要自己写，不然会显示没有这个方法
    return createElementVCNode(this, ...arguments)
  }

  //_v(text)这样式的
  Vue.prototype._v = function () {//我们写的render从字符串被转成函数以后会解释成有个_v方法，所以我们要自己写，不然会显示没有这个方法
    return createTextVVNode(this, ...arguments)//this就是vm
  }
  Vue.prototype._s = function (value) {//我们写的render从字符串被转成函数以后会解释成有个_s方法，所以我们要自己写，不然会显示没有这个方法
    if (typeof value !== 'object') return value
    return JSON.stringify(value)
  }

  Vue.prototype._render = function () {
    const vm = this

    // 因为写render的时候用了with，所以会从实例取值，实例就是vm，这样我们就把实例和视图绑定了
    return vm.$options.render.call(vm)//调用自己写的render函数，指向vm，因为vm有数据
  }
}

export function mountComponent(vm, el) {


  vm.$el = el
  const updateComponent = () => {
    //1.调用render产生虚拟dom
    //2.根据虚拟dom产生真实dom
    vm._update(vm._render())
  }
  //把初渲染和更新渲染放到观察者里
  const watcher = new Watcher(vm, updateComponent, true)

  console.log(watcher)
}

//调用生命周期钩子
export function callHook(vm, hook) {//实例，周期选项
  const handlers = vm.$options[hook]//我们在init的时候就把所有Vue的options合并到实例
  if (handlers) {//如果此钩子有方法需要调用，就循环调用
    handlers.forEach(handler => handler.call(vm))
  }
}