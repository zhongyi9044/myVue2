(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "(('?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); //匹配标签头比如<div>
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //pi匹配标签尾比如</div>
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性的key和value，value有3种情况，"",'',没有引号
  var startTagclose = /^\s*(\/?)>/; //匹配<br/>这种

  // vue2用正则表达式，vue3不是

  //match匹配正则表达式返回了一个数组，里面有匹配到的结果

  function parseHTML(html) {
    var ELEMENT_TYPE = 1; //元素类
    var TEXT_TYPE = 3; //文本类
    var stack = []; //栈，存放元素
    var currentParent; //指向栈的最后一个元素
    var root; //根节点

    //最终结果转化成抽象语法树

    //AST语法树构建模仿算法题：找大括号的对称，一个‘{’匹配一个‘}’，遇到一个开始元素就入栈，遇到一个结尾元素就出栈，新的节点和文本以当前栈的最后一个元素，即栈顶作为父亲，出栈的时候栈顶就切换成上一个，正好对应了HTML元素对称的样式，所以和匹配{}的方式可以类同

    //节点模板
    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }

    //如果匹配为开始标签的操作
    function start(startTagMatch, attrs) {
      var node = createASTElement(startTagMatch, attrs); //创造一个AST节点
      if (!root) {
        root = node; //如果没有根那他就是根
      }
      if (currentParent) {
        //如果当前节点元素不是根节点，将该节点的父亲指向上一个元素
        node.parent = currentParent;
        currentParent.children.push(node); //父亲指向该元素
      }
      stack.push(node); //入栈，作为栈最后一个元素
      currentParent = node; //指向该节点
    }

    //如果匹配为文本的操作
    function texts(text) {
      text = text.replace(/\s/g, ' '); //删除空格，随便处理了，按理来说两个空格是要读取得
      text && currentParent.children.push({
        //把该文本放到栈的最后一个节点元素，作为该元素的文本内容
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }

    //如果匹配为结束标签的操作
    function end(endTagMatch) {
      stack.pop(); //出栈
      currentParent = stack[stack.length - 1];
    }

    //截取
    function advance(length) {
      html = html.substring(length);
    }

    // 匹配标签开始
    function parseStartTag() {
      var start = html.match(startTagOpen);
      if (start) {
        //匹配到了
        var match = {
          tagName: start[1],
          //标签名
          attrs: []
        };
        advance(start[0].length); //匹配完以后去截取html模板

        //匹配属性，如果不是标签结束，就一直匹配
        var attr, _end;
        while (!(_end = html.match(startTagclose)) && (attr = html.match(attribute))) {
          //在循环判断的时候就赋值
          advance(attr[0].length); //匹配完成以后删除
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        }
        if (_end) {
          //把最后一个>删掉
          advance(_end[0].length);
        }
        return match; //返回匹配结果对象
      }
      return false; //没匹配上就不是
    }

    //循环匹配
    while (html) {
      //逐个匹配template
      // 如果textEnd=0那么一定是开始或者结束标签
      // 如果textEnd>0那么一定是文本结束位置
      var textEnd = html.indexOf('<'); //如果indexOf是0，那么就是标签开始

      // 如果是0，就去匹配一下是不是开始或者结束
      if (textEnd == 0) {
        var startTagMatch = parseStartTag(); //匹配是不是开始标签结果
        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue; //匹配有结果就直接继续循环
        }

        //如果不是开始标签就是结束标签
        var endTagMatch = html.match(endTag); //匹配是不是结束标签结果
        if (endTagMatch) {
          end(endTagMatch[1]);
          advance(endTagMatch[0].length); //匹配有结果就截掉后直接继续循环
          continue;
        }
      }

      //截取文本内容
      if (textEnd > 0) {
        var text = html.substring(0, textEnd); //获取出文本内容
        if (text) {
          texts(text);
          advance(text.length); //从原文截掉
        }
      }
    }
    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配{{}}

  function genProps(attrs) {
    var str = '';
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === 'style') {
        var obj = {};
        attr.value.split(';').forEach(function (item) {
          item = item.trim();
          var _item$split = item.split(':'),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          obj[key] = value;
        });
        attr.value = obj;
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}");
  }
  function gen(node) {
    if (node.type === 1) {
      return codegen(node);
    } else {
      var text = node.text;
      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;
        while (match = defaultTagRE.exec(text)) {
          var index = match.index;
          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }
  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(',');
  }
  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")");
    return code;
  }
  function compileToFunction(template) {
    //template转换成ast语法树
    var ast = parseHTML(template);

    // console.log(ast)

    //把ast语法树拼接成语法树代码，其实就是字符串
    var code = codegen(ast); //恶心，不想看

    //with方法可以让内部变量从this里取值，模板引擎实现原理就是with+new Function
    code = "with(this){return ".concat(code, "}");
    var render = new Function(code); //new Function把code变成可执行函数

    return render;
  }

  //策略
  var strats = {};
  var LIFECYCLE = ['beforeCreate', 'created'
  //所有生命周期做成策略
  ];
  //生成strats[create]这样的生命周期策略，还可以加computed之类的策略
  LIFECYCLE.forEach(function (hook) {
    //1.{}+{created:function(){}}=>{created:[fn]}
    //2.{created:[fn]}+{created:function(){}}=>{create:[fn,fn]}
    strats[hook] = function (parent, child) {
      if (child) {
        if (parent) {
          //如果父子都不是空，父子拼在一次
          return parent.concat(child);
        } else {
          //如果是一开始，parent是空，直接是儿子
          return [child];
        }
      } else {
        //如果子是空，直接继续用父亲
        return parent;
      }
    };
  });

  //制定一个合并策略
  strats.components = function (parentVal, childVal) {
    var res = Object.create(parentVal);
    if (childVal) {
      //如果孩子存在，那就把孩子的属性拷贝到父亲，实现了孩子找不到，那就去父亲找
      for (var key in childVal) {
        res[key] = childVal[key];
      }
    }
    return res;
  };
  //合并
  function mergeOpions(parent, child) {
    var options = {};
    for (var key in parent) {
      //循环旧options
      mergeFild(key);
    }
    for (var _key in child) {
      //循环新options
      if (!parent.hasOwnProperty(_key)) {
        //如果旧的已经有该属性，那就不用加了，只需要在旧的optionsmergeFild的时候选择新的options的该属性就行
        mergeFild(_key);
      }
    }
    function mergeFild(key) {
      if (typeof child[key] == 'function' && key === 'data') {
        child[key] = child[key]();
      } //防止是data是函数形式

      // 选择策略模式减少if-else
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        //不在策略里就直接以儿子为准
        options[key] = child[key] || parent[key]; //有儿用儿，无儿找爹
      }
    }
    return options;
  }

  function initGlobalAPI(Vue) {
    //静态options
    Vue.options = {
      _base: Vue //把Vue放进去
    };
    //发布订阅功能
    Vue.mixin = function (mixin) {
      //把用户的选项合并到全局的options

      //1.options和用户options合并
      //2.合并过的options继续和用户options合并
      this.options = mergeOpions(this.options, mixin);
      return this;
    };

    // 手动创造组件api
    Vue.extend = function (options) {
      //返回一个构造函数
      function Sub() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this._init(options);
      }
      Sub.prototype = Object.create(Vue.prototype); //可以用Vue的init和$mount了
      Sub.prototype.constructor = Sub; //把constructor指回来

      Sub.options = mergeOpions(Vue.options, options); //用户的选项和全局的合并
      console.log(Sub.options);
      return Sub;
    };
    Vue.options.components = {}; //全局的指令
    //手动创建全局组件
    Vue.component = function (id, definition) {
      definition = typeof definition === 'function' ? definition : Vue.extend(definition); //内部包装，如果传过来的不是extend(xxx)，就这里自动包装
      Vue.options.components[id] = definition; //存到里面
      console.log(Vue.options);
    };
  }

  var id$1 = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      this.id = id$1++; //属性的dep要收集watcher
      this.subs = []; //存放了当前属性对应的watcher有哪些
    }
    return _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        Dep.target.addDep(this); //让watcher记录dep，因为是observe里的dep调用的depend，所以this指向observe里的dep
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher); //dep收集watcher
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        }); //告诉此dep相关的watcher更新
      }
    }]);
  }();
  Dep.target = null; //创建一个静态的target，记录是哪个组件，及watcher

  //把dep记录watcher的行为变成栈
  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  //重写数组的部分方法

  var oldArrayProte = Array.prototype;
  // 创建一个中间人，这样既可以继承数组原来的方法，也可以自己写新方法
  var newArrayProto = Object.create(oldArrayProte);
  var methods = ['push', 'pop', 'shift', 'unshift', 'revers', 'sort', 'splice'];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProte$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      //重写数组方法
      var result = (_oldArrayProte$method = oldArrayProte[method]).call.apply(_oldArrayProte$method, [this].concat(args)); //内部调用原来的方法
      //对新增的值进行监测
      var inserted;
      var ob = this._ob_;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args; //所有参数
          break;
        case 'splice':
          inserted = args.slice(2); //截掉前两个的所有参数
          break;
      }
      if (inserted) {
        ob.observeArray(inserted); //因为这些方法的调用者一定是当前数组，我们在observe里已经给他放了监听类
      }
      ob.dep.notify(); //数组变化了，通知watcher更新
      return result;
    };
  });

  // 观测类，用于劫持数据
  var Observe = /*#__PURE__*/function () {
    // 构造函数方法
    function Observe(data) {
      _classCallCheck(this, Observe);
      //因为对于变量和数组，我们只有在改变整个变量的时候才会引发视图更新，比如a=obj才会引发更新，a.obj.p=10就不会引发更新，所以需要再给每个对象本身而不是指向它的变量增加依赖收集
      this.dep = new Dep();

      //往当前递归目标的data里放Observe实例，可以在newArrayProto里用，甚至可以作为被监测过的标识，秒，太妙了
      Object.defineProperty(data, '_ob_', {
        value: this,
        //给data一个ob属性，并且不可枚举，因为可枚举的话，ob里有walk等方法，递归会死循环
        enumerable: false
      });
      // 递归的时候如果是数组那就不要每个数组元素都劫持，进行额外处理
      if (Array.isArray(data)) {
        data.__proto__ = newArrayProto;
        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }
    //劫持(因为defineProperty不能知道新加和删除属性，所以劫持需要自己遍历)
    return _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        // 遍历对象劫持，自己写一个defineReactive方法劫持
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }

      //监听数组
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe$1(item);
        });
      }
    }]);
  }(); //数组依赖收集
  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      // 如果是数组,对象才依赖收集
      value[i]._ob_ && value[i]._ob_.dep.depend();
      if (Array.isArray(value[i])) {
        dependArray(value[i]);
      }
    }
  }

  //劫持普通数据和对象
  function defineReactive(target, key, value) {
    //get和set能拿到value，存在闭包
    // defineProperty把数据重新定义了，也就是比proxy缺点的地方
    var childOb = observe$1(value); //如果是对象，那么递归循环劫持，这一步非常秒，太妙了，在observe里刚好有一个判断是否是对象,并且接收
    var dep = new Dep(); //每个属性都有一个dep
    Object.defineProperty(target, key, {
      get: function get() {
        //取
        if (Dep.target) {
          dep.depend(); //收集这个watcher，知道他在哪个组件
          if (childOb) {
            //如果存在那么就说明是对象或者数组
            childOb.dep.depend(); //让这个数组，对象本身，而不是指向它的变量直接进行依赖收集
            if (Array.isArray(value)) {
              //如果是数组，那么要额外处理防止数组里还是数组的情况
              dependArray(value);
            }
          }
        }
        return value;
      },
      set: function set(newValue) {
        //改
        if (newValue === value) {
          return;
        }
        observe$1(newValue);
        value = newValue;
        dep.notify(); //通知更新
      }
    });
  }
  function observe$1(data) {
    // null在typeof里是object
    if (_typeof(data) !== 'object' || data == null) {
      return;
    } //判断是否是对象，不仅跳过了data，还可以用来递归，牛逼

    if (data._ob_ instanceof Observe) {
      //如果有这个标识，那就是被代理过，可以跳过，非常妙啊
      return;
    }
    return new Observe(data);
  }

  var id = 0;
  //不同组件有不同watcher，所以需要id标识，如果每个组件watcher都一样，那么一个变了，其他也得变
  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, options, cb) {
      _classCallCheck(this, Watcher);
      this.vm = vm;
      this.id = id++;
      this.renderWatcher = options; //判断是不是渲染watcher
      if (typeof exprOrFn === 'string') {
        this.getters = function () {
          return vm[exprOrFn]; //去vm找这个名字的函数
        };
      } else {
        this.getters = exprOrFn;
      }
      this.cb = cb;
      this.user = options.user; //是否是用户自己的watch
      this.depsId = new Set(); //watcher记录dep，且用于去重
      this.deps = []; //后续实现计算属性和清理工作需要用
      this.lazy = options.lazy; //是否立即执行
      this.dirty = this.lazy;
      //如果是计算属性这样的懒执行就先不执行
      this.value = this.lazy ? undefined : this.get();
    }
    return _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;
        //this指向不是dep，是Watcher
        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this);
        }
      }
      //懒执行
    }, {
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get();
        this.dirty = false;
      }
    }, {
      key: "get",
      value: function get() {
        //当我们创建渲染watcher的时候，我们会把当前渲染的watcher放到Dep.target上，调用render会取值，走到observe的get上,get上就有收集该属性watcher的逻辑
        pushTarget(this); //当前watcher入栈
        var value = this.getters.call(this.vm); //调用getter，及fn，就会去vm取值，如果是计算属性，那么又会因为definedProperty的get进到dep和watcher相关的函数，反正最后就是渲染watcher先入栈，入栈的时候让计算属性名watcher也入栈
        popTarget(); //watcher出栈,没有了就变成了null
        return value;
      }
    }, {
      key: "depend",
      value: function depend() {
        // 让计算属性这样的watcher的dep去绑定渲染watcher，这就是为什么之前用数组存watcher所对应的dep
        var i = this.deps.length;
        while (i--) {
          this.deps[i].depend();
        }
      }
    }, {
      key: "update",
      value: function update() {
        //更新的时候直接重新调用异步更新完成渲染
        if (this.lazy) {
          this.dirty = true;
        } else {
          queueWatcher(this);
        }
      }
    }, {
      key: "run",
      value: function run() {
        //调用get直接实现更新
        var oldValue = this.value;
        var newValue = this.get();
        if (this.user) {
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }]);
  }();
  function flushSchedulerQueue() {
    var flushQueue = queue.slice(0); //拷贝一份
    queue = []; //全部清空，下次其他更新还可以用
    has = {};
    pedding = false;
    flushQueue.forEach(function (qWatcher) {
      return qWatcher.run();
    });
  }
  var queue = []; //watch更新执行队列
  var has = {}; //去重判断,这样的话，一个组件只会在主线程执行完所有js代码执行更新一次
  var pedding = false; //人造节流阀
  function queueWatcher(watcher) {
    if (!has[watcher.id]) {
      queue.push(watcher);
      has[watcher.id] = true;
      if (!pedding) {
        //只能执行一次
        nextTick(flushSchedulerQueue); //把更新任务放到异步微任务队列里去，这样就能实现每次更新就更新最后一次，因为所有同步js都在主线程一次性执行完毕
        pedding = true; //锁住
      }
    }
  }
  var callbacks = [];
  var waiting = false;
  function flushCallbacks() {
    var cbs = callbacks.slice(0);
    waiting = false;
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    });
  }
  // vue的nextTick方法,本质上和上面queueWatcher的原理是一样的，只要明白了消息队列的原理就懂了
  function nextTick(cb) {
    callbacks.push(cb);
    if (!waiting) {
      timerFunc();
      waiting = true;
    }
  }
  //vue源码其实不是定时器，有几个判断，promise，MutationObserve，ie专享api，setTimeout，哪个兼容就用哪个，俗称优雅降级
  var timerFunc;
  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    var observe = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(1);
    observe.observe(textNode, {
      characterData: true
    });
    timerFunc = function timerFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    timerFunc = function timerFunc() {
      setTimeout(flushCallbacks, 0);
    };
  }

  //一个组件有多个属性，n个dep对应可以多个watcher
  //一个属性对应在多个组件，一个dep对应可以多个watcher
  //dep和watcher多对多

  function initState(vm) {
    var opts = vm.$options; //获取所有用户选项（用户写的东西）
    if (opts.data) {
      initData(vm); //初始化数据处理
    }
    //初始化计算属性
    if (opts.computed) {
      initComputed(vm);
    }
    //初始化watch
    if (opts.watch) {
      initWatch(vm);
    }
  }

  // 初始化watch
  function initWatch(vm) {
    var watch = vm.$options.watch;
    for (var key in watch) {
      var handler = watch[key]; //字符串，数组，函数,暂不考虑对象
      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }
  function createWatcher(vm, key, handler) {
    if (typeof handler == 'string') {
      handler = vm[handler];
    }
    return vm.$watch(key, handler);
  }

  // 代理vm
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data;
    //如果是函数式的，就让他执行，且指向this/vm实例
    data = typeof data === 'function' ? data.call(vm) : data;

    //因为数据劫持只劫持了数据，用户通过vm对象无法看到用到，所以在vm里创一个和data一模一样的data，这样就能看到用到了
    vm._data_ = data;

    //数据劫持，响应式实现
    observe$1(data);

    //代理vm，因为用户想要获取data数据需要以vm.data.xxx的形式太恶心，所以我们需要把vm.data代理成vm
    for (var key in data) {
      proxy(vm, '_data_', key);
    }
  }

  //初始化计算属性
  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = vm._computeWatchers = {}; //把计算属性watcher保存到vm里
    for (var key in computed) {
      //函数形式和对象形式的计算属性都能取到
      var userDef = computed[key];
      var fn = typeof userDef === 'function' ? userDef : userDef.get; //得到get
      // key名和watcher对应
      watchers[key] = new Watcher(vm, fn, {
        lazy: true
      });
      defineComputed(vm, key, userDef);
    }
  }
  function defineComputed(target, key, userDef) {
    var getter = typeof userDef === 'function' ? userDef : userDef.get; //得到get
    var setter = userDef.set || function () {}; //得到set

    //计算属性其实就是把getter和setter取代defineProperty的get和set
    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
    console.log(getter, setter);
  }

  //检测是否执行getter
  function createComputedGetter(key) {
    return function () {
      var watcher = this._computeWatchers[key]; //获取对应属性watcher
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    };
  }

  //watch和nextTick
  function initStateMixin(Vue) {
    //nextTick方法,$nextTick可以让用户直接vm.$nextTick调用
    Vue.prototype.$nextTick = nextTick;

    //watch
    Vue.prototype.$watch = function (exprOrFn, cb) {
      new Watcher(this, exprOrFn, {
        user: true
      }, cb);
    };
  }

  //专门提供构建虚拟节点
  var isReservedTag = function isReservedTag(tag) {
    return ['a', 'div', 'p', 'span', 'button', 'ul', 'li', 'h2', 'h1'].includes(tag); //vue里为了判断是真实标签还是自己创建的标签，逐个比对，这里只写了几个常用的
  };
  //h() _c()
  function createElementVCNode(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    if (data == null) {
      data = {};
    }
    var key = data.key;
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    if (isReservedTag(tag)) {
      //是否是真实的原始标签
      return vNode(vm, tag, data, key, children, undefined);
    } else {
      //创建一个自定义组件的虚拟节点
      var Ctor = vm.$options.components[tag]; //我们存过创造组件的构造函数
      // 这里Ctor可能是Sub类，也可能是一个组建的对象
      return createComponentVnode(vm, tag, key, data, children, Ctor);
    }
  }
  function createComponentVnode(vm, tag, key, data, children, Ctor) {
    if (_typeof(Ctor) === 'object') {
      Ctor = vm.$options._base.extend(Ctor);
    }
    data.hook = {
      init: function init(vNode) {
        var instance = vNode.componentInstance = new vNode.componentOptions.Ctor();
        instance.$mount();
      }
    };
    return vNode(vm, tag, data, key, children, null, {
      Ctor: Ctor
    });
  }

  // _v()
  function createTextVVNode(vm, text) {
    return vNode(vm, undefined, undefined, undefined, undefined, text);
  }

  // ast做的是语法的转换，描述语法本身（html，css，js），语法没有的功能不能乱写，虚拟dom是描述dom元素，可以增加自定义元素，描述dom
  function vNode(vm, tag, data, key, children, text, componentOptions) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text,
      componentOptions: componentOptions
    };
  }

  //判断是不是相同的节点
  function isSameVNode(Vnode1, Vnode2) {
    return Vnode1.tag === Vnode2.tag && Vnode1.key === Vnode2.key;
  }

  function createComponent(vNode) {
    var i = vNode.data;
    if ((i = i.hook) && (i = i.init)) {
      i(vNode);
    }
    if (vNode.componentInstance) {
      return true;
    }
  }

  //递归渲染成真实节点
  function createElm(vNode) {
    var tag = vNode.tag,
      data = vNode.data,
      children = vNode.children,
      text = vNode.text; //解构赋值

    if (typeof tag === 'string') {
      //判断是不是标签

      if (createComponent(vNode)) {
        return vNode.componentInstance.$el;
      }
      vNode.el = document.createElement(tag); //把虚拟节点和真实节点对应起来，并且挂载到vNode

      patchProps(vNode.el, {}, data); //处理属性

      // 孩子节点递归创建挂载
      children.forEach(function (child) {
        vNode.el.appendChild(createElm(child));
      });
    } else {
      vNode.el = document.createTextNode(text); //创建文本
    }
    return vNode.el;
  }

  //处理元素属性
  function patchProps(el) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    // 更新时候删除老的各种属性，新的加进去
    var oldStyles = oldProps.style || {};
    var newStyles = props.style || {};
    for (var key1 in oldStyles) {
      if (!newStyles[key1]) {
        el.style[key1] = '';
      }
    }
    for (var key2 in oldProps) {
      console.log(key2);
      if (!props[key2]) {
        el.removeAttribute(key2);
      }
    }
    for (var key3 in props) {
      if (key3 === 'style') {
        //处理style的情况，style{color:'red'}
        for (var styleName in props.style) {
          console.log(styleName);
          el.style[styleName] = props.style[styleName];
        }
      } else {
        if (el) {
          el.setAttribute(key3, props[key3]);
        }
      }
    }
  }
  function patch(oldVNode, vNode) {
    if (!oldVNode) {
      //组件挂载
      return createElm(vNode);
    }

    //初渲染
    var isRealElement = oldVNode.nodeType; //判断是不是真的元素，还是虚拟dom
    if (isRealElement) {
      //初次渲染
      var elm = oldVNode; //改名

      var parentEle = elm.parentNode; //拿到父元素

      var newElm = createElm(vNode);
      parentEle.insertBefore(newElm, elm.nextSibling);
      parentEle.removeChild(elm);
      return newElm;
    } else {
      //修改渲染
      //diff算法

      //1.两个节点不是同一个节点，直接删除老的换新的
      //2.两个节点是同一个节点（key和tag是相同的），属性是否相同(复用老的属性，添加新的属性)
      //3.比较儿子
      patchVnode(oldVNode, vNode);
    }
    function patchVnode(oldVNode, vNode) {
      //不相同元素
      if (!isSameVNode(oldVNode, vNode)) {
        var _el = createElm(vNode);
        oldVNode.el.parentNode.replaceChild(_el, oldVNode.el); //相同，老的换新的
        return _el;
      }
      //相同元素
      var el = vNode.el = oldVNode.el; //直接复用老的节点元素
      if (!oldVNode.tag) {
        //文本情况，tag是undefined
        if (oldVNode.text !== vNode.text) {
          el.textContent = vNode.text;
        }
      }
      //是标签
      patchProps(el, oldVNode.data, vNode.data);

      //比较儿子节点
      //1. 有一方没儿子
      //2. 两方都有儿子
      var oldChildren = oldVNode.children || [];
      var newChildren = vNode.children || [];
      if (oldChildren.length > 0 && newChildren.length > 0) {
        //都有儿子
        updateChildren(el, oldChildren, newChildren);
      } else if (newChildren.length > 0) {
        //老的没儿子，新的有
        mountChildren(el, newChildren);
      } else if (oldChildren.length > 0) {
        el.innerHTML = ''; //写的简单了，建议循环
      }
      return el;
    }
    function mountChildren(el, newChildren) {
      for (var i = 0; i < newChildren.length; i++) {
        //把子节点循环加进去
        var child = newChildren[i];
        el.appendChild(createElm(child));
      }
    }

    // diff算法
    function updateChildren(el, oldChildren, newChildren) {
      var oldStartIndex = 0;
      var newStartIndex = 0;
      var oldEndIndex = oldChildren.length - 1;
      var newEndIndex = newChildren.length - 1;
      var oldStartVnode = oldChildren[0];
      var newStartVnode = newChildren[0];
      var oldEndVnode = oldChildren[oldEndIndex];
      var newEndVnode = newChildren[newEndIndex];
      while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        if (isSameVNode(oldStartVnode, newStartVnode)) {
          //如果两个头孩子相同
          patchVnode(oldStartVnode, newStartVnode); //递归比较子节点
          oldStartVnode = oldChildren[++oldStartIndex];
          newStartVnode = newChildren[++newStartIndex];
        } else if (isSameVNode(oldEndVnode, newEndVnode)) {
          //如果两个尾孩子相同
          patchVnode(oldEndVnode, newEndVnode); //递归比较子节点
          oldEndVnode = oldChildren[--oldEndIndex];
          newEndVnode = newChildren[--newEndIndex];
        } else if (isSameVNode(oldEndVnode, newStartVnode)) {
          //如果头头，尾尾都不同，但是新头老尾相同
          patchVnode(oldEndVnode, newStartVnode); //递归比较子节点
          el.insertBefore(oldEndVnode.el, oldStartVnode.el); //把老尾巴移到老头
          oldEndVnode = oldChildren[--oldEndIndex];
          newStartVnode = newChildren[++newStartIndex];
        } else if (isSameVNode(oldStartVnode, newEndVnode)) {
          //如果头头，尾尾都不同，但是老头新尾相同
          patchVnode(oldStartVnode, newEndVnode); //递归比较子节点
          el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); //把老头移到老尾巴
          oldStartVnode = oldChildren[++oldStartIndex];
          newEndVnode = newChildren[--newEndIndex];
        }
      }
      //如果此时跳出循环的时候，新元素的节点还有多的，那就说明新的多余老的，要插入.两种情况，后面多和前面多
      if (newStartIndex <= newEndIndex) {
        for (var i = newStartIndex; i <= newEndIndex; i++) {
          var childEl = createElm(newChildren[i]);
          var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null;
          el.insertBefore(childEl, anchor); //anchor为null的话就是appendChild
        }
      }
      //如果此时跳出循环的时候，老元素的节点还有多的，那就说明新的少余老的，要删老的
      if (oldStartIndex <= oldEndIndex) {
        for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
          var _childEl = oldChildren[_i].el;
          el.removeChild(_childEl);
        }
      }
    }
  }

  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vNode) {
      var vm = this;
      var el = vm.$el;
      var prevVnode = vm.vNode = vm._vNode;
      vm._vNode = vNode; //第一次产生的虚拟节点保存起来
      //核心，将虚拟dom转换成真实dom，有初始化和更新的功能

      if (prevVnode) {
        //有值就不是第一次
        patch(prevVnode, vNode);
      } else {
        vm.$el = patch(el, vNode); //把vNode转换成真实dom替换el,并且保存起来最新的
      }
    };

    //字符串_c('div',{},...children)这类似的
    Vue.prototype._c = function () {
      //我们写的render从字符串被转成函数以后会解释成有个_c方法，所以我们要自己写，不然会显示没有这个方法
      return createElementVCNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    //_v(text)这样式的
    Vue.prototype._v = function () {
      //我们写的render从字符串被转成函数以后会解释成有个_v方法，所以我们要自己写，不然会显示没有这个方法
      return createTextVVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments))); //this就是vm
    };
    Vue.prototype._s = function (value) {
      //我们写的render从字符串被转成函数以后会解释成有个_s方法，所以我们要自己写，不然会显示没有这个方法
      if (_typeof(value) !== 'object') return value;
      return JSON.stringify(value);
    };
    Vue.prototype._render = function () {
      var vm = this;

      // 因为写render的时候用了with，所以会从实例取值，实例就是vm，这样我们就把实例和视图绑定了
      return vm.$options.render.call(vm); //调用自己写的render函数，指向vm，因为vm有数据
    };
  }
  function mountComponent(vm, el) {
    vm.$el = el;
    var updateComponent = function updateComponent() {
      //1.调用render产生虚拟dom
      //2.根据虚拟dom产生真实dom
      vm._update(vm._render());
    };
    //把初渲染和更新渲染放到观察者里
    var watcher = new Watcher(vm, updateComponent, true);
    console.log(watcher);
  }

  //vue的初始化功能，匿名函数方式
  function initMxin(Vue) {
    //在Vue的原型上直接声明init
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = mergeOpions(this.constructor.options, options); //把options直接放在Vue实例里，后面方便用
      console.log(vm.$options);

      // 初始化状态
      initState(vm);

      //判断用户有没有传el
      if (options.el) {
        vm.$mount(options.el); //数据挂载
      }
    };
    Vue.prototype.$mount = function (el) {
      var vm = this;
      var ops = vm.$options;
      el = document.querySelector(el); //el是#app，需要获取一下
      console.log(el);
      if (!ops.rander) {
        var template;
        if (!ops.template && el) {
          //如果用户没有写render和template，那么就用外部的el
          template = el.outerHTML;
        } else {
          template = ops.template;
        }
        //如果经过一轮判断，template有值
        if (template) {
          // 对模板进行编译
          var render = compileToFunction(template);
          ops.render = render;
        }
      }
      mountComponent(vm, el); //组件的挂载
    };
  }

  //Vue的构造方法
  function Vue(options) {
    //options就是用户写的东西
    //init方法已经在initMixin里通过原型链创建
    this._init(options);
  }

  //运行initMxin，这样就在Vue原型创建了一个函数，Vue可以直接用
  initMxin(Vue);

  //渲染虚拟dom变成真实dom和挂载
  initLifeCycle(Vue);

  //mixin
  initGlobalAPI(Vue);

  //watch和nextTick
  initStateMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
