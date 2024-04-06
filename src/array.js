//重写数组的部分方法

let oldArrayProte = Array.prototype
// 创建一个中间人，这样既可以继承数组原来的方法，也可以自己写新方法
export let newArrayProto = Object.create(oldArrayProte)

let methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'revers',
  'sort',
  'splice'
]

methods.forEach(method => {
  newArrayProto[method] = function (...args) {//重写数组方法
    const result = oldArrayProte[method].call(this, ...args)//内部调用原来的方法
    //对新增的值进行监测
    let inserted
    let ob=this._ob_
    switch(method){
      case 'push':
      case 'unshift':
        inserted=args;//所有参数
        break
      case 'splice':
        inserted=args.slice(2)//截掉前两个的所有参数
        break
      default:
        break  
    }
    if(inserted){
      ob.observeArray(inserted)//因为这些方法的调用者一定是当前数组，我们在observe里已经给他放了监听类
    }
    ob.dep.notify()//数组变化了，通知watcher更新
    return result
  }
  
})