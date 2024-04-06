//专门提供构建虚拟节点
const isReservedTag = (tag) => {
  return ['a', 'div', 'p', 'span', 'button', 'ul', 'li','h2','h1'].includes(tag)//vue里为了判断是真实标签还是自己创建的标签，逐个比对，这里只写了几个常用的
}
//h() _c()
export function createElementVCNode(vm, tag, data = {}, ...children) {
  if (data == null) {
    data = {}
  }
  let key = data.key
  if (key) {
    delete data.key
  }
  if (isReservedTag(tag)) {//是否是真实的原始标签
    return vNode(vm, tag, data, key, children, undefined)
  } else {
    //创建一个自定义组件的虚拟节点
    let Ctor = vm.$options.components[tag]//我们存过创造组件的构造函数
    // 这里Ctor可能是Sub类，也可能是一个组建的对象
    return createComponentVnode(vm, tag, key, data, children, Ctor)
  }

}

function createComponentVnode(vm, tag, key, data, children, Ctor) {
  if (typeof Ctor === 'object') {
    Ctor = vm.$options._base.extend(Ctor)
  }
  data.hook = {
    init(vNode) {
      let instance = vNode.componentInstance = new vNode.componentOptions.Ctor
      
      instance.$mount()
    }
  }
  return vNode(vm, tag, data, key, children, null, {Ctor})
}

// _v()
export function createTextVVNode(vm, text) {
  return vNode(vm, undefined, undefined, undefined, undefined, text)
}

// ast做的是语法的转换，描述语法本身（html，css，js），语法没有的功能不能乱写，虚拟dom是描述dom元素，可以增加自定义元素，描述dom
function vNode(vm, tag, data, key, children, text, componentOptions) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
    componentOptions
  }
}

//判断是不是相同的节点
export function isSameVNode(Vnode1, Vnode2) {
  return Vnode1.tag === Vnode2.tag && Vnode1.key === Vnode2.key
}