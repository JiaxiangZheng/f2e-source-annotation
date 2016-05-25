## 源码预处理：

由于 React 中代码的模块引入都是使用 `react('component')` 的方式而非相对路径引入，导致很多情况下无法在编辑器中正常地作文件间跳转。此外，最终通过 Gulp 生成的模块文件会通过一个叫 `flatten` 的插件将文件的层级破坏掉，使得所有文件全在同一个目录下，这会导致阅读源代码的时候不能很好的按目录结构进行功能划分。而且最终打包出来的代码也难以通过 source-map 反映出源文件。因此有必要对 React 的打包工具作一定的预处理。

直接看项目根目录的 `gulpfile.js` 不难发现，`gulp react:modules` 本质上就是输入源代码，对源代码中所有的 `__DEV__` 条件判断作一个替换，变成 `process.env.NODE_ENV !== 'production'`；然后将源码中相应的 `require('A')` 变成 `require('./A')` 的形式（仅对引入非 `node_modules` 的情况作这样的处理），最后把所有模块的目录层级展开变成一个文件夹下的文件。这也是为何 React 可以使用 `require('react/lib/ReactDOM')` 这种方式。

所以，要做的事情很简单，只要在 `require` 路径替换阶段作一定的修正就可以了。从 `gulpfile` 中不难看出，它引入了 `fbjs-scripts/babel/rewrite-modules` 这个 babel 插件，在 babel 将源码转成 AST 以后作一个路径替换的处理，我们只需要修改路径替换的逻辑即可。

直接使用 `find ./src/ -name "*.js" | grep -v "__tests__"` 生成所有源码全路径名，通过一定的预处理就可以得到文件名到文件路径的映射，在 `fbjs-scripts/babel/rewrite-modules` 中读取这个映射并通过 `path.relative` 计算出源文件相对其引入文件的地址，作为替换的路径插入源码中。

预处理代码：

```
function computeRelativePath(filePaths) {
  var fileMapper = {};
  filePaths.forEach(function (file) {
    fileMapper[path.basename(file).replace(/\.js$/, '')] = file;
  });
  require('fs').writeFile('./module.json', JSON.stringify(fileMapper, 4, 4), function (err) {
    if (err) throw err;
    console.log('It\'s saved!');
  });
}
```

在 `mapModule` 方法中：

```javascript
if (process.env.NODE_ENV !== 'test') {
	var modulePrefix = context.state.opts._modulePrefix;
	if (modulePrefix == null) {
	  if (!modulePathMap[module]) {
	    console.warn('could not found', module, 'for', context.state.opts.sourceFileName);
	    modulePrefix = './';
	  } else {
	    var prefixAbsolute = './';
	    var source = prefixAbsolute + context.state.opts.sourceFileName;
	    var dest = prefixAbsolute + modulePathMap[module];
	    var res = path.relative(path.dirname(source), path.dirname(dest));
	    if (!/^\./.test(res)) {
	      res = './' + res;
	    }
	    if (!/\/$/.test(res)) {
	      res += '/';
	    }
	    // console.log(source, dest, res);
	    modulePrefix = res;
	  }
	}
}
```


最后，browserify 打包生成一个带 source-map 的 bundle 文件：

```bash
browserify source/React.js --standalone React --debug -o build/react-bundle.js
```

## 源码分析

从 `React.js` 文件入口，暂时忽略掉 `__REACT_DEVTOOLS_GLOBAL_HOOK__` 相关的内容。

`ReactDOM.js`:
 
- `findDOMNode` 用于从 React 组件获取其对应的真实 DOM 元素，ReactMount.getNodeFromInstance 会作缓存
- 使用默认系统组件进行注入 `ReactDefaultInjection`，这里可以看作 ReactDOM 真正核心的入口
- ReactClass 中提供了创建 ReactComponent 的方法 `createClass`，一个ReactComponent 所包含的方法也在这个文件中被声明（`ReactClassInterface`）

**事件系统框架图**：

```
/*
 * `ReactBrowserEventEmitter` 事件处理架构:
 *
 *  - 原生浏览器端事件最终会被代理到顶层接口， 由支持注入插件式的 ReactEventListener 负责监听。
 *  - 对原生事件，规范化并去重事件以规避某些浏览器怪异行为。
 *  - 将原生事件转发到 `EventPluginHub` 上，由它负责通知对应的 `dispatches` 然后分发事件。
 * 
 * 整体的框架图如下所示：
 *  
 * +------------+    .
 * |    DOM     |    .
 * +------------+    .
 *       |           .
 *       v           .
 * +------------+    .
 * | ReactEvent |    .
 * |  Listener  |    .
 * +------------+    .                         +-----------+
 *       |           .               +--------+|SimpleEvent|
 *       |           .               |         |Plugin     |
 * +-----|------+    .               v         +-----------+
 * |     |      |    .    +--------------+                    +------------+
 * |     +-----------.--->|EventPluginHub|                    |    Event   |
 * |            |    .    |              |     +-----------+  | Propagators|
 * | ReactEvent |    .    |              |     |TapEvent   |  |------------|
 * |  Emitter   |    .    |              |<---+|Plugin     |  |other plugin|
 * |            |    .    |              |     +-----------+  |  utilities |
 * |     +-----------.--->|              |                    +------------+
 * |     |      |    .    +--------------+
 * +-----|------+    .                ^        +-----------+
 *       |           .                |        |Enter/Leave|
 *       +           .                +-------+|Plugin     |
 * +-------------+   .                         +-----------+
 * | application |   .
 * |-------------|   .
 * |             |   .
 * |             |   .
 * +-------------+   .
 *                   .
 */
```

EventLister 中执行具体的 DOM 事件监听处理。


`renderers/shared/reconciler/ReactCompositeComponent.js` 中定义了组件的生命周期：

```
------------------ The Life-Cycle of a Composite Component ------------------

- constructor: Initialization of state. The instance is now retained.
  - componentWillMount
  - render
  - [children's constructors]
    - [children's componentWillMount and render]
    - [children's componentDidMount]
    - componentDidMount

      Update Phases:
      - componentWillReceiveProps (only called if parent updated)
      - shouldComponentUpdate
        - componentWillUpdate
          - render
          - [children's constructors or receive props phases]
        - componentDidUpdate

    - componentWillUnmount
    - [children's componentWillUnmount]
  - [children destroyed]
- (destroyed): The instance is now blank, released by React and ready for GC.
```


一个简短的 React 源码分析：<http://purplebamboo.github.io/2015/09/15/reactjs_source_analyze_part_one/>
