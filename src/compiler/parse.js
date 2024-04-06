const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `(('?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`) //匹配标签头比如<div>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) //pi匹配标签尾比如</div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ //匹配属性的key和value，value有3种情况，"",'',没有引号
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g //匹配{{}}
const startTagclose = /^\s*(\/?)>/ //匹配<br/>这种

// vue2用正则表达式，vue3不是

//match匹配正则表达式返回了一个数组，里面有匹配到的结果

export function parseHTML(html) {

  const ELEMENT_TYPE = 1//元素类
  const TEXT_TYPE = 3//文本类
  const stack = []//栈，存放元素
  let currentParent;//指向栈的最后一个元素
  let root;//根节点

  //最终结果转化成抽象语法树

  //AST语法树构建模仿算法题：找大括号的对称，一个‘{’匹配一个‘}’，遇到一个开始元素就入栈，遇到一个结尾元素就出栈，新的节点和文本以当前栈的最后一个元素，即栈顶作为父亲，出栈的时候栈顶就切换成上一个，正好对应了HTML元素对称的样式，所以和匹配{}的方式可以类同

  //节点模板
  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null
    }
  }

  //如果匹配为开始标签的操作
  function start(startTagMatch, attrs) {
    let node = createASTElement(startTagMatch, attrs)//创造一个AST节点
    if (!root) {
      root = node//如果没有根那他就是根
    }
    if (currentParent) {//如果当前节点元素不是根节点，将该节点的父亲指向上一个元素
      node.parent = currentParent
      currentParent.children.push(node)//父亲指向该元素
    }
    stack.push(node)//入栈，作为栈最后一个元素
    currentParent = node//指向该节点
  }

  //如果匹配为文本的操作
  function texts(text) {
    text = text.replace(/\s/g, ' ')//删除空格，随便处理了，按理来说两个空格是要读取得
    text && currentParent.children.push({//把该文本放到栈的最后一个节点元素，作为该元素的文本内容
      type: TEXT_TYPE,
      text,
      parent: currentParent
    })
  }

  //如果匹配为结束标签的操作
  function end(endTagMatch) {
    stack.pop();//出栈
    currentParent = stack[stack.length - 1]
  }

  //截取
  function advance(length) {
    html = html.substring(length)
  }

  // 匹配标签开始
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {//匹配到了
      const match = {
        tagName: start[1],//标签名
        attrs: []
      }
      advance(start[0].length)//匹配完以后去截取html模板
      
      //匹配属性，如果不是标签结束，就一直匹配
      let attr, end
      while (!(end = html.match(startTagclose)) && (attr = html.match(attribute))) {//在循环判断的时候就赋值
        advance(attr[0].length)//匹配完成以后删除
        match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] || true })
      }
      if (end) {//把最后一个>删掉
        advance(end[0].length)
      }

      return match//返回匹配结果对象
    }

    return false //没匹配上就不是
  }

  //循环匹配
  while (html) {//逐个匹配template
    // 如果textEnd=0那么一定是开始或者结束标签
    // 如果textEnd>0那么一定是文本结束位置
    let textEnd = html.indexOf('<')//如果indexOf是0，那么就是标签开始

    // 如果是0，就去匹配一下是不是开始或者结束
    if (textEnd == 0) {
      let startTagMatch = parseStartTag();//匹配是不是开始标签结果
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue//匹配有结果就直接继续循环
      }

      //如果不是开始标签就是结束标签
      let endTagMatch = html.match(endTag)//匹配是不是结束标签结果
      if (endTagMatch) {
        end(endTagMatch[1])
        advance(endTagMatch[0].length)//匹配有结果就截掉后直接继续循环
        continue
      }
    }

    //截取文本内容
    if (textEnd > 0) {
      let text = html.substring(0, textEnd)//获取出文本内容
      if (text) {
        texts(text)
        advance(text.length)//从原文截掉
      }
    }
  }
  return root
}