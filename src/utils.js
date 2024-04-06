//策略
const strats = {}
const LIFECYCLE = [
  'beforeCreate',
  'created'
  //所有生命周期做成策略
]
//生成strats[create]这样的生命周期策略，还可以加computed之类的策略
LIFECYCLE.forEach(hook => {
  //1.{}+{created:function(){}}=>{created:[fn]}
  //2.{created:[fn]}+{created:function(){}}=>{create:[fn,fn]}
  strats[hook] = function (parent, child) {
    if (child) {
      if (parent) {//如果父子都不是空，父子拼在一次
        return parent.concat(child)
      } else {//如果是一开始，parent是空，直接是儿子
        return [child]
      }
    } else {//如果子是空，直接继续用父亲
      return parent
    }
  }
})

//制定一个合并策略
strats.components =function(parentVal,childVal){
  const res=Object.create(parentVal)

  if(childVal){//如果孩子存在，那就把孩子的属性拷贝到父亲，实现了孩子找不到，那就去父亲找
    for(let key in childVal){
      res[key]=childVal[key]
    }
  }

  return res
}
//合并
export function mergeOpions(parent, child) {
  const options = {}

  for (let key in parent) {//循环旧options
    mergeFild(key)
  }

  for (let key in child) {//循环新options
    if (!parent.hasOwnProperty(key)) {//如果旧的已经有该属性，那就不用加了，只需要在旧的optionsmergeFild的时候选择新的options的该属性就行
      mergeFild(key)
    }
  }

  function mergeFild(key) {
    if (typeof child[key] == 'function' && key==='data') {
      child[key] = child[key]()
    }//防止是data是函数形式

    // 选择策略模式减少if-else
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key])
    } else {
      //不在策略里就直接以儿子为准
      options[key] = child[key] || parent[key]//有儿用儿，无儿找爹
    }
  }

  return options
}