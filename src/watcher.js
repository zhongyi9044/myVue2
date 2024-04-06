import Dep, { popTarget, pushTarget } from "./dep"

let id = 0
//不同组件有不同watcher，所以需要id标识，如果每个组件watcher都一样，那么一个变了，其他也得变
class Watcher {
  constructor(vm, exprOrFn, options, cb) {
    this.vm = vm
    this.id = id++
    this.renderWatcher = options//判断是不是渲染watcher
    if (typeof exprOrFn === 'string') {
      this.getters = function () {
        return vm[exprOrFn]//去vm找这个名字的函数
      }
    } else {
      this.getters = exprOrFn
    }
    this.cb=cb
    this.user = options.user//是否是用户自己的watch
    this.depsId = new Set()//watcher记录dep，且用于去重
    this.deps = [];//后续实现计算属性和清理工作需要用
    this.lazy = options.lazy//是否立即执行
    this.dirty = this.lazy
    //如果是计算属性这样的懒执行就先不执行
    this.value=this.lazy ? undefined : this.get();
  }
  addDep(dep) {
    let id = dep.id
    //this指向不是dep，是Watcher
    if (!this.depsId.has(id)) {
      this.deps.push(dep)
      this.depsId.add(id)
      dep.addSub(this)
    }
  }
  //懒执行
  evaluate() {
    this.value = this.get()
    this.dirty = false
  }
  get() {
    //当我们创建渲染watcher的时候，我们会把当前渲染的watcher放到Dep.target上，调用render会取值，走到observe的get上,get上就有收集该属性watcher的逻辑
    pushTarget(this)//当前watcher入栈
    let value = this.getters.call(this.vm);//调用getter，及fn，就会去vm取值，如果是计算属性，那么又会因为definedProperty的get进到dep和watcher相关的函数，反正最后就是渲染watcher先入栈，入栈的时候让计算属性名watcher也入栈
    popTarget()//watcher出栈,没有了就变成了null
    return value
  }
  depend() {
    // 让计算属性这样的watcher的dep去绑定渲染watcher，这就是为什么之前用数组存watcher所对应的dep
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }
  update() {//更新的时候直接重新调用异步更新完成渲染
    if (this.lazy) {
      this.dirty = true
    } else {
      queueWatcher(this)
    }
  }
  run() {//调用get直接实现更新
    let oldValue=this.value
    let newValue=this.get()
    if (this.user) {
      this.cb.call(this.vm,newValue,oldValue)
    }
    
  }
}

function flushSchedulerQueue() {
  let flushQueue = queue.slice(0)//拷贝一份
  queue = []//全部清空，下次其他更新还可以用
  has = {}
  pedding = false
  flushQueue.forEach(qWatcher => qWatcher.run())
}

let queue = []//watch更新执行队列
let has = {}//去重判断,这样的话，一个组件只会在主线程执行完所有js代码执行更新一次
let pedding = false//人造节流阀
function queueWatcher(watcher) {
  if (!has[watcher.id]) {
    queue.push(watcher)
    has[watcher.id] = true
    if (!pedding) {//只能执行一次
      nextTick(flushSchedulerQueue, 0);//把更新任务放到异步微任务队列里去，这样就能实现每次更新就更新最后一次，因为所有同步js都在主线程一次性执行完毕
      pedding = true//锁住
    }
  }
}

let callbacks = []
let waiting = false
function flushCallbacks() {
  let cbs = callbacks.slice(0);
  waiting = false
  callbacks = []
  cbs.forEach(cb => cb())
}
// vue的nextTick方法,本质上和上面queueWatcher的原理是一样的，只要明白了消息队列的原理就懂了
export function nextTick(cb) {
  callbacks.push(cb)
  if (!waiting) {
    timerFunc()
    waiting = true
  }
}
//vue源码其实不是定时器，有几个判断，promise，MutationObserve，ie专享api，setTimeout，哪个兼容就用哪个，俗称优雅降级
let timerFunc
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks)
  }
} else if (MutationObserver) {
  let observe = new MutationObserver(flushCallbacks)
  let textNode = document.createTextNode(1)
  observe.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    textNode.textContent = 2
  }
} else if (setImmediate) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  }
}


export default Watcher


//一个组件有多个属性，n个dep对应可以多个watcher
//一个属性对应在多个组件，一个dep对应可以多个watcher
//dep和watcher多对多

