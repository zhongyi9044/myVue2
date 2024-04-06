import { compileToFunction } from './compiler'
import { initGlobalAPI } from './gloabAPI'
import { initMxin } from './init'
import { initStateMixin } from './initState'
import { initLifeCycle } from './lifecycle'
import { createElm, patch } from './voom/patch'

//Vue的构造方法
function Vue(options) {//options就是用户写的东西
  //init方法已经在initMixin里通过原型链创建
  this._init(options)
}

//运行initMxin，这样就在Vue原型创建了一个函数，Vue可以直接用
initMxin(Vue)

//渲染虚拟dom变成真实dom和挂载
initLifeCycle(Vue)

//mixin
initGlobalAPI(Vue)

//watch和nextTick
initStateMixin(Vue)


export default Vue

