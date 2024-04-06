import Dep from "./dep"
import { observe } from "./observe"
import Watcher, { nextTick } from './watcher'

export function initState(vm) {
  const opts = vm.$options//获取所有用户选项（用户写的东西）
  if (opts.data) {
    initData(vm)//初始化数据处理
  }
  //初始化计算属性
  if (opts.computed) {
    initComputed(vm)
  }
  //初始化watch
  if (opts.watch) {
    initWatch(vm)
  }
}

// 初始化watch
function initWatch(vm) {
  let watch = vm.$options.watch
  for (let key in watch) {
    const handler = watch[key]//字符串，数组，函数,暂不考虑对象
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher(vm, key, handler) {
  if (typeof handler == 'string') {
    handler = vm[handler]
  }
  return vm.$watch(key, handler)
}

// 代理vm
function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key]
    },
    set(newValue) {
      vm[target][key] = newValue
    }
  })
}

function initData(vm) {
  let data = vm.$options.data
  //如果是函数式的，就让他执行，且指向this/vm实例
  data = typeof data === 'function' ? data.call(vm) : data

  //因为数据劫持只劫持了数据，用户通过vm对象无法看到用到，所以在vm里创一个和data一模一样的data，这样就能看到用到了
  vm._data_ = data

  //数据劫持，响应式实现
  observe(data)

  //代理vm，因为用户想要获取data数据需要以vm.data.xxx的形式太恶心，所以我们需要把vm.data代理成vm
  for (let key in data) {
    proxy(vm, '_data_', key)
  }
}

//初始化计算属性
function initComputed(vm) {
  const computed = vm.$options.computed
  const watchers = vm._computeWatchers = {}//把计算属性watcher保存到vm里
  for (let key in computed) {
    //函数形式和对象形式的计算属性都能取到
    let userDef = computed[key]
    let fn = typeof userDef === 'function' ? userDef : userDef.get//得到get
    // key名和watcher对应
    watchers[key] = new Watcher(vm, fn, { lazy: true })
    defineComputed(vm, key, userDef)
  }
}
function defineComputed(target, key, userDef) {
  const getter = typeof userDef === 'function' ? userDef : userDef.get//得到get
  const setter = userDef.set || (() => { })//得到set

  //计算属性其实就是把getter和setter取代defineProperty的get和set
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter
  })
  console.log(getter, setter)
}

//检测是否执行getter
function createComputedGetter(key) {
  return function () {
    const watcher = this._computeWatchers[key]//获取对应属性watcher
    if (watcher.dirty) {
      watcher.evaluate()
    }
    if (Dep.target) {
      watcher.depend()
    }
    return watcher.value
  }
}

//watch和nextTick
export function initStateMixin(Vue) {
  //nextTick方法,$nextTick可以让用户直接vm.$nextTick调用
  Vue.prototype.$nextTick = nextTick

  //watch
  Vue.prototype.$watch = function (exprOrFn, cb) {
    new Watcher(this, exprOrFn, { user: true }, cb)
  }
}
