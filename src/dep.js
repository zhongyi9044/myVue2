let id=0

class Dep{
  constructor(){
    this.id=id++//属性的dep要收集watcher
    this.subs=[];//存放了当前属性对应的watcher有哪些
  }
  depend(){
    Dep.target.addDep(this)//让watcher记录dep，因为是observe里的dep调用的depend，所以this指向observe里的dep
  }
  addSub(watcher){
    this.subs.push(watcher)//dep收集watcher
  }
  notify(){
    this.subs.forEach(watcher=>watcher.update())//告诉此dep相关的watcher更新
  }
}
Dep.target=null//创建一个静态的target，记录是哪个组件，及watcher

//把dep记录watcher的行为变成栈
let stack=[]
export function pushTarget(watcher){
  stack.push(watcher)
  Dep.target=watcher
}
export function popTarget(){
  stack.pop()
  Dep.target=stack[stack.length-1]
}
export default Dep