import { parseHTML } from './parse'
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g //匹配{{}}

function genProps(attrs) {
  let str = ''
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i]
    if (attr.name === 'style') {
      let obj = {}
      attr.value.split(';').forEach((item) => {
        item=item.trim()
        let [key, value] = item.split(':')
        obj[key] = value
      })
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0, -1)}}`
}

function gen(node) {
  if (node.type === 1) {
    return codegen(node)
  } else {
    let text = node.text
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    } else {
      let tokens = [];
      let match
      defaultTagRE.lastIndex = 0
      let lastIndex = 0
      while (match = defaultTagRE.exec(text)) {
        let index = match.index

        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)))
        }

        tokens.push(`_s(${match[1].trim()})`)

        lastIndex = index + match[0].length
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
      }
      return `_v(${tokens.join('+')})`
    }
  }
}

function genChildren(children) {
  return children.map((child) => gen(child)).join(',')
}

function codegen(ast) {
  let children = genChildren(ast.children)
  let code = `_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'
    }${ast.children.length ? `,${children}` : ''})`

  return code
}

export function compileToFunction(template) {
  //template转换成ast语法树
  let ast = parseHTML(template)

  // console.log(ast)

  //把ast语法树拼接成语法树代码，其实就是字符串
  let code = codegen(ast)//恶心，不想看

  //with方法可以让内部变量从this里取值，模板引擎实现原理就是with+new Function
  code = `with(this){return ${code}}`

  let render = new Function(code)//new Function把code变成可执行函数

  return render
}

