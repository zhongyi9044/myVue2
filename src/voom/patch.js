import { isSameVNode } from '.'

function createComponent(vNode) {
  let i = vNode.data
  
  if ((i = i.hook)&&(i = i.init)) {
      i(vNode)    
  }
  if(vNode.componentInstance){
    return true
  }
}

//递归渲染成真实节点
export function createElm(vNode) {
  let { tag, data, children, text } = vNode //解构赋值

  if (typeof tag === 'string') {
    //判断是不是标签

    if (createComponent(vNode)) {
      return vNode.componentInstance.$el
    }

    vNode.el = document.createElement(tag) //把虚拟节点和真实节点对应起来，并且挂载到vNode

    patchProps(vNode.el, {}, data) //处理属性

    // 孩子节点递归创建挂载
    children.forEach((child) => {
      vNode.el.appendChild(createElm(child))
    })
  } else {
    vNode.el = document.createTextNode(text) //创建文本
  }
  return vNode.el
}

//处理元素属性
export function patchProps(el, oldProps = {}, props = {}) {
  // 更新时候删除老的各种属性，新的加进去
  let oldStyles = oldProps.style || {}
  let newStyles = props.style || {}
  for (let key1 in oldStyles) {
    if (!newStyles[key1]) {
      el.style[key1] = ''
    }
  }
  for (let key2 in oldProps) {
    console.log(key2)
    if (!props[key2]) {
      el.removeAttribute(key2)
    }
  }

  for (let key3 in props) {
    if (key3 === 'style') {
      //处理style的情况，style{color:'red'}
      for (let styleName in props.style) {
        console.log(styleName)
        el.style[styleName] = props.style[styleName]
      }
    } else {
      if(el){
        el.setAttribute(key3, props[key3])
      }
      
    }
  }
}

export function patch(oldVNode, vNode) {

  if(!oldVNode){//组件挂载
    return createElm(vNode)
  }

  //初渲染
  const isRealElement = oldVNode.nodeType //判断是不是真的元素，还是虚拟dom
  if (isRealElement) {//初次渲染
    const elm = oldVNode //改名

    const parentEle = elm.parentNode //拿到父元素

    let newElm = createElm(vNode)
    parentEle.insertBefore(newElm, elm.nextSibling)
    parentEle.removeChild(elm)

    return newElm
  } else {//修改渲染
    //diff算法

    //1.两个节点不是同一个节点，直接删除老的换新的
    //2.两个节点是同一个节点（key和tag是相同的），属性是否相同(复用老的属性，添加新的属性)
    //3.比较儿子
    patchVnode(oldVNode, vNode)
  }

  function patchVnode(oldVNode, vNode) {
    //不相同元素
    if (!isSameVNode(oldVNode, vNode)) {
      let el = createElm(vNode)
      oldVNode.el.parentNode.replaceChild(el, oldVNode.el) //相同，老的换新的
      return el
    }
    //相同元素
    let el = (vNode.el = oldVNode.el) //直接复用老的节点元素
    if (!oldVNode.tag) {
      //文本情况，tag是undefined
      if (oldVNode.text !== vNode.text) {
        el.textContent = vNode.text
      }
    }
    //是标签
    patchProps(el, oldVNode.data, vNode.data)

    //比较儿子节点
    //1. 有一方没儿子
    //2. 两方都有儿子
    let oldChildren = oldVNode.children || []
    let newChildren = vNode.children || []
    if (oldChildren.length > 0 && newChildren.length > 0) {
      //都有儿子
      updateChildren(el, oldChildren, newChildren)
    } else if (newChildren.length > 0) {
      //老的没儿子，新的有
      mountChildren(el, newChildren)
    } else if (oldChildren.length > 0) {
      el.innerHTML = '' //写的简单了，建议循环
    }
    return el
  }
  function mountChildren(el, newChildren) {
    for (let i = 0; i < newChildren.length; i++) {
      //把子节点循环加进去
      let child = newChildren[i]
      el.appendChild(createElm(child))
    }
  }

  // diff算法
  function updateChildren(el, oldChildren, newChildren) {
    let oldStartIndex = 0
    let newStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    let newEndIndex = newChildren.length - 1

    let oldStartVnode = oldChildren[0]
    let newStartVnode = newChildren[0]
    let oldEndVnode = oldChildren[oldEndIndex]
    let newEndVnode = newChildren[newEndIndex]

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {

      if (isSameVNode(oldStartVnode, newStartVnode)) {//如果两个头孩子相同
        patchVnode(oldStartVnode, newStartVnode)//递归比较子节点
        oldStartVnode = oldChildren[++oldStartIndex]
        newStartVnode = newChildren[++newStartIndex]
      }

      else if (isSameVNode(oldEndVnode, newEndVnode)) {//如果两个尾孩子相同
        patchVnode(oldEndVnode, newEndVnode)//递归比较子节点
        oldEndVnode = oldChildren[--oldEndIndex]
        newEndVnode = newChildren[--newEndIndex]
      }

      else if (isSameVNode(oldEndVnode, newStartVnode)) {//如果头头，尾尾都不同，但是新头老尾相同
        patchVnode(oldEndVnode, newStartVnode)//递归比较子节点
        el.insertBefore(oldEndVnode.el, oldStartVnode.el)//把老尾巴移到老头
        oldEndVnode = oldChildren[--oldEndIndex]
        newStartVnode = newChildren[++newStartIndex]
      }

      else if (isSameVNode(oldStartVnode, newEndVnode)) {//如果头头，尾尾都不同，但是老头新尾相同
        patchVnode(oldStartVnode, newEndVnode)//递归比较子节点
        el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)//把老头移到老尾巴
        oldStartVnode = oldChildren[++oldStartIndex]
        newEndVnode = newChildren[--newEndIndex]
      }

    }
    //如果此时跳出循环的时候，新元素的节点还有多的，那就说明新的多余老的，要插入.两种情况，后面多和前面多
    if (newStartIndex <= newEndIndex) {
      for (let i = newStartIndex; i <= newEndIndex; i++) {
        let childEl = createElm(newChildren[i])
        let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null
        el.insertBefore(childEl, anchor)//anchor为null的话就是appendChild
      }
    }
    //如果此时跳出循环的时候，老元素的节点还有多的，那就说明新的少余老的，要删老的
    if (oldStartIndex <= oldEndIndex) {
      for (let i = oldStartIndex; i <= oldEndIndex; i++) {
        let childEl = oldChildren[i].el
        el.removeChild(childEl)
      }
    }
  }
}
