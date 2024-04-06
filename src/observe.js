import Dep from "./dep"
import { newArrayProto } from "./array"

// 观测类，用于劫持数据
class Observe {
  // 构造函数方法
  constructor(data) {

    //因为对于变量和数组，我们只有在改变整个变量的时候才会引发视图更新，比如a=obj才会引发更新，a.obj.p=10就不会引发更新，所以需要再给每个对象本身而不是指向它的变量增加依赖收集
    this.dep = new Dep()

    //往当前递归目标的data里放Observe实例，可以在newArrayProto里用，甚至可以作为被监测过的标识，秒，太妙了
    Object.defineProperty(data, '_ob_', {
      value: this,//给data一个ob属性，并且不可枚举，因为可枚举的话，ob里有walk等方法，递归会死循环
      enumerable: false
    })
    // 递归的时候如果是数组那就不要每个数组元素都劫持，进行额外处理
    if (Array.isArray(data)) {
      data.__proto__ = newArrayProto
      this.observeArray(data)
    } else {
      this.walk(data)
    }
  }
  //劫持(因为defineProperty不能知道新加和删除属性，所以劫持需要自己遍历)
  walk(data) {
    // 遍历对象劫持，自己写一个defineReactive方法劫持
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
  }

  //监听数组
  observeArray(data) {
    data.forEach(item => observe(item))
  }
}

//数组依赖收集
function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    // 如果是数组,对象才依赖收集
    value[i]._ob_ && value[i]._ob_.dep.depend()
    if (Array.isArray(value[i])) {
      dependArray(value[i])
    }
  }
}

//劫持普通数据和对象
function defineReactive(target, key, value) {//get和set能拿到value，存在闭包
  // defineProperty把数据重新定义了，也就是比proxy缺点的地方
  let childOb = observe(value)//如果是对象，那么递归循环劫持，这一步非常秒，太妙了，在observe里刚好有一个判断是否是对象,并且接收
  let dep = new Dep()//每个属性都有一个dep
  Object.defineProperty(target, key, {
    get() {//取
      if (Dep.target) {
        dep.depend();//收集这个watcher，知道他在哪个组件
        if (childOb) {//如果存在那么就说明是对象或者数组
          childOb.dep.depend()//让这个数组，对象本身，而不是指向它的变量直接进行依赖收集
          if (Array.isArray(value)) {//如果是数组，那么要额外处理防止数组里还是数组的情况
            dependArray(value)
          }
        }
      }
      return value
    },
    set(newValue) {//改
      if (newValue === value) {
        return
      }
      observe(newValue)
      value = newValue
      dep.notify()//通知更新
    }
  })
}

export function observe(data) {
  // null在typeof里是object
  if (typeof data !== 'object' || data == null) {
    return
  }//判断是否是对象，不仅跳过了data，还可以用来递归，牛逼

  if (data._ob_ instanceof Observe) {//如果有这个标识，那就是被代理过，可以跳过，非常妙啊
    return;
  }

  return new Observe(data)
}